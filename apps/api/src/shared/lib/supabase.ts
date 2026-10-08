import { SupabaseClient, createClient } from '@supabase/supabase-js';

let cliente: SupabaseClient | null = null;

// El backend usa la clave service_role: con RLS activo en todas las tablas y sin políticas en Storage,
// la clave anon no puede subir archivos. Esta clave nunca debe llegar al frontend.
export function supabaseClient(): SupabaseClient {
  if (!cliente) {
    const url = process.env.SUPABASE_URL;
    const clave = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !clave) {
      throw new Error('SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY no estan definidas en el entorno');
    }
    cliente = createClient(url, clave, { auth: { persistSession: false } });
  }
  return cliente;
}
