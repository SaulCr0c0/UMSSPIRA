import { CURRENT_GRADUATE_ID } from '@/modules/profile/data/profile-records-data';
import type {
  CertificationRecord,
  EducationRecord,
  ExperienceRecord,
  ProfileRecords,
} from '@/modules/profile/types/profile-record';
import { apiFetch } from '@/shared/services/api-client';

// Endpoints del perfil del backend (apps/api/src/modules/perfil)
export const PERFIL_URL = '/api/v1/perfil';

// Campos comunes de los registros que devuelve la API (perfil.mappers.ts del backend)
type RegistroApi = {
  id: string;
  idTitulado: string;
  fechaCreacion: string | null;
};

export type FormacionApi = RegistroApi & {
  institucion: string;
  titulo: string;
  grado: string;
  anioEgreso: number;
};

export type ExperienciaApi = RegistroApi & {
  empresa: string;
  cargo: string;
  fechaInicio: string;
  // null = trabajo actual
  fechaFin: string | null;
};

export type CertificacionApi = RegistroApi & {
  nombre: string;
  entidadEmisora: string;
  grado: string;
  anioEmision: number;
  // tieneRespaldo null = el backend todavía no sabe leer respaldos
  respaldo?: { tieneRespaldo: boolean | null };
};

// GET /api/v1/perfil (perfil-resumen.service.ts del backend)
export type PerfilApi = {
  formacionAcademica: { registros: FormacionApi[] };
  experienciaLaboral: { registros: ExperienciaApi[] };
  certificaciones: { registros: CertificacionApi[] };
};

// La API solo devuelve registros del titulado actual, así que todos son del egresado con sesión
export function aEducationRecord(formacion: FormacionApi): EducationRecord {
  return {
    id: formacion.id,
    ownerId: CURRENT_GRADUATE_ID,
    institution: formacion.institucion,
    title: formacion.titulo,
    graduationYear: String(formacion.anioEgreso),
    degree: formacion.grado,
  };
}

export function aExperienceRecord(experiencia: ExperienciaApi): ExperienceRecord {
  return {
    id: experiencia.id,
    ownerId: CURRENT_GRADUATE_ID,
    company: experiencia.empresa,
    position: experiencia.cargo,
    startDate: experiencia.fechaInicio,
    endDate: experiencia.fechaFin ?? '',
  };
}

// La API no devuelve el nombre del archivo de respaldo ni si fue validado: solo si existe
export function aCertificationRecord(certificacion: CertificacionApi): CertificationRecord {
  return {
    id: certificacion.id,
    ownerId: CURRENT_GRADUATE_ID,
    name: certificacion.nombre,
    issuer: certificacion.entidadEmisora,
    degree: certificacion.grado,
    issueYear: String(certificacion.anioEmision),
    backupFile: certificacion.respaldo?.tieneRespaldo ? 'respaldo.jpg' : undefined,
    backupVerified: false,
  };
}

// GET /api/v1/perfil -> registros de las 3 secciones con el formato del estado del perfil
export async function obtenerPerfil(): Promise<ProfileRecords> {
  const perfil = await apiFetch<PerfilApi>(PERFIL_URL);
  return {
    education: perfil.formacionAcademica.registros.map(aEducationRecord),
    experience: perfil.experienciaLaboral.registros.map(aExperienceRecord),
    certification: perfil.certificaciones.registros.map(aCertificationRecord),
  };
}
