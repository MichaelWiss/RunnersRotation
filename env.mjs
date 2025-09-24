// Centralized environment loading & validation (minimal surface)
// Required for the current app functionality:
//  - PUBLIC_STORE_DOMAIN
//  - PUBLIC_STOREFRONT_API_TOKEN
//  - SESSION_SECRET
// Optional helpers:
//  - DEV_MOCK_PRODUCTS (dev-only mock product fallback)
//  - DEBUG_INSTRUMENTATION (gates verbose diagnostics)
//
// Advanced / future extension (NOT used by code now):
//  If you later adopt multi-storefront or channel specific features you can
//  introduce PUBLIC_STOREFRONT_ID or alternative tokens in a follow-up change.

const raw = process.env;

const REQUIRED = ['PUBLIC_STORE_DOMAIN', 'PUBLIC_STOREFRONT_API_TOKEN', 'SESSION_SECRET'];
const OPTIONAL = ['DEV_MOCK_PRODUCTS', 'DEBUG_INSTRUMENTATION'];

export function loadEnv() {
  const missing = REQUIRED.filter((k) => !raw[k]);
  const env = {
    PUBLIC_STORE_DOMAIN: raw.PUBLIC_STORE_DOMAIN,
    PUBLIC_STOREFRONT_API_TOKEN: raw.PUBLIC_STOREFRONT_API_TOKEN,
    SESSION_SECRET: raw.SESSION_SECRET,
    DEV_MOCK_PRODUCTS: raw.DEV_MOCK_PRODUCTS,
    DEBUG_INSTRUMENTATION: raw.DEBUG_INSTRUMENTATION,
  };
  return {env, missing, optionalUnset: OPTIONAL.filter((k) => !raw[k])};
}

export function logEnvSummary(summaryLoggedFlag = '__RR_ENV_LOGGED__') {
  if (global[summaryLoggedFlag]) return;
  const {missing, optionalUnset} = loadEnv();
  if (missing.length) {
    console.warn('[env] Missing required:', missing.join(', '));
  } else {
    console.log('[env] Required env vars present');
  }
  if (optionalUnset.length) {
    console.log('[env] Optional not set:', optionalUnset.join(', '));
  }
  global[summaryLoggedFlag] = true;
}
