// apps/api/src/modules/auth/repositories/auth.repository.ts
import { Injectable } from '@nestjs/common';
import { getSupabase } from '@/shared/lib/supabase';

@Injectable()
export class AuthRepository {
  /**
   * Único punto del módulo que habla con Supabase Auth.
   * Devuelve tal cual lo que responde Supabase (datos o error);
   * no decide si el login es válido, esa decisión es del Service.
   */
  async signInWithPassword(email: string, password: string) {
    return getSupabase().auth.signInWithPassword({ email, password });
  }
}