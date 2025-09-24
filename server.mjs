console.log('[bootstrap] Loading server.mjs ...');
import {createRequestHandler} from '@react-router/express';
// Unified .env loading strategy: always try .env.local first (override), then .env.
// This mirrors popular frameworks (Next.js, Remix) and allows you to keep secrets out of the base .env committed file.
// If dev script already injected dotenv/config this is harmless (config is idempotent; override rules preserved).
try {
  const [{config}, fs] = await Promise.all([
    import('dotenv'),
    import('fs')
  ]);
  let loadedAny = false;
  if (fs.existsSync('.env.local')) {
    config({path: '.env.local', override: true});
    console.log('[env] loaded .env.local');
    loadedAny = true;
  }
  if (fs.existsSync('.env')) {
    // Do not override anything already set by .env.local or actual process env
    config({path: '.env', override: false});
    console.log('[env] loaded .env');
    loadedAny = true;
  }
  if (!loadedAny) {
    console.log('[env] no .env or .env.local file present (relying on process environment)');
  }
} catch (e) {
  // Swallow – dotenv is a tiny helper; absence shouldn't crash server.
  console.warn('[env] dotenv load skipped:', e?.message || e);
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
const envMissing = missing.length > 0;
if (envMissing) {
  console.warn('[env] Missing required vars at bootstrap:', missing.join(', '));
  console.warn('[env] The server will start in LIMITED mode and show a guidance page until you add them.');
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
const debugEnabled = !envMissing && env.DEBUG_INSTRUMENTATION === '1';
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
if (envMissing) {
  app.get('*', (req, res) => {
    res.status(500).send(`<!doctype html><html><head><meta charset='utf-8'><title>Missing env</title><style>body{font-family:system-ui;padding:40px;line-height:1.5;max-width:640px;margin:0 auto;}code{background:#eee;padding:2px 4px;border-radius:4px;}</style></head><body><h1>Configuration Required</h1><p>The server started but required environment variables are missing.</p><p>Add a <code>.env</code> file with:</p><pre style='background:#f7f7f7;padding:12px;border:1px solid #ddd;border-radius:6px;'>PUBLIC_STORE_DOMAIN=your-shop-name.myshopify.com
PUBLIC_STOREFRONT_API_TOKEN=your_storefront_api_access_token
SESSION_SECRET=$(openssl rand -hex 32)</pre><p>Then restart: <code>npm start</code>.</p><p>Missing: <strong>${missing.join(', ')}</strong></p></body></html>`);
  });
} else {
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
