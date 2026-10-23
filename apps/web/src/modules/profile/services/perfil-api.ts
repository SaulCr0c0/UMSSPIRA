import type { Certificacion } from '@/modules/profile/completar/certificaciones';
import type { Experiencia } from '@/modules/profile/completar/experiencia-laboral';
import type { FormacionAcademica } from '@/modules/profile/completar/formacion-academica';
import { CURRENT_GRADUATE_ID } from '@/modules/profile/data/profile-records-data';
import type {
  CertificationRecord,
  EducationRecord,
  ExperienceRecord,
  ProfileRecords,
} from '@/modules/profile/types/profile-record';
import { ApiError, apiFetch } from '@/shared/services/api-client';
import { apiUrl, readApiError } from '@/shared/services/api-contract';
import { ensureAccessToken, getAccessToken } from '@/shared/services/auth-session';

// Endpoints del perfil del backend (apps/api/src/modules/perfil)
export const PERFIL_URL = '/api/v1/perfil';

// Campos comunes de los registros que devuelve la API (perfil.mappers.ts del backend)
type RegistroApi = {
  id: string;
  idTitulado: string;
  fechaCreacion: string | null;
};

// Cuerpo de POST/PUT de formación académica (CrearFormacionAcademicaDto del backend)
type FormacionCuerpo = {
  institucion: string;
  titulo: string;
  grado: string;
  anioEgreso: number;
};

export type FormacionApi = RegistroApi & FormacionCuerpo;

// Cuerpo de POST/PUT de experiencia laboral (CrearExperienciaLaboralDto del backend)
type ExperienciaCuerpo = {
  empresa: string;
  cargo: string;
  fechaInicio: string;
  // Sin fechaFin = trabajo actual
  fechaFin?: string;
};

export type ExperienciaApi = RegistroApi & Omit<ExperienciaCuerpo, 'fechaFin'> & {
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

function cuerpoFormacion(formacion: FormacionAcademica): FormacionCuerpo {
  return {
    institucion: formacion.institucion.trim(),
    titulo: formacion.titulo.trim(),
    grado: formacion.grado,
    // El formulario guarda el año como texto y el DTO del backend exige un entero
    anioEgreso: Number(formacion.anioEgreso),
  };
}

// POST /api/v1/perfil/formacion-academica -> 201 con el registro creado, 400 por campo o 409 si ya existe
export async function crearFormacion(formacion: FormacionAcademica): Promise<EducationRecord> {
  const creada = await apiFetch<FormacionApi>(`${PERFIL_URL}/formacion-academica`, {
    method: 'POST',
    body: JSON.stringify(cuerpoFormacion(formacion)),
  });
  return aEducationRecord(creada);
}

// PUT /api/v1/perfil/formacion-academica/:id -> registro actualizado, 400 por campo
// o 409 si queda igual a otra formación (el propio registro no cuenta)
export async function actualizarFormacion(id: string, formacion: FormacionAcademica): Promise<EducationRecord> {
  const actualizada = await apiFetch<FormacionApi>(`${PERFIL_URL}/formacion-academica/${id}`, {
    method: 'PUT',
    body: JSON.stringify(cuerpoFormacion(formacion)),
  });
  return aEducationRecord(actualizada);
}

function cuerpoExperiencia(experiencia: Experiencia): ExperienciaCuerpo {
  const cuerpo: ExperienciaCuerpo = {
    empresa: experiencia.empresa.trim(),
    cargo: experiencia.cargo.trim(),
    fechaInicio: experiencia.fechaInicio,
  };
  // Trabajo actual: fechaFin no se envía (ni vacía ni null), porque @IsDateString rechazaría ""
  if (experiencia.fechaFin) cuerpo.fechaFin = experiencia.fechaFin;
  return cuerpo;
}

// POST /api/v1/perfil/experiencia-laboral -> 201 con el registro creado o 400 por campo
export async function crearExperiencia(experiencia: Experiencia): Promise<ExperienceRecord> {
  const creada = await apiFetch<ExperienciaApi>(`${PERFIL_URL}/experiencia-laboral`, {
    method: 'POST',
    body: JSON.stringify(cuerpoExperiencia(experiencia)),
  });
  return aExperienceRecord(creada);
}

// PUT /api/v1/perfil/experiencia-laboral/:id -> registro actualizado o 400 por campo.
// Sin fechaFin el backend la guarda como null (trabajo actual) en vez de conservar la anterior
export async function actualizarExperiencia(id: string, experiencia: Experiencia): Promise<ExperienceRecord> {
  const actualizada = await apiFetch<ExperienciaApi>(`${PERFIL_URL}/experiencia-laboral/${id}`, {
    method: 'PUT',
    body: JSON.stringify(cuerpoExperiencia(experiencia)),
  });
  return aExperienceRecord(actualizada);
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

type CertificacionCuerpo = {
  nombre: string;
  entidadEmisora: string;
  anioEmision: number;
  // Sin grado el backend guarda «Profesional» (T8.7)
  grado?: string;
};

function cuerpoCertificacion(certificacion: Certificacion): CertificacionCuerpo {
  const cuerpo: CertificacionCuerpo = {
    nombre: certificacion.nombre.trim(),
    entidadEmisora: certificacion.entidadEmisora.trim(),
    // El formulario guarda el año como texto y el backend exige un entero
    anioEmision: Number(certificacion.anioEmision),
  };
  if (certificacion.grado) cuerpo.grado = certificacion.grado;
  return cuerpo;
}

// POST /api/v1/perfil/certificaciones -> 201 con el registro creado (con su id) o 400 por campo
export async function crearCertificacion(certificacion: Certificacion): Promise<CertificationRecord> {
  const creada = await apiFetch<CertificacionApi>(`${PERFIL_URL}/certificaciones`, {
    method: 'POST',
    body: JSON.stringify(cuerpoCertificacion(certificacion)),
  });
  return aCertificationRecord(creada);
}

function mensajeDeRespuesta(texto: string, porDefecto: string): string {
  try {
    return readApiError(JSON.parse(texto), porDefecto).message;
  } catch {
    return porDefecto;
  }
}

// POST /api/v1/perfil/certificaciones/:id/respaldo (multipart, campo "archivo").
// Usa XMLHttpRequest porque fetch no informa el avance de la subida; onProgreso recibe 0 a 100.
export async function subirRespaldo(
  id: string,
  archivo: File,
  onProgreso?: (porcentaje: number) => void,
): Promise<void> {
  let token: string;
  try {
    token = getAccessToken() ?? (await ensureAccessToken());
  } catch {
    throw new ApiError(401, 'Tu sesion expiro. Inicia sesion nuevamente');
  }
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', apiUrl(`${PERFIL_URL}/certificaciones/${id}/respaldo`));
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.upload.onprogress = (evento) => {
      if (evento.lengthComputable) onProgreso?.(Math.round((evento.loaded / evento.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgreso?.(100);
        resolve();
      } else if (xhr.status === 401) {
        reject(new ApiError(401, 'Tu sesion expiro. Inicia sesion nuevamente'));
      } else {
        reject(new ApiError(xhr.status, mensajeDeRespuesta(xhr.responseText, 'No se pudo subir el respaldo')));
      }
    };
    xhr.onerror = () => reject(new ApiError(0, 'No fue posible conectar con el servidor'));
    const formulario = new FormData();
    formulario.append('archivo', archivo);
    xhr.send(formulario);
  });
}
