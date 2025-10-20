import {defineConfig} from 'vite';
import {hydrogen} from '@shopify/hydrogen/vite';
import {reactRouter} from '@react-router/dev/vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [hydrogen(), reactRouter(), tsconfigPaths()],
  /**
   * Downlevel output so Safari < 16 (including iOS 15) can parse the bundles.
   * Without this, optional chaining/nullish coalescing shipped as ESNext
   * causes parse failures that surface as "Application Error" on navigation.
   */
  optimizeDeps: {
    esbuildOptions: {
      target: 'safari13',
    },
  },
  build: {
    // Allow a strict Content-Security-Policy
    // without inlining assets as base64:
    assetsInlineLimit: 0,
    target: ['es2019', 'safari13'],
  },
  ssr: {
    optimizeDeps: {
      /**
       * Include dependencies here if they throw CJS<>ESM errors.
       * For example, for the following error:
       *
       * > ReferenceError: module is not defined
       * >   at /Users/.../node_modules/example-dep/index.js:1:1
       *
       * Include 'example-dep' in the array below.
       * @see https://vitejs.dev/config/dep-optimization-options
       */
      include: [],
    },
  },
});
