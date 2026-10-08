import type { CrearFormacionAcademicaDto } from '@umsspira/shared-types';

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
