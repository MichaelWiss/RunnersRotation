console.log('[bootstrap] Loading server.mjs ...');
import {createRequestHandler} from '@react-router/express';
// Load .env in production too so local `npm start` picks it up (dev already uses nodemon --require dotenv/config)
if (process.env.NODE_ENV === 'production') {
  try { await import('dotenv/config'); } catch {}
}
import compression from 'compression';
import express from 'express';
import morgan from 'morgan';
import {createStorefrontClient, InMemoryCache} from '@shopify/hydrogen';
import {loadEnv, logEnvSummary} from './env.mjs';
import {attachProcessHooks, attachRequestTiming, createWatchdog, wrapStorefront} from './instrumentation.mjs';
import {getContext} from './context.mjs';
import {createBuildResolver} from './build-loader.mjs';



const {env: loadedEnv, missing} = loadEnv();
if (missing.length) {
  console.warn('[env] Missing required vars at bootstrap:', missing.join(', '));
  // Provide a clearer hard failure so Hydrogen doesn't throw later in createStorefrontClient.
  // Fail early with remediation steps.
  console.error('\n[env] FATAL: Required environment variables are missing.');
  console.error('Add them to a .env file or your process environment:');
  console.error('  PUBLIC_STORE_DOMAIN=your-shop.myshopify.com');
  console.error('  PUBLIC_STOREFRONT_API_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
  console.error('  SESSION_SECRET=some-long-random-string');
  console.error('\nExample:');
  console.error('  echo "PUBLIC_STORE_DOMAIN=example-shop.myshopify.com" >> .env');
  console.error('  echo "PUBLIC_STOREFRONT_API_TOKEN=shpat_..." >> .env');
  console.error('  echo "SESSION_SECRET=$(openssl rand -hex 32)" >> .env');
  // Exit only if running as a standalone server (avoid crashing serverless warm start). 
  if (!process.env.VERCEL) {
    process.exit(1);
  }
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
  serverBuildPromise = import('./build/server/index.js')
    .then((mod) => {
      console.log('[warmup] server build loaded');
      return mod;
    })
    .catch((e) => {
      console.error('[warmup] failed to load server build', e);
      throw e;
    });
}
const resolveBuild = createBuildResolver({isProd, vite, preloadPromise: serverBuildPromise});

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
  const context = await getContext(req, env, debugEnabled, wrapStorefront);
  let finalizeWatchdog = () => {};
  if (debugEnabled) {
    finalizeWatchdog = createWatchdog(req, res, 8000);
  }
  try {
    const buildModule = await resolveBuild();
    const build = () => buildModule; // createRequestHandler expects a function returning build
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
}
// AppSession & getContext moved to context.mjs
