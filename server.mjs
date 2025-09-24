console.log('[bootstrap] Loading server.mjs ...');
import {createRequestHandler} from '@react-router/express';
import {createCookieSessionStorage} from 'react-router';
import compression from 'compression';
import express from 'express';
import morgan from 'morgan';
import {createStorefrontClient, InMemoryCache} from '@shopify/hydrogen';
import crypto from 'node:crypto';
import {loadEnv, logEnvSummary} from './env.mjs';
import {attachProcessHooks, attachRequestTiming, createWatchdog, wrapStorefront} from './instrumentation.mjs';



const {env: loadedEnv, missing} = loadEnv();
if (missing.length) {
  console.warn('[env] Missing required vars at bootstrap:', missing.join(', '));
}
const env = loadedEnv;
// Log summary once at bootstrap (was previously done per-request in getContext)
logEnvSummary();

const isProd = process.env.NODE_ENV === 'production';
const vite =
  isProd
    ? undefined
    : await import('vite').then(({createServer}) =>
        createServer({
          server: {middlewareMode: true},
        }),
      );

// Preload server build once in production to avoid per-request dynamic import cost.
let serverBuildPromise;
if (isProd) {
  serverBuildPromise = import('./build/server/index.js').then((mod) => {
    console.log('[warmup] server build loaded');
    return mod;
  }).catch((e) => {
    console.error('[warmup] failed to load server build', e);
    throw e;
  });
}

export const app = express();
console.log('[bootstrap] Express app created');

// Instrumentation gating
const debugEnabled = env.DEBUG_INSTRUMENTATION === '1';
if (debugEnabled) {
  attachProcessHooks();
  attachRequestTiming(app);
}

// Storefront API preflight (debug mode) – lean & only uses required vars
if (debugEnabled) {
  (async () => {
    try {
      if (!env.PUBLIC_STORE_DOMAIN || !env.PUBLIC_STOREFRONT_API_TOKEN) {
        console.warn('[preflight] Skipping Storefront API check (missing domain or token)');
        return;
      }
      const {storefront: pfStorefront} = createStorefrontClient({
        cache: new InMemoryCache(),
        waitUntil: null,
        i18n: {language: 'EN', country: 'US'},
        publicStorefrontToken: env.PUBLIC_STOREFRONT_API_TOKEN,
        storeDomain: env.PUBLIC_STORE_DOMAIN,
      });
      const started = performance.now();
      const result = await pfStorefront.query(`#graphql\n        query PreflightShopInfo { shop { name } }\n      `);
      const dur = (performance.now() - started).toFixed(1);
      if (result?.shop?.name) {
        console.log(`[preflight] Storefront API OK (${dur}ms) shop.name="${result.shop.name}"`);
      } else if (result?.errors?.length) {
        console.warn('[preflight] Storefront API errors:', JSON.stringify(result.errors));
      } else {
        console.warn('[preflight] Storefront API unexpected response');
      }
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      const msg = err.message;
      const cause = (err && 'cause' in err && err.cause) ? String(err.cause) : '';
      const accessDenied = msg.includes('ACCESS_DENIED') || cause.includes('ACCESS_DENIED') || msg.includes('403');
      if (accessDenied) {
        console.error('[preflight] 403 ACCESS_DENIED');
        console.error('[preflight] Fix steps:\n' +
          ' 1. PUBLIC_STORE_DOMAIN must equal your myshopify domain (no protocol).\n' +
          ' 2. Use the Storefront API access token from your custom app (Storefront API integration).\n' +
          ' 3. Do not use an Admin API token.\n' +
          ' 4. If token was regenerated, redeploy so the new value is active.');
      } else {
        console.error('[preflight] Storefront API preflight failed:', err);
      }
    }
  })();
}

app.use(compression());

// (Per-request timing now handled only when debugEnabled)

// http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
app.disable('x-powered-by');

// handle asset requests
if (vite) {
  app.use(vite.middlewares);
} else {
  // add morgan here for production only
  // dev uses morgan plugin, otherwise it spams the console with HMR requests
  app.use(morgan('tiny'));
  app.use(
    '/assets',
    express.static('build/client/assets', {immutable: true, maxAge: '1y'}),
  );
}
app.use(express.static('build/client', {maxAge: '1h'}));

if (debugEnabled) {
  app.get('/__health', (req, res) => {
    const keys = [ 'PUBLIC_STORE_DOMAIN', 'PUBLIC_STOREFRONT_API_TOKEN', 'SESSION_SECRET', 'DEV_MOCK_PRODUCTS', 'DEBUG_INSTRUMENTATION' ];
    const envPresence = Object.fromEntries(keys.map((k) => [k, env[k] ? true : false]));
    res.json({
      ok: true,
      env: envPresence,
      nodeEnv: process.env.NODE_ENV,
      debug: true,
      timestamp: new Date().toISOString(),
    });
  });

  // First-chunk logger to diagnose blank HTML (debug only)
  app.use((req, res, next) => {
    if (req.method !== 'GET') return next();
    let logged = false;
    const originalWrite = res.write.bind(res);
    res.write = function (chunk, encoding, cb) {
      if (!logged) {
        try {
          const preview = Buffer.isBuffer(chunk) ? chunk.toString('utf8') : String(chunk);
          console.log('[ssr.first-chunk]', preview.replace(/\s+/g, ' ').slice(0, 180));
        } catch {}
        logged = true;
      }
      return originalWrite(chunk, encoding, cb);
    };
    next();
  });
}

app.all('*', async (req, res, next) => {
  const context = await getContext(req);
  let finalizeWatchdog = () => {};
  if (debugEnabled) {
    finalizeWatchdog = createWatchdog(req, res, 8000);
  }
  try {
    const build = vite
      ? () => vite.ssrLoadModule('virtual:react-router/server-build')
      : isProd
        ? await serverBuildPromise
        : await import('./build/server/index.js');
    await createRequestHandler({
      build,
      mode: process.env.NODE_ENV,
      getLoadContext: () => context,
    })(req, res, (err) => {
      if (err) return next(err);
      next();
    });
  } catch (e) {
    console.error('[handler.error]', e);
    if (!res.headersSent) res.status(500).send('Internal Server Error');
  } finally {
    finalizeWatchdog();
  }
});
const port = process.env.PORT || 3000;

// On Vercel (serverless), exporting `app` is enough; avoid starting a server.
if (!process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`[bootstrap] Express server listening on port ${port}`);
  });
} else {
  console.log('[bootstrap] Running in Vercel serverless mode (no listen)');
}

async function getContext(req) {
  const session = await AppSession.init(req, [env.SESSION_SECRET]);

  // Derive buyer IP safely (serverless environments may not have req.connection)
  const forwardedFor = req.headers['x-forwarded-for'];
  let buyerIp = '';
  if (Array.isArray(forwardedFor)) {
    buyerIp = forwardedFor[0];
  } else if (typeof forwardedFor === 'string' && forwardedFor.length) {
    buyerIp = forwardedFor.split(',')[0].trim();
  } else {
    buyerIp = req.socket?.remoteAddress || req.connection?.remoteAddress || '';
  }

  const storefrontConfig = {
    // A [`cache` instance](https://developer.mozilla.org/en-US/docs/Web/API/Cache) is necessary for sub-request caching to work.
    // We provide only an in-memory implementation
    cache: new InMemoryCache(),
    // `waitUntil` is only needed on worker environments. For Express/Node, it isn't applicable
    waitUntil: null,
    i18n: {language: 'EN', country: 'US'},
    publicStorefrontToken: env.PUBLIC_STOREFRONT_API_TOKEN,
    storeDomain: env.PUBLIC_STORE_DOMAIN,
    storefrontHeaders: {
      requestGroupId: crypto.randomUUID(),
      buyerIp,
      cookie: req.get('cookie'),
    },
  };
  let {storefront} = createStorefrontClient(storefrontConfig);
  if (debugEnabled) {
    storefront = wrapStorefront(storefront);
  }
  return {session, storefront, env};
}

class AppSession {
  constructor(sessionStorage, session) {
    this.sessionStorage = sessionStorage;
    this.session = session;
  }

  static async init(request, secrets) {
    const storage = createCookieSessionStorage({
      cookie: {
        name: 'session',
        httpOnly: true,
        path: '/',
        sameSite: 'lax',
        secrets,
      },
    });

    const session = await storage
      .getSession(request.get('Cookie'))
      .catch(() => storage.getSession());

    return new this(storage, session);
  }

  get(key) {
    return this.session.get(key);
  }

  destroy() {
    return this.sessionStorage.destroySession(this.session);
  }

  flash(key, value) {
    this.session.flash(key, value);
  }

  unset(key) {
    this.session.unset(key);
  }

  set(key, value) {
    this.session.set(key, value);
  }

  commit() {
    return this.sessionStorage.commitSession(this.session);
  }
}
