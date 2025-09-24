// Instrumentation helpers gated by DEBUG_INSTRUMENTATION

export function attachProcessHooks() {
  if (global.__RR_PROCESS_HOOKS__) return;
  process.on('unhandledRejection', (reason) => {
    console.error('[unhandledRejection]', reason);
  });
  process.on('uncaughtException', (err) => {
    console.error('[uncaughtException]', err);
  });
  global.__RR_PROCESS_HOOKS__ = true;
}

export function attachRequestTiming(app) {
  app.use((req, res, next) => {
    const start = performance.now();
    res.on('finish', () => {
      const dur = (performance.now() - start).toFixed(1);
      console.log(`[req] ${req.method} ${req.originalUrl} -> ${res.statusCode} ${dur}ms`);
    });
    next();
  });
}

export function createWatchdog(req, res, timeoutMs = 8000) {
  let warned = false;
  const id = setInterval(() => {
    warned = true;
    console.warn('[watchdog] long-running request >' + timeoutMs + 'ms', req.method, req.originalUrl);
  }, timeoutMs);
  const clear = () => clearInterval(id);
  res.on('close', clear);
  res.on('finish', clear);
  return () => {
    if (warned) console.warn('[watchdog] completed long request', req.method, req.originalUrl);
  };
}

export function wrapStorefront(storefront) {
  const original = storefront.query.bind(storefront);
  storefront.query = async function instrumented(doc, options) {
    const start = performance.now();
    try {
      const result = await original(doc, options);
      const dur = (performance.now() - start).toFixed(1);
      if (result?.errors?.length) {
        console.error('[storefront.errors]', JSON.stringify(result.errors));
      }
      console.log('[storefront.query]', (options?.variables && Object.keys(options.variables)) || 'no-vars', dur + 'ms');
      return result;
    } catch (e) {
      const dur = (performance.now() - start).toFixed(1);
      console.error('[storefront.query.failed]', e, dur + 'ms');
      throw e;
    }
  };
  return storefront;
}
