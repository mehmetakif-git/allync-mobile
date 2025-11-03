import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Get credentials from app.json extra config
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || '';
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables in app.json');
}

// Custom storage adapter - uses localStorage on web, SecureStore on native
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    if (Platform.OS === 'web') {
      // Use localStorage on web
      if (typeof localStorage === 'undefined') {
        return Promise.resolve(null);
      }
      return Promise.resolve(localStorage.getItem(key));
    }
    // Use SecureStore on native platforms
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    if (Platform.OS === 'web') {
      // Use localStorage on web
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, value);
      }
      return Promise.resolve();
    }
    // Use SecureStore on native platforms
    return SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    if (Platform.OS === 'web') {
      // Use localStorage on web
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(key);
      }
      return Promise.resolve();
    }
    // Use SecureStore on native platforms
    return SecureStore.deleteItemAsync(key);
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
