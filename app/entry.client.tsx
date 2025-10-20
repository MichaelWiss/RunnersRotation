/**
 * By default, Remix will handle hydrating your app on the client for you.
 * You are free to delete this file if you'd like to, but if you ever want it revealed again, you can run `npx remix reveal` ✨
 * For more information, see https://remix.run/file-conventions/entry.client
 */

import 'web-streams-polyfill/polyfill';
import {startTransition, StrictMode} from 'react';
import {hydrateRoot} from 'react-dom/client';
import {HydratedRouter} from 'react-router/dom';

declare global {
  interface Window {
    __rrHydrationConfirm?: () => void;
    __rrHydrationShowBanner?: (message: string) => void;
  }
}

startTransition(() => {
  try {
    const root = hydrateRoot(
      document,
      <StrictMode>
        <HydratedRouter />
      </StrictMode>,
    );

    queueMicrotask(() => {
      window.__rrHydrationConfirm?.();
    });

    if (import.meta.env.DEV) {
      // Keep a reference alive in dev so we can inspect and avoid unused var warnings.
      (window as unknown as {__rrHydrationRoot?: unknown}).__rrHydrationRoot = root;
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : typeof error === 'string' ? error : 'Unknown hydration error';
    window.__rrHydrationShowBanner?.(
      `Interactive JS crashed during startup: ${message}. Check the console for stack traces.`,
    );
    throw error;
  }
});
