import { apiUrl } from '@/shared/services/api-contract';
import { authenticatedFetch, SessionError } from '@/shared/services/auth-session';
import {
  mockMentorsList,
  mentorDetailProfileSchema,
  type MentorDetailProfile,
} from '../model/mentor-detail';

export class MentorNotFoundError extends Error {
  constructor(message = 'Este perfil ya no está disponible.') {
    super(message);
    this.name = 'MentorNotFoundError';
  }
}

/**
 * Flag de entorno para pruebas y desarrollo frontend independiente.
 * El mock se activa ÚNICAMENTE si NEXT_PUBLIC_MOCK_MENTOR_DETAIL === 'true'.
 * En caso contrario se consulta el backend real y cualquier fallo muestra el estado de error.
 */
export const isMentorDetailMockEnabled = (): boolean => {
  return process.env.NEXT_PUBLIC_MOCK_MENTOR_DETAIL === 'true';
};

/**
 * Encuentra el mentor mock adecuado mapeando IDs estándar, slugs o índices.
 */
function findMockMentor(mentorId: string): MentorDetailProfile | null {
  const normalized = mentorId.trim().toLowerCase();

  // Búsqueda directa por id
  const direct = mockMentorsList.find((m) => m.id.toLowerCase() === normalized);
  if (direct) return direct;

  // Mapeos por número o alias comunes del directorio
  if (['1', 'mentor-1', 'carlos'].includes(normalized)) return mockMentorsList[0];
  if (['2', 'mentor-2', 'luis'].includes(normalized)) return mockMentorsList[1];
  if (['3', 'mentor-3', 'rodrigo'].includes(normalized)) return mockMentorsList[2];
  if (['4', 'mentor-4', 'gabriela'].includes(normalized)) return mockMentorsList[3];
  if (['5', 'mentor-5', 'paola-mendez'].includes(normalized)) return mockMentorsList[4];

  // Si no coincide con ninguno específico pero se solicita un ID genérico en mock,
  // devolvemos el primer mentor adaptando su ID para permitir ver el perfil.
  return { ...mockMentorsList[0], id: mentorId };
}

/**
 * Simulación de estados para pruebas de diseño y QA cuando el mock está activo.
 * Se puede activar con ?state=loading | notfound | unavailable | paused | empty | error
 */
function handleMockSimulation(
  baseMentor: MentorDetailProfile,
  simulatedState?: string | null,
  signal?: AbortSignal,
): Promise<MentorDetailProfile> {
  return new Promise<MentorDetailProfile>((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }

    const state = simulatedState?.toLowerCase();

    if (state === 'loading') {
      // Estado de carga indefinido para inspeccionar skeletons
      const timer = setTimeout(() => resolve(baseMentor), 120_000);
      signal?.addEventListener('abort', () => clearTimeout(timer));
      return;
    }

    if (state === 'notfound') {
      reject(new MentorNotFoundError());
      return;
    }

    if (state === 'error') {
      reject(new Error('Ocurrió un problema al consultar el perfil del mentor. Revisa tu conexión e inténtalo nuevamente.'));
      return;
    }

    if (state === 'unavailable') {
      resolve({
        ...baseMentor,
        availability: 'UNAVAILABLE',
        slots: [],
      });
      return;
    }

    if (state === 'paused') {
      resolve({
        ...baseMentor,
        availability: 'PAUSED',
        slots: [],
      });
      return;
    }

    if (state === 'empty') {
      resolve({
        ...baseMentor,
        about: null,
        experience: null,
        relevantInfo: null,
        technicalAreas: [],
        interests: [],
      });
      return;
    }

    resolve(baseMentor);
  });
}

/**
 * Obtiene el detalle público de un mentor por su identificador.
 *
 * Ruta backend centralizada:
 * // Pendiente de confirmar con backend: GET /api/v1/mentorship/profiles/:mentorId
 */
export async function getMentorDetail(
  mentorId: string,
  options?: {
    signal?: AbortSignal;
    simulatedState?: string | null;
  },
): Promise<MentorDetailProfile> {
  if (!mentorId || !mentorId.trim()) {
    throw new MentorNotFoundError();
  }

  // 1. Modo Mock activado exclusivamente por variable de entorno
  if (isMentorDetailMockEnabled()) {
    const mock = findMockMentor(mentorId);
    if (!mock) throw new MentorNotFoundError();
    return handleMockSimulation(mock, options?.simulatedState, options?.signal);
  }

  // 2. Consulta al backend real (el parámetro ?state no tiene efecto aquí)
  // Misma convención de ruta que mentor-directory-api.ts (/api/v1/mentorship/profiles)
  const endpoint = apiUrl(`/api/v1/mentorship/profiles/${encodeURIComponent(mentorId)}`);

  const response = await authenticatedFetch(endpoint, {
    method: 'GET',
    cache: 'no-store',
    credentials: 'omit',
    signal: options?.signal,
    headers: { Accept: 'application/json' },
  });

  if (response.status === 401) {
    throw new SessionError(401, 'Inicia sesión nuevamente para consultar el perfil del mentor.');
  }

  if (response.status === 404) {
    throw new MentorNotFoundError();
  }

  if (!response.ok) {
    throw new Error('Ocurrió un problema al consultar el perfil del mentor. Revisa tu conexión e inténtalo nuevamente.');
  }

  const rawJson = (await response.json()) as { data?: unknown };
  const data = rawJson?.data ?? rawJson;

  const parsed = mentorDetailProfileSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error('No se pudo interpretar la respuesta del perfil del mentor. Inténtalo nuevamente.');
  }

  return parsed.data;
}
