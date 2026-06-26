import { Capacitor } from '@capacitor/core';
import type { StateStorage } from 'zustand/middleware';

/**
 * localStorage-based storage adapter for Zustand persist.
 * Used as fallback on web platforms where Capacitor Preferences isn't available.
 */
const localStorageAdapter: StateStorage = {
  getItem: (name: string) => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(name);
  },
  setItem: (name: string, value: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(name, value);
    }
  },
  removeItem: (name: string) => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(name);
    }
  },
};

/**
 * Capacitor Preferences-backed storage adapter for Zustand persist.
 * On iOS this wraps the Keychain; on Android it wraps EncryptedSharedPreferences.
 */
const secureAdapter: StateStorage = {
  getItem: async (name: string) => {
    try {
      const { Preferences } = await import('@capacitor/preferences');
      const { value } = await Preferences.get({ key: name });
      return value ?? null;
    } catch {
      return null;
    }
  },
  setItem: async (name: string, value: string) => {
    try {
      const { Preferences } = await import('@capacitor/preferences');
      await Preferences.set({ key: name, value });
    } catch {
      // Silently fall through — data may not be persisted
    }
  },
  removeItem: async (name: string) => {
    try {
      const { Preferences } = await import('@capacitor/preferences');
      await Preferences.remove({ key: name });
    } catch {
      // Silently fall through
    }
  },
};

/**
 * Returns the appropriate Zustand storage adapter based on the platform.
 *
 * - Native (iOS/Android): Capacitor Preferences → Keychain / EncryptedSharedPreferences
 * - Web: localStorage
 */
export function createAppStorage(): StateStorage {
  if (Capacitor.isNativePlatform()) {
    return secureAdapter;
  }
  return localStorageAdapter;
}
