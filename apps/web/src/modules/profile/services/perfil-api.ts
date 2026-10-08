import type { CrearExperienciaLaboralDto, CrearFormacionAcademicaDto } from '@umsspira/shared-types';

import type { Experiencia } from '@/modules/profile/completar/experiencia-laboral';
import type { FormacionAcademica } from '@/modules/profile/completar/formacion-academica';
import { apiPost } from '@/shared/services/api-client';

// HU1 agrega grado al contrato de shared-types (feat/G7-HU1-api-base-perfil); hasta que llegue a epic2 se completa aquí
type CrearFormacionCuerpo = CrearFormacionAcademicaDto & { grado: string };

// Registro que devuelve la API al crear (perfil.mappers.ts del backend)
export type FormacionCreada = CrearFormacionCuerpo & {
  id: string;
  idTitulado: string;
  fechaCreacion: string | null;
};

// POST /api/v1/perfil/formacion-academica -> 201 con el registro creado, 400 por campo o 409 si ya existe
export function crearFormacion(formacion: FormacionAcademica): Promise<FormacionCreada> {
  const cuerpo: CrearFormacionCuerpo = {
    institucion: formacion.institucion.trim(),
    titulo: formacion.titulo.trim(),
    grado: formacion.grado,
    // El formulario guarda el año como texto y el DTO del backend exige un entero
    anioEgreso: Number(formacion.anioEgreso),
  };
  return apiPost<FormacionCreada>('/perfil/formacion-academica', cuerpo);
}

export type ExperienciaCreada = Omit<CrearExperienciaLaboralDto, 'fechaFin'> & {
  id: string;
  idTitulado: string;
  fechaCreacion: string | null;
  // null = trabajo actual
  fechaFin: string | null;
};

// POST /api/v1/perfil/experiencia-laboral -> 201 con el registro creado o 400 por campo
export function crearExperiencia(experiencia: Experiencia): Promise<ExperienciaCreada> {
  const cuerpo: CrearExperienciaLaboralDto = {
    empresa: experiencia.empresa.trim(),
    cargo: experiencia.cargo.trim(),
    fechaInicio: experiencia.fechaInicio,
  };
  // Trabajo actual: fechaFin no se envía (ni vacía ni null), porque @IsDateString rechazaría ""
  if (experiencia.fechaFin) cuerpo.fechaFin = experiencia.fechaFin;
  return apiPost<ExperienciaCreada>('/perfil/experiencia-laboral', cuerpo);
}
