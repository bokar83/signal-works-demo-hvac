import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'https://jscucboftaoaphticqci.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!_client) {
    if (!SUPABASE_ANON_KEY) {
      throw new Error('[Supabase] EXPO_PUBLIC_SUPABASE_ANON_KEY not set');
    }
    _client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return _client;
}

export function getSupabaseOrNull(): SupabaseClient | null {
  try {
    return getSupabase();
  } catch {
    return null;
  }
}
