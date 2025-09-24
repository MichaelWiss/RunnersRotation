console.log('[bootstrap] Loading server.mjs ...');
import {createRequestHandler} from '@react-router/express';
import { createCookieSessionStorage} from 'react-router';
import compression from 'compression';
import express from 'express';
import morgan from 'morgan';
import {createStorefrontClient, InMemoryCache} from '@shopify/hydrogen';
import crypto from 'node:crypto';



const env = process.env;

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

app.use(compression());

// Global error + rejection handlers (diagnostics only; remove once stable)
if (!global.__RR_PROCESS_HOOKS__) {
  process.on('unhandledRejection', (reason) => {
    console.error('[unhandledRejection]', reason);
  });
  process.on('uncaughtException', (err) => {
    console.error('[uncaughtException]', err);
  });
  global.__RR_PROCESS_HOOKS__ = true;
}

// Basic per-request timing middleware
app.use((req, res, next) => {
  const start = performance.now();
  res.on('finish', () => {
    const dur = (performance.now() - start).toFixed(1);
    console.log(`[req] ${req.method} ${req.originalUrl} -> ${res.statusCode} ${dur}ms`);
  });
  next();
});

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

// Lightweight health/diagnostic endpoint (do NOT leak secret values)
app.get('/__health', (req, res) => {
  const keys = [
    'PUBLIC_STORE_DOMAIN',
    'PUBLIC_STOREFRONT_API_TOKEN',
    'PRIVATE_STOREFRONT_API_TOKEN',
    'PUBLIC_STOREFRONT_ID',
    'PUBLIC_CHECKOUT_DOMAIN',
    'SESSION_SECRET',
  ];
  const envPresence = Object.fromEntries(
    keys.map((k) => [k, process.env[k] ? true : false]),
  );
  res.json({
    ok: true,
    env: envPresence,
    nodeEnv: process.env.NODE_ENV,
    vercel: Boolean(process.env.VERCEL),
    timestamp: new Date().toISOString(),
  });
});

app.all('*', async (req, res, next) => {
  const context = await getContext(req);

  // Slow request watchdog (warn before 10s Vercel hard timeout)
  let warned = false;
  const watchdog = setInterval(() => {
    warned = true;
    console.warn('[watchdog] long-running request >8s', req.method, req.originalUrl);
  }, 8000);

  const clearWatchdog = () => clearInterval(watchdog);
  res.on('close', clearWatchdog);
  res.on('finish', clearWatchdog);

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
      clearWatchdog();
      if (err) return next(err);
      next();
    });
  } catch (e) {
    clearWatchdog();
    console.error('[handler.error]', e);
    if (!res.headersSent) {
      res.status(500).send('Internal Server Error');
    }
  } finally {
    if (warned) {
      console.warn('[watchdog] completed long request', req.method, req.originalUrl);
    }
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

  // One-time env presence logging to help diagnose production blank screen issues
  if (!global.__RR_ENV_LOGGED__) {
    const missing = [
      'PUBLIC_STORE_DOMAIN',
      'PUBLIC_STOREFRONT_API_TOKEN',
      'PRIVATE_STOREFRONT_API_TOKEN',
      'PUBLIC_STOREFRONT_ID',
      'PUBLIC_CHECKOUT_DOMAIN',
      'SESSION_SECRET',
    ].filter((k) => !env[k]);
    if (missing.length) {
      console.warn('[startup] Missing expected env vars (names only):', missing.join(', '));
    } else {
      console.log('[startup] All expected env vars present');
    }
    global.__RR_ENV_LOGGED__ = true;
  }

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

  const {storefront} = createStorefrontClient({
    // A [`cache` instance](https://developer.mozilla.org/en-US/docs/Web/API/Cache) is necessary for sub-request caching to work.
    // We provide only an in-memory implementation
    cache: new InMemoryCache(),
    // `waitUntil` is only needed on worker environments. For Express/Node, it isn't applicable
    waitUntil: null,
    i18n: {language: 'EN', country: 'US'},
    publicStorefrontToken: env.PUBLIC_STOREFRONT_API_TOKEN,
    privateStorefrontToken: env.PRIVATE_STOREFRONT_API_TOKEN,
    storeDomain: env.PUBLIC_STORE_DOMAIN,
    storefrontId: env.PUBLIC_STOREFRONT_ID,
    storefrontHeaders: {
      requestGroupId: crypto.randomUUID(),
      buyerIp,
      cookie: req.get('cookie'),
    },
  });

  // Wrap storefront.query for timing & error logging
  const originalQuery = storefront.query.bind(storefront);
  storefront.query = async function wrappedQuery(doc, options) {
    const qStart = performance.now();
    try {
      const result = await originalQuery(doc, options);
      const qDur = (performance.now() - qStart).toFixed(1);
      if (result?.errors?.length) {
        console.error('[storefront.errors]', JSON.stringify(result.errors));
      }
      console.log('[storefront.query]', (options?.variables && Object.keys(options.variables)) || 'no-vars', qDur + 'ms');
      return result;
    } catch (e) {
      const qDur = (performance.now() - qStart).toFixed(1);
      console.error('[storefront.query.failed]', e, qDur + 'ms');
      throw e;
    }
  };

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
