(function(){
  try {
    var g = self || window;
    var hasReadable = typeof g.ReadableStream === 'function';
    var proto = hasReadable && g.ReadableStream && g.ReadableStream.prototype;
    var hasPipeThrough = !!(proto && proto.pipeThrough);
    var hasTransform = typeof g.TransformStream === 'function';
    if (hasReadable && hasPipeThrough && hasTransform) {
      return;
    }
    document.write('<script src="/polyfills/web-streams-polyfill.js"><\\/script>');
  } catch (error) {
    // Swallow – polyfill is best-effort.
  }
})();
