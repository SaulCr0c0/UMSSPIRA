// Cliente HTTP hacia la API (NestJS). Todas las rutas cuelgan del prefijo global /api/v1 (apps/api/src/main.ts).

// NEXT_PUBLIC_API_URL es la raíz del servidor de la API, sin /api/v1 (por ejemplo http://localhost:3000)
const URL_API_POR_DEFECTO = 'http://localhost:3000';

function urlBase(): string {
  const raiz = (process.env.NEXT_PUBLIC_API_URL || URL_API_POR_DEFECTO).replace(/\/+$/, '');
  return `${raiz}/api/v1`;
}

export const MENSAJE_SIN_CONEXION = 'No se pudo conectar con el servidor. Intenta de nuevo.';

// Error de la API con el formato de NestJS: { statusCode, message, error }.
// message llega como texto (409, 404...) o como lista de textos (400 del ValidationPipe).
export class ApiError extends Error {
  constructor(
    readonly statusCode: number,
    readonly mensajes: string[],
  ) {
    super(mensajes.join(' '));
    this.name = 'ApiError';
  }
}

async function leerError(respuesta: Response): Promise<ApiError> {
  let cuerpo: { statusCode?: unknown; message?: unknown } = {};
  try {
    cuerpo = await respuesta.json();
  } catch {
    // Respuesta sin JSON (por ejemplo un 502 del proxy): solo queda el código HTTP
  }
  const statusCode = typeof cuerpo.statusCode === 'number' ? cuerpo.statusCode : respuesta.status;
  const { message } = cuerpo;
  let mensajes: string[] = [];
  if (Array.isArray(message)) mensajes = message.filter((m): m is string => typeof m === 'string');
  else if (typeof message === 'string') mensajes = [message];
  if (mensajes.length === 0) mensajes = [`Error ${statusCode} al comunicarse con el servidor.`];
  return new ApiError(statusCode, mensajes);
}

async function solicitar<T>(metodo: string, ruta: string, cuerpo?: unknown): Promise<T> {
  let respuesta: Response;
  try {
    respuesta = await fetch(`${urlBase()}${ruta}`, {
      method: metodo,
      headers: cuerpo === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
    });
  } catch {
    // fetch solo falla así si no hubo respuesta (servidor apagado, sin red, CORS)
    throw new ApiError(0, [MENSAJE_SIN_CONEXION]);
  }
  if (!respuesta.ok) throw await leerError(respuesta);
  if (respuesta.status === 204) return undefined as T;
  return (await respuesta.json()) as T;
}

export function apiPost<T>(ruta: string, cuerpo: unknown): Promise<T> {
  return solicitar<T>('POST', ruta, cuerpo);
}
