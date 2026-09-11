import type {KeyValueStore} from './storage';

export function createMemoryStore(): KeyValueStore {
  const entries = new Map<string, string>();

  return {
    getItem(key) {
      return Promise.resolve(entries.has(key) ? entries.get(key)! : null);
    },
    setItem(key, value) {
      entries.set(key, value);
      return Promise.resolve();
    },
    removeItem(key) {
      entries.delete(key);
      return Promise.resolve();
    },
  };
}
