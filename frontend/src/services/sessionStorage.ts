import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

function canUseWebStorage() {
  return typeof globalThis.localStorage !== 'undefined';
}

export const sessionStorage = {
  async getItem(key: string) {
    if (Platform.OS === 'web' && canUseWebStorage()) {
      return globalThis.localStorage.getItem(key);
    }

    return SecureStore.getItemAsync(key);
  },

  async setItem(key: string, value: string) {
    if (Platform.OS === 'web' && canUseWebStorage()) {
      globalThis.localStorage.setItem(key, value);
      return;
    }

    await SecureStore.setItemAsync(key, value);
  },

  async deleteItem(key: string) {
    if (Platform.OS === 'web' && canUseWebStorage()) {
      globalThis.localStorage.removeItem(key);
      return;
    }

    await SecureStore.deleteItemAsync(key);
  },
};
