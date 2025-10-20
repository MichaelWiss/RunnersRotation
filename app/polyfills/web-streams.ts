import {ReadableStream as PonyfillReadableStream, TransformStream as PonyfillTransformStream} from 'web-streams-polyfill';

function isMissing(key: keyof typeof globalThis) {
  return typeof globalThis[key] === 'undefined';
}

export function polyfillWebStreamsIfNeeded() {
  if (isMissing('ReadableStream')) {
    globalThis.ReadableStream = PonyfillReadableStream as unknown as typeof globalThis.ReadableStream;
  }

  if (isMissing('TransformStream')) {
    globalThis.TransformStream = PonyfillTransformStream as unknown as typeof globalThis.TransformStream;
  }
}
