import AsyncStorage from '@react-native-async-storage/async-storage';
import type {KeyValueStore} from './storage';

export function createAsyncStorageStore(): KeyValueStore {
  return {
    getItem(key) {
      return AsyncStorage.getItem(key);
    },
    setItem(key, value) {
      return AsyncStorage.setItem(key, value);
    },
    removeItem(key) {
      return AsyncStorage.removeItem(key);
    },
  };
}
