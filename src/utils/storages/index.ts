export { default as LOCAL_KEYS } from './constants';

type StorageType = typeof localStorage | typeof sessionStorage;

class Storage {
  method: StorageType;

  constructor(method: StorageType) {
    this.method = method;
  }

  set(key: string, value: unknown) {
    this.method.setItem(key, JSON.stringify(value));
  }

  get(key: string, defaultValue?: unknown) {
    const value = this.method.getItem(key);
    try {
      return value ? JSON.parse(value) : defaultValue;
    } catch (e) {
      return defaultValue;
    }
  }

  clear(key: string) {
    this.method.removeItem(key);
  }

  clearAll() {
    this.method.clear();
  }
}

const LocalStorage = new Storage(localStorage);
const SessionStorage = new Storage(sessionStorage);

export { LocalStorage, SessionStorage };
