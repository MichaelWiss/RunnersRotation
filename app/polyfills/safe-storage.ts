/**
 * Some Safari contexts (notably iOS private browsing) throw DOMExceptions when
 * sessionStorage/localStorage are touched. React Router relies on those APIs,
 * so we swap in a simple in-memory shim when writes fail so navigation keeps
 * working instead of crashing at runtime.
 */

type StorageShim = {
  setItem: (key: string, value: string) => void;
  getItem: (key: string) => string | null;
  removeItem: (key: string) => void;
  clear: () => void;
  key: (index: number) => string | null;
  readonly length: number;
};

function createMemoryStorage(): StorageShim {
  const map = new Map<string, string>();
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
}

function isQuotaLikeError(error: unknown) {
  return (
    typeof DOMException !== 'undefined' &&
    error instanceof DOMException &&
    (
      error.name === 'QuotaExceededError' ||
      error.name === 'SecurityError' ||
      error.name === 'InvalidAccessError' ||
      error.name === 'InvalidStateError'
    )
  );
}

function upgradeStorage(storage: Storage | undefined | null) {
  if (!storage) return;

  const testKey = '__rr_storage_probe__';

  try {
    storage.setItem(testKey, 'ok');
    storage.removeItem(testKey);
    return; // Works fine, nothing to patch.
  } catch (error) {
    if (!isQuotaLikeError(error)) {
      return;
    }
  }

  const shim = createMemoryStorage();

  const define = (property: keyof StorageShim, value: unknown) => {
    try {
      Object.defineProperty(storage, property, {
        configurable: true,
        enumerable: false,
        writable: true,
        value,
      });
    } catch {
      // Silently swallow; better to fail open than crash the app.
    }
  };

  define('setItem', shim.setItem.bind(shim));
  define('getItem', shim.getItem.bind(shim));
  define('removeItem', shim.removeItem.bind(shim));
  define('clear', shim.clear.bind(shim));
  define('key', shim.key.bind(shim));

  try {
    Object.defineProperty(storage, 'length', {
      configurable: true,
      get() {
        return shim.length;
      },
    });
  } catch {
    // ignore
  }

  if (typeof console !== 'undefined' && typeof console.warn === 'function') {
    console.warn(
      '[safe-storage] Falling back to in-memory sessionStorage/localStorage shim because persistent storage is unavailable.',
    );
  }
}

function installSafeStorage() {
  if (typeof window === 'undefined') return;
  if (typeof Storage === 'undefined') return;
  try {
    upgradeStorage(window.sessionStorage);
  } catch (error) {
    if (isQuotaLikeError(error)) {
      try {
        Object.defineProperty(window, 'sessionStorage', {
          configurable: true,
          value: createMemoryStorage(),
        });
      } catch {
        // ignore
      }
    }
  }
  try {
    upgradeStorage(window.localStorage);
  } catch (error) {
    if (isQuotaLikeError(error)) {
      try {
        Object.defineProperty(window, 'localStorage', {
          configurable: true,
          value: createMemoryStorage(),
        });
      } catch {
        // ignore
      }
    }
  }
}

installSafeStorage();

export {};
