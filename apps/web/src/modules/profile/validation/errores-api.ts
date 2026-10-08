import type { ErroresFormulario } from './reglas-perfil';

// El 400 del ValidationPipe solo trae textos, sin el nombre del campo. Cada campo se reconoce por cómo
// empieza su mensaje en los DTOs del backend (apps/api/src/modules/perfil/dto), por ejemplo "La institución es obligatoria".
export const PREFIJOS_FORMACION = {
  institucion: 'La institución',
  titulo: 'El título',
  anioEgreso: 'El año de egreso',
  grado: 'El grado',
};

export const PREFIJOS_EXPERIENCIA = {
  empresa: 'La empresa',
  cargo: 'El cargo',
  fechaInicio: 'La fecha de inicio',
  fechaFin: 'La fecha de fin',
};

// Mismo estilo que los mensajes del frontend, que terminan en punto
function conPunto(mensaje: string): string {
  return /[.!?]$/.test(mensaje) ? mensaje : `${mensaje}.`;
}

// Reparte los mensajes del backend: los que se reconocen van junto a su campo y el resto queda como error general
export function erroresDelBackend<Campo extends string>(
  mensajes: string[],
  prefijos: Record<Campo, string>,
): { porCampo: ErroresFormulario<Campo>; generales: string[] } {
  const porCampo: ErroresFormulario<Campo> = {};
  const generales: string[] = [];
  const campos = Object.keys(prefijos) as Campo[];

  for (const mensaje of mensajes) {
    const campo = campos.find((c) => mensaje.toLowerCase().startsWith(prefijos[c].toLowerCase()));
    if (campo && !porCampo[campo]) porCampo[campo] = conPunto(mensaje);
    else if (!campo) generales.push(conPunto(mensaje));
  }
  return { porCampo, generales };
}
