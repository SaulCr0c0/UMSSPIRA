import { SupabaseClient, createClient } from '@supabase/supabase-js';

let cliente: SupabaseClient | null = null;


export function supabaseClient(): SupabaseClient {
  if (!cliente) {
    const url = process.env.SUPABASE_URL;
    const clave = process.env.SUPABASE_ANON_KEY;
    if (!url || !clave) {
      throw new Error('SUPABASE_URL o SUPABASE_ANON_KEY no estan definidas en el entorno');
    }
    cliente = createClient(url, clave);
  }
  return cliente;
}