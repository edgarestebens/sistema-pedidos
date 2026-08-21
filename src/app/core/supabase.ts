import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import type { Database } from './database.types';

let client: SupabaseClient<Database> | null = null;

export function getSupabase(): SupabaseClient<Database> {
  if (!client) {
    client = createClient<Database>(
      environment.supabaseUrl,
      environment.supabaseAnonKey
    );
  }
  return client;
}
