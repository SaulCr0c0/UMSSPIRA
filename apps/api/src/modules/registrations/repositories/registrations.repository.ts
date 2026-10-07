import { Injectable } from '@nestjs/common';
import { getSupabaseClient } from '../../../shared/lib/supabase';

const REJECTED_STATES = new Set(['rechazado', 'rechazada']);

const escapeLike = (value: string) => value.replace(/[\\%_]/g, (char) => `\\${char}`);

@Injectable()
export class RegistrationsRepository {
  
  async findActiveApplicationByIdentity(ci: string, complementoCi: string, _expedidoEn: string) {
    let query = getSupabaseClient().from('detalle_solicitud').select('id').eq('ci', ci);
    query = complementoCi
      ? query.ilike('extension_ci', escapeLike(complementoCi))
      : query.or('extension_ci.is.null,extension_ci.eq.');
    const { data, error } = await query;
    if (error) throw error;
    return this.findActiveApplicationByDetailIds((data ?? []).map((row) => row.id as string));
  }

  async findActiveApplicationByEmail(correo: string) {
    const { data, error } = await getSupabaseClient()
      .from('detalle_solicitud')
      .select('id')
      .ilike('email', escapeLike(correo));
    if (error) throw error;
    return this.findActiveApplicationByDetailIds((data ?? []).map((row) => row.id as string));
  }

  async findActiveApplicationBySisCode(codigoSis: string) {
    const { data, error } = await getSupabaseClient()
      .from('detalle_solicitud')
      .select('id')
      .eq('cod_sis', Number(codigoSis));
    if (error) throw error;
    return this.findActiveApplicationByDetailIds((data ?? []).map((row) => row.id as string));
  }

  async listCareers() {
    const { data, error } = await getSupabaseClient().from('carrera').select('id, nombre');
    if (error) throw error;
    return (data ?? []).map((row) => ({ id: row.id, nombre: row.nombre }));
  }

  private async findActiveApplicationByDetailIds(detailIds: string[]) {
    if (detailIds.length === 0) return null;
    const { data, error } = await getSupabaseClient()
      .from('solicitud')
      .select('id, estado')
      .in('id_detalle_solicitud', detailIds);
    if (error) throw error;
    return (
      (data ?? []).find((s) => !REJECTED_STATES.has(String(s.estado ?? '').trim().toLowerCase())) ?? null
    );
  }
}
