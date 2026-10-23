import { z } from 'zod';
import { apiUrl } from '@/shared/services/api-contract';
import { authenticatedFetch, SessionError } from '@/shared/services/auth-session';
import { mentorAvailabilityStatuses } from './mentor-availability-api';
import {
  directoryCatalog, filterDirectory, uniqueMentors,
  type DirectoryMentor, type DirectoryPage, type DirectoryQuery,
} from '../model/mentor-directory';

const areaReference = z.object({ id: z.string().min(1), nombre: z.string() });
const interestReference = areaReference.extend({ area: areaReference });

// Optional extensions let the frontend consume the backend branch once merged,
// while still reading the current array response without inventing profile data.
const directoryResponse = z.object({ data: z.array(z.object({
  id: z.string().min(1),
  nombre: z.string(),
  descripcion: z.string().nullable(),
  foto_perfil: z.string().nullable(),
  esta_activo: z.boolean().nullable(),
  areas: z.array(areaReference),
  availabilityStatus: z.enum(mentorAvailabilityStatuses).nullable(),
  cargo: z.string().nullable().optional(),
  empresa: z.string().nullable().optional(),
  intereses: z.array(interestReference).optional(),
})), catalog: z.array(z.object({ area: areaReference, intereses: z.array(areaReference) })).optional() });

function publicPhoto(value: string | null): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password ? url.href : null;
  } catch { return null; }
}

export async function getMentorDirectory(query: DirectoryQuery, signal?: AbortSignal): Promise<DirectoryPage> {
  // Use the existing session client. No reads from other mentors' private endpoints.
  const response = await authenticatedFetch(apiUrl('/api/v1/mentorship/profiles'), {
    method: 'GET', cache: 'no-store', credentials: 'omit', signal,
    headers: { Accept: 'application/json' },
  });
  if (response.status === 401) throw new SessionError(401, 'Inicia sesión nuevamente para consultar el directorio.');
  if (!response.ok) throw new Error('Ocurrió un problema al consultar los mentores. Revisa tu conexión e inténtalo nuevamente.');
  const parsed = directoryResponse.safeParse(await response.json());
  if (!parsed.success) throw new Error('No se pudo interpretar la respuesta del directorio. Inténtalo nuevamente.');
  // CA-F 03 explicitly requires AVAILABLE; paused and unknown states are excluded.
  const mentors: DirectoryMentor[] = uniqueMentors(parsed.data.data
    .filter(item => item.esta_activo === true && item.availabilityStatus === 'AVAILABLE')
    .map(item => ({
      id: item.id, name: item.nombre, description: item.descripcion,
      photoUrl: publicPhoto(item.foto_perfil), areas: item.areas.map(area => ({ id: area.id, name: area.nombre })),
      availability: item.availabilityStatus,
      profession: [item.cargo, item.empresa].filter(value => value?.trim()).join(' | ') || undefined,
      interests: item.intereses?.map(interest => ({ id: interest.id, name: interest.nombre, areaId: interest.area.id })),
    })));
  const matches = filterDirectory(mentors, query);
  // Existing API returns a complete array; no invented pagination/filter parameters.
  return {
    mentors: matches.slice(query.offset, query.offset + query.limit), total: matches.length,
    catalog: parsed.data.catalog?.map(group => ({ id: group.area.id, name: group.area.nombre,
      description: '', topics: group.intereses.map(interest => ({ id: interest.id, name: interest.nombre })),
    })) ?? directoryCatalog(mentors),
    interestsSupported: parsed.data.catalog !== undefined || parsed.data.data.some(mentor => mentor.intereses !== undefined),
  };
}
