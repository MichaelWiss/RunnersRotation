(() => {
  if (typeof window === 'undefined') return;

  const isStorageError = (error) => {
    if (typeof DOMException === 'undefined') return false;
    return (
      error instanceof DOMException &&
      (
        error.name === 'QuotaExceededError' ||
        error.name === 'SecurityError' ||
        error.name === 'InvalidAccessError' ||
        error.name === 'InvalidStateError'
      )
    );
  };

  const createMemoryStorage = () => {
    const map = new Map();
    return {
      setItem(key, value) {
        map.set(String(key), String(value));
      },
      getItem(key) {
        return map.has(String(key)) ? map.get(String(key)) ?? null : null;
      },
      removeItem(key) {
        map.delete(String(key));
      },
      clear() {
        map.clear();
      },
      key(index) {
        if (!Number.isFinite(index)) return null;
        const keys = Array.from(map.keys());
        return keys[Number(index)] ?? null;
      },
      get length() {
        return map.size;
      },
    };
  };

  const installFallback = (name) => {
    let storage;
    try {
      storage = window[name];
      if (!storage) throw new Error('missing');
      const probe = '__rr_storage_probe__';
      storage.setItem(probe, 'ok');
      storage.removeItem(probe);
      return;
    } catch (error) {
      if (!isStorageError(error)) {
        return;
      }
    }

    const fallback = createMemoryStorage();
    let installed = false;
    try {
      Object.defineProperty(window, name, {
        configurable: true,
        enumerable: true,
        get() {
          return fallback;
        },
      });
      installed = true;
    } catch {
      // ignore
    }

    if (!installed) {
      try {
        window[name] = fallback;
        installed = true;
      } catch {
        // ignore
      }
    }

    if (installed && typeof console !== 'undefined' && typeof console.warn === 'function') {
      console.warn(`[safe-storage] ${name} unavailable; using in-memory fallback.`);
    }
  };

  installFallback('sessionStorage');
  installFallback('localStorage');
})();
