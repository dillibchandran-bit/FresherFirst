/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

// Get URL and key from env
const supabaseUrl = process.env.VITE_SUPABASE_URL || import.meta.env?.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || import.meta.env?.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

if (!supabaseUrl || supabaseUrl === 'https://placeholder.supabase.co') {
  console.warn('⚠️ Supabase environment variables are missing.');
}

// We intentionally use any to bypass strict type checking of never for missing tables
export const supabase = createClient<any>(supabaseUrl, supabaseAnonKey);
