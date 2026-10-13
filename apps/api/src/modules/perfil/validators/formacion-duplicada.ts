export const MENSAJE_FORMACION_DUPLICADA = 'La formación académica ya se encuentra registrada.';

export interface FormacionComparable {
  id?: string;
  institucion: string;
  titulo: string;
  anioEgreso: number;
}

// Ignora mayúsculas/minúsculas y espacios al inicio y al final
const normalizar = (texto: string) => texto.trim().toLowerCase();

// Devuelve true si la formación nueva coincide en Institución, Título y Año de egreso
// con alguna de las ya guardadas del mismo egresado.
// idExcluir sirve al editar: el registro que se está editando no cuenta como duplicado de sí mismo.
export function esFormacionDuplicada(
  nueva: FormacionComparable,
  existentes: FormacionComparable[],
  idExcluir?: string,
): boolean {
  return existentes.some(
    (guardada) =>
      guardada.id !== idExcluir &&
      normalizar(guardada.institucion) === normalizar(nueva.institucion) &&
      normalizar(guardada.titulo) === normalizar(nueva.titulo) &&
      Number(guardada.anioEgreso) === Number(nueva.anioEgreso),
  );
}