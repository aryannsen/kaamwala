/// <reference types="vite/client" />
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Retrieve Supabase credentials safely from Vite environment
const env = (typeof import.meta !== 'undefined' && (import.meta as { env?: Record<string, string> }).env) || {};
const supabaseUrl = (env.VITE_SUPABASE_URL || '').trim();
const supabaseAnonKey = (env.VITE_SUPABASE_ANON_KEY || '').trim();

// Verify that valid Supabase credentials have been configured
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'MY_SUPABASE_URL' &&
  supabaseAnonKey !== 'MY_SUPABASE_ANON_KEY' &&
  (supabaseUrl.startsWith('https://') || supabaseUrl.startsWith('http://'))
);

// Dedicated Supabase client instance (isolated from UI components)
// Client-side code only ever receives the public publishable anon key.
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    })
  : null;

export interface SupabaseConnectionStatus {
  isConfigured: boolean;
  urlPreview: string;
  clientReady: boolean;
}

export function getSupabaseConnectionStatus(): SupabaseConnectionStatus {
  let urlPreview = 'Not Configured';
  if (supabaseUrl) {
    try {
      const parsed = new URL(supabaseUrl);
      urlPreview = parsed.hostname;
    } catch {
      urlPreview = supabaseUrl.slice(0, 15) + '...';
    }
  }

  return {
    isConfigured: isSupabaseConfigured,
    urlPreview,
    clientReady: supabase !== null
  };
}
