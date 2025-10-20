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
    var currentScript = document.currentScript;
    var nonce = currentScript && currentScript.nonce ? currentScript.nonce : '';
    var nonceAttr = nonce ? ' nonce="' + nonce.replace(/"/g, '&quot;') + '"' : '';
    document.write('<script' + nonceAttr + ' src="/polyfills/web-streams-polyfill.js"><\\/script>');
  } catch (error) {
    // Polyfill is best-effort; ignore failures.
  }
})();
