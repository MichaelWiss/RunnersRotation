let polyfillPromise: Promise<void> | null = null;

function needsPolyfill() {
  const readable = globalThis.ReadableStream;
  const transform = globalThis.TransformStream;
  return (
    typeof readable !== 'function' ||
    typeof transform !== 'function' ||
    typeof readable.prototype?.pipeThrough !== 'function'
  );
}

export function ensureWebStreams(): Promise<void> {
  if (!needsPolyfill()) return Promise.resolve();
  if (!polyfillPromise) {
    polyfillPromise = import('web-streams-polyfill/polyfill').then(() => undefined);
  }
  return polyfillPromise;
}
