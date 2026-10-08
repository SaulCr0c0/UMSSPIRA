import { Injectable } from '@nestjs/common';
import { getSupabaseClient } from '../../../shared/lib/supabase';
type SubmitRegistrationData = {
  idCarrera: string;
  nombre: string;
  apellido: string;
  telefono: string;
  email: string;
  fechaTitulacion: string;
  fechaIngreso: string;
  ci: string;
  extensionCi: string;
  expedidoEn: string;
  anioEgreso: number;
  codigoSis: string;
  deseaMentor: boolean;
  tipoDocumento: string;
  tamanioMb: number;
  rutaStorage: string;
};

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

  async submitRegistration(data: SubmitRegistrationData) {
  const { data: tiposArchivo, error: tipoError } =
    await getSupabaseClient()
      .from('tipo_archivo')
      .select('id, nombre');

  if (tipoError) throw tipoError;

  const tipoArchivo = (tiposArchivo ?? []).find(
    (row) =>
      String(row.nombre ?? '').trim().toLowerCase() ===
      data.tipoDocumento.trim().toLowerCase(),
  );

  if (!tipoArchivo) {
    throw new Error(
      `No existe el tipo de archivo: ${data.tipoDocumento}`,
    );
  }

  const { data: result, error } =
    await getSupabaseClient().rpc(
      'fun_registrar_solicitud',
      {
        p_id_carrera: data.idCarrera,
        p_nombre: data.nombre,
        p_apellido: data.apellido,
        p_telefono: data.telefono,
        p_email: data.email,
        p_fecha_titulacion: data.fechaTitulacion,
        p_fecha_ingreso: data.fechaIngreso,
        p_ci: data.ci,
        p_extension_ci: data.extensionCi || null,
        p_expedido_en: data.expedidoEn,
        p_anio_egreso: data.anioEgreso,
        p_cod_sis: Number(data.codigoSis),
        p_desea_mentor: data.deseaMentor,
        p_id_tipo_archivo: tipoArchivo.id,
        p_tamanio_mb: data.tamanioMb,
        p_ruta_storage: data.rutaStorage,
      },
    );

  if (error) throw error;

  return result;
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
