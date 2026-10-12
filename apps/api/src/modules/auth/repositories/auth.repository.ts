import { Injectable } from '@nestjs/common';
import { getSupabaseClient } from '@/shared/lib/supabase';

@Injectable()
export class AuthRepository {
  /**
   * Único punto del módulo que habla con Supabase Auth.
   * Devuelve tal cual lo que responde Supabase (datos o error);
   * no decide si el login es válido, esa decisión es del Service.
   *
   * Usa el cliente con SUPABASE_SERVICE_ROLE_KEY (regla del repo: la BD y la
   * autenticación se leen con la clave de servicio, nunca SUPABASE_ANON_KEY).
   */
  async signInWithPassword(email: string, password: string) {
    return getSupabaseClient().auth.signInWithPassword({ email, password });
  }
}
