// Reglas de validación del formulario de perfil (HU-02). Cada función devuelve el mensaje de error
// del criterio o undefined si el valor es válido, para mostrarlo junto al campo antes de agregar el registro.

export const MENSAJE_ANIO_EGRESO_FUTURO = 'El año de egreso no puede ser posterior al año actual';
export const MENSAJE_HASTA_ANTERIOR_A_DESDE = "La fecha 'Hasta' no puede ser anterior a 'Desde'";
export const MENSAJE_RESPALDO_FORMATO = 'Formato no permitido. Solo JPG';
export const MENSAJE_RESPALDO_TAMANIO = 'El archivo no puede superar 5 MB';

// Solo JPG: es el formato con el que trabaja el motor NLP (mismas reglas que ArchivoRespaldoPipe del backend)
const TIPO_RESPALDO = 'image/jpeg';
const EXTENSIONES_RESPALDO = ['.jpg', '.jpeg'];
export const TAMANIO_MAXIMO_RESPALDO = 5 * 1024 * 1024;

// Año de egreso (AAAA): no puede ser mayor al año actual
export function validarAnioEgreso(anio: string): string | undefined {
  if (!/^\d{4}$/.test(anio)) return undefined;
  return Number(anio) > new Date().getFullYear() ? MENSAJE_ANIO_EGRESO_FUTURO : undefined;
}

// Fechas AAAA-MM-DD de experiencia laboral: 'Hasta' puede ser igual a 'Desde', pero no anterior.
// Sin alguna de las dos (por ejemplo, trabajo actual) no hay rango que validar.
export function validarRangoFechas(desde: string, hasta: string): string | undefined {
  if (!desde || !hasta) return undefined;
  return hasta < desde ? MENSAJE_HASTA_ANTERIOR_A_DESDE : undefined;
}

// El atributo accept del input se puede saltar eligiendo "Todos los archivos", por eso se revisa aquí.
// Primero el formato y después el tamaño, en el mismo orden que el backend.
export function validarRespaldo(archivo: File): string | undefined {
  const nombre = archivo.name.toLowerCase();
  const esJpg = archivo.type === TIPO_RESPALDO && EXTENSIONES_RESPALDO.some((ext) => nombre.endsWith(ext));
  if (!esJpg) return MENSAJE_RESPALDO_FORMATO;
  if (archivo.size > TAMANIO_MAXIMO_RESPALDO) return MENSAJE_RESPALDO_TAMANIO;
  return undefined;
}
