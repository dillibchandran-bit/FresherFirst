/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

// Safely get URL and key in both browser and server environments
const getEnvVar = (key: string, fallback: string = ''): string => {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
      return import.meta.env[key];
    }
  } catch {}

  try {
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key];
    }
  } catch {}

  return fallback;
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL', 'https://psrxugrzmswmcobsahgm.supabase.co');
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY', '');

if (!supabaseAnonKey) {
  console.warn('⚠️ Supabase anon key is missing.');
}

// We intentionally use any to bypass strict type checking of never for missing tables
export const supabase = createClient<any>(
  supabaseUrl || 'https://psrxugrzmswmcobsahgm.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

