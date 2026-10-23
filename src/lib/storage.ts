/** Обёртка над localStorage: если хранилище недоступно (приватный режим, запрет), живём в памяти. */
export interface SafeStorage {
  get(key: string): string | null;
  set(key: string, value: string): void;
  readonly persistent: boolean;
}

function memoryStorage(): SafeStorage {
  const map = new Map<string, string>();
  return {
    get: (k) => map.get(k) ?? null,
    set: (k, v) => void map.set(k, v),
    persistent: false,
  };
}

export function createSafeStorage(getBackend: () => Storage | undefined = () => globalThis.localStorage): SafeStorage {
  let backend: Storage | undefined;
  try {
    backend = getBackend();
    const probe = '__advent_probe__';
    backend?.setItem(probe, '1');
    backend?.removeItem(probe);
  } catch {
    backend = undefined;
  }
  if (!backend) return memoryStorage();
  const fallback = memoryStorage();
  const store = backend;
  return {
    get(k) {
      try {
        return store.getItem(k) ?? fallback.get(k);
      } catch {
        return fallback.get(k);
      }
    },
    set(k, v) {
      fallback.set(k, v);
      try {
        store.setItem(k, v);
      } catch {
        // Переполнено или запрещено — значение останется в памяти до перезагрузки.
      }
    },
    persistent: true,
  };
}
