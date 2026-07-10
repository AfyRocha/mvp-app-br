import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.warn(
    'Supabase não configurado: defina EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_ANON_KEY no .env (veja .env.example).'
  );
}

/**
 * Na web guardamos a sessão em sessionStorage: ao FECHAR o site (a aba/janela)
 * o login sai automaticamente — a sessão dura só enquanto a aba está aberta
 * (sobrevive a reload). No app nativo mantemos AsyncStorage, com login
 * persistente, como é o esperado no mobile.
 */
const webSessionStorage = {
  getItem: (key: string) =>
    typeof window !== 'undefined' ? window.sessionStorage.getItem(key) : null,
  setItem: (key: string, value: string) => {
    if (typeof window !== 'undefined') window.sessionStorage.setItem(key, value);
  },
  removeItem: (key: string) => {
    if (typeof window !== 'undefined') window.sessionStorage.removeItem(key);
  },
};

const authStorage = Platform.OS === 'web' ? webSessionStorage : AsyncStorage;

export const supabase = createClient(
  supabaseUrl ?? 'https://placeholder.supabase.co',
  supabaseAnonKey ?? 'placeholder-anon-key',
  {
    auth: {
      storage: authStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);
