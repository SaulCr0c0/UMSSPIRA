import { Injectable } from '@nestjs/common';
import { getSupabaseClient } from '../../../shared/lib/supabase';

@Injectable()
export class RegistrationsRepository {
  async findActiveApplicationByIdentity(ci: string, complementoCi: string, expedidoEn: string) {
    const { data, error } = await getSupabaseClient().rpc('fun_existe_solicitud_activa', {
      p_ci: ci,
      p_complemento_ci: complementoCi,
      p_expedido_en: expedidoEn,
    });
    if (error) throw error;
    return data;
  }

  async findActiveApplicationByEmail(correo: string) {
    const { data, error } = await getSupabaseClient()
      .from('solicitud')
      .select('id')
      .eq('correo', correo)
      .neq('estado', 'rechazado')
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  async findActiveApplicationBySisCode(codigoSis: string) {
    const { data, error } = await getSupabaseClient()
      .from('solicitud')
      .select('id')
      .eq('cod_sis', codigoSis)
      .neq('estado', 'rechazado')
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  async listCareers() {
    const { data, error } = await getSupabaseClient().from('carrera').select('id, nombre');
    if (error) throw error;
    return (data ?? []).map((row) => ({ id: row.id, nombre: row.nombre }));
  }
}