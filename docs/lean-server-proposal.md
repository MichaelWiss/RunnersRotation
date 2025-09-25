# Lean `server.mjs` proposal

## Objectives
- Keep server bootstrap predictable for serverless targets (Vercel) and local dev.
- Remove optional instrumentation hooks from the hot path and expose them behind a single flag.
- Rely on the build resolver + context helpers already extracted, but wire them in with minimal logic.
- Ensure static file handling continues to work for both Vite dev and production builds.

## Suggested structure

1. **Imports & early env guard**
   ```js
   import express from 'express';
   import compression from 'compression';
   import {createRequestHandler} from '@react-router/express';
   import {createBuildResolver} from './build-loader.mjs';
   import {getContext} from './context.mjs';
   import {loadEnv, logEnvSummary} from './env.mjs';
   ```

2. **Environment loading**
   ```js
   const {env, missing} = loadEnv();
   if (missing.length) { ... render guidance page ... }
   logEnvSummary();
   ```

3. **Vite dev vs production build resolution**
   ```js
   const isProd = process.env.NODE_ENV === 'production';
   const vite = isProd ? undefined : await import('vite').then(({createServer}) => createServer({server: {middlewareMode: true}}));
   const resolveBuild = createBuildResolver({isProd, vite});
   ```

4. **Express app wiring**
   ```js
   const app = express();
   app.disable('x-powered-by');
   app.use(compression());
   if (vite) {
     app.use(vite.middlewares);
   } else {
     app.use('/assets', express.static('build/client/assets', {immutable: true, maxAge: '1y'}));
     app.use(express.static('build/client', {maxAge: '1h'}));
     app.use(express.static('public', {maxAge: '1h'}));
   }
   ```

5. **Request handler**
   ```js
   app.all('*', async (req, res, next) => {
     if (missing.length) return renderMissingEnv(res, missing);
     try {
       const context = await getContext(req, env, false /* instrumentation disabled by default */);
       const buildModule = await resolveBuild();
       const handler = createRequestHandler({build: () => buildModule, mode: process.env.NODE_ENV, getLoadContext: () => context});
       return handler(req, res, next);
     } catch (error) {
       console.error('[ssr]', error);
       if (!res.headersSent) res.status(500).send('Internal Server Error');
     }
   });
   ```

6. **Export for Vercel + local listen**
   ```js
   export const app = expressInstance;
   if (!process.env.VERCEL) {
     const port = process.env.PORT || 3000;
     app.listen(port, () => console.log(`[bootstrap] Listening on ${port}`));
   }
   ```

## Instrumentation hook (optional)
Expose a single `enableInstrumentation(app, env)` helper that the user can opt into by setting `DEBUG_INSTRUMENTATION=1`. Keep watchers, preflight checks, and request timing inside that helper so the main file stays short.

## Next steps
- Confirm this layout matches user expectations.
- Once approved, refactor `server.mjs` accordingly and move instrumentation helpers into `instrumentation.mjs`.
- Validate with `npm run build` and local `npm run dev` to ensure parity.
