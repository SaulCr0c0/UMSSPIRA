import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Cliente de Supabase COMPARTIDO por toda la API.
 * Uso en cualquier módulo:
 *
 *   import { supabase } from '../../shared/lib/supabase';
 *   const { data, error } = await supabase.from('tabla').select('*');
 *
 * Variables de entorno requeridas (.env):
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY   (backend: usa la service_role, NO la anon key)
 *
 * El cliente se crea en el primer uso (no al importar el archivo), así el
 * orden de carga del .env no importa mientras esté cargado antes del primer request.
 */
let client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (client) return client;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      'Supabase no configurado: define SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en el .env',
    );
  }

  client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}

export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const instance = getClient();
    const value = Reflect.get(instance, prop) as unknown;
    return typeof value === 'function' ? value.bind(instance) : value;
  },
});
