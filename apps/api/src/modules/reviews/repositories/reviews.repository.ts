import { Injectable } from '@nestjs/common';
import type {
  ApplicationStatus,
  ReviewDecision,
  ReviewResponse,
} from '@umsspira/shared-types';
import { getSupabaseClient } from '@/shared/lib/supabase';

type SaveReviewInput = Omit<ReviewResponse, 'id' | 'reviewedAt'>;

export type ApplicantContact = { email: string; fullName: string };

// solicitud.estado (migraciones 0006 y 0008)
const REQUEST_STATUS: Record<ApplicationStatus, string> = {
  PENDING: 'Pendiente',
  APPROVED: 'Aprobado',
  OBSERVED: 'Observado',
  REJECTED: 'Rechazado',
};

// dictamen.tipo (CHECK de la tabla)
const REVIEW_TYPE: Record<ReviewDecision, string> = {
  APPROVED: 'APROBADO',
  OBSERVED: 'OBSERVADO',
  REJECTED: 'RECHAZADO',
};

function toAppStatus(dbValue: string): ApplicationStatus | null {
  const found = (
    Object.entries(REQUEST_STATUS) as [ApplicationStatus, string][]
  ).find(([, db]) => db.toLowerCase() === dbValue.toLowerCase());
  return found ? found[0] : null;
}

@Injectable()
export class ReviewsRepository {
  async getApplicationStatus(
    applicationId: string,
  ): Promise<ApplicationStatus | null> {
    const { data, error } = await getSupabaseClient()
      .from('solicitud')
      .select('estado')
      .eq('id', applicationId)
      .maybeSingle();

    if (error) {
      throw new Error(`No se pudo leer la solicitud: ${error.message}`);
    }
    if (!data) return null;
    return toAppStatus(String(data.estado));
  }

  async getApplicantContact(
    applicationId: string,
  ): Promise<ApplicantContact | null> {
    const { data, error } = await getSupabaseClient()
      .from('solicitud')
      .select('detalle_solicitud(email, nombre, apellido)')
      .eq('id', applicationId)
      .maybeSingle();

    if (error || !data) return null;

    const raw = data.detalle_solicitud as unknown;
    const detail = (Array.isArray(raw) ? raw[0] : raw) as {
      email: string;
      nombre: string;
      apellido: string;
    } | null;

    return detail
      ? {
          email: detail.email,
          fullName: `${detail.nombre} ${detail.apellido}`.trim(),
        }
      : null;
  }

  async saveReview(input: SaveReviewInput): Promise<ReviewResponse> {
    const db = getSupabaseClient();
    const now = new Date().toISOString();

    const { data, error } = await db
      .from('dictamen')
      .insert({
        id_administrador_sistema: input.reviewedBy,
        id_solicitud: input.applicationId,
        tipo: REVIEW_TYPE[input.decision],
        categoria: input.category,
        justificacion: input.note,
        fecha_creacion: now,
        fecha_actualizacion: now.slice(0, 10),
        subsanada: false,
      })
      .select('id')
      .single();

    if (error) {
      throw new Error(`No se pudo guardar el dictamen: ${error.message}`);
    }

    // Solo cambia si sigue Pendiente (evita pisar un dictamen concurrente)
    const { error: updateError } = await db
      .from('solicitud')
      .update({ estado: REQUEST_STATUS[input.status] })
      .eq('id', input.applicationId)
      .eq('estado', REQUEST_STATUS.PENDING);

    if (updateError) {
      throw new Error(
        `Dictamen guardado, pero falló el cambio de estado: ${updateError.message}`,
      );
    }

    return { id: data.id as string, reviewedAt: now, ...input };
  }
}