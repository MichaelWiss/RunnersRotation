// Unified build resolver for React Router server build
// Handles vite middleware mode in development and preloaded build in production.

export function createBuildResolver({isProd, vite, preloadPromise}) {
  // preloadPromise: resolved production build (server build module)
  return async function resolveBuild() {
    if (vite) {
      // Vite dev server provides a virtual module for server build
      return vite.ssrLoadModule('virtual:react-router/server-build');
    }
    if (isProd) {
      return preloadPromise; // already a module
    }
    // Fallback (production like mode without preload) – dynamic import
    return import('./build/server/index.js');
  };
}
