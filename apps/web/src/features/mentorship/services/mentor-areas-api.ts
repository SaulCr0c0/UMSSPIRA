import { getAccessToken, clearAccessToken } from '@/shared/services/auth-session';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000').replace(/\/+$/, '');

export interface MentorArea {
  id: string;
  nombre: string;
  descripcion: string | null;
}

export interface MentorAreasState {
  areas: MentorArea[];
  selectedIds: string[];
  /** Opcional hasta que la API entregue los intereses dependientes. */
  intereses?: { id_area: string; nombre: string }[];
}

export class MentorAreasError extends Error {
  constructor(message: string, public readonly status: number) { super(message); }
}

const VALIDATION_MESSAGES = new Map([
  ['CANTIDAD_AREAS_INVALIDA', 'Debes seleccionar entre 1 y 5 áreas técnicas.'],
  ['AREA_NO_EXISTE', 'Una o más áreas seleccionadas ya no están disponibles en el catálogo.'],
  ['AREA_NO_VALIDA', 'Selecciona únicamente áreas técnicas del catálogo.'],
  ['AREA_INACTIVA', 'Una o más áreas seleccionadas están inactivas. Revisa tu selección.'],
]);

async function request(path: string, options: RequestInit = {}): Promise<unknown> {
  const token = getAccessToken();
  if (!token) throw new Error('Inicia sesión para configurar tus áreas técnicas.');

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'omit',
    cache: 'no-store',
    headers: {
      Accept: 'application/json',
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    if (response.status === 401 && getAccessToken() === token) clearAccessToken();
    if (response.status >= 500 && response.status <= 599) {
      throw new MentorAreasError(
        options.method === 'PATCH'
          ? 'No pudimos guardar tus áreas técnicas. Intenta nuevamente en unos momentos.'
          : 'No pudimos cargar las áreas técnicas. Intenta nuevamente en unos momentos.',
        response.status,
      );
    }
    if (response.status === 400 || response.status === 422) {
      let message = 'Revisa las áreas seleccionadas e intenta nuevamente.';
      try {
        const body: unknown = await response.json();
        if (body && typeof body === 'object' && 'code' in body && typeof body.code === 'string') {
          message = VALIDATION_MESSAGES.get(body.code) ?? message;
        }
      } catch {
        // Un cuerpo vacío o inválido conserva el mensaje local de validación.
      }
      throw new MentorAreasError(message, response.status);
    }
    const messages: Record<number, string> = {
      401: 'Inicia sesión para configurar tus áreas técnicas.',
      403: 'No tienes permisos para acceder a esta sección',
      404: 'No se encontró el perfil de mentor.',
    };
    throw new MentorAreasError(
      messages[response.status]
      || `No se pudieron guardar las áreas (HTTP ${response.status}).`, response.status,
    );
  }
  return response.json();
}

function parseAreasState(value: unknown): MentorAreasState {
  if (!value || typeof value !== 'object' || !('areas' in value) || !Array.isArray(value.areas)
    || !('selectedIds' in value) || !Array.isArray(value.selectedIds)) {
    throw new Error('El backend devolvió el catálogo de áreas con un formato inválido.');
  }

  const areas: MentorArea[] = [];
  const seenIds = new Set<string>();
  const seenNames = new Set<string>();
  for (const item of value.areas) {
    if (!item || typeof item !== 'object' || !('id' in item) || typeof item.id !== 'string'
      || !('nombre' in item) || typeof item.nombre !== 'string'
      || !('descripcion' in item) || (item.descripcion !== null && typeof item.descripcion !== 'string')) {
      throw new Error('El backend devolvió un área con un formato inválido.');
    }
    const normalizedName = item.nombre.trim().toLocaleLowerCase('es');
    if (!normalizedName || seenIds.has(item.id) || seenNames.has(normalizedName)) continue;
    seenIds.add(item.id);
    seenNames.add(normalizedName);
    areas.push({ id: item.id, nombre: item.nombre, descripcion: item.descripcion });
  }

  const selectableIds = new Set(areas.map(area => area.id));
  const selectedIds = new Set<string>();
  for (const id of value.selectedIds) {
    if (typeof id !== 'string') {
      throw new Error('El backend devolvió las áreas seleccionadas con un formato inválido.');
    }
    if (selectableIds.has(id)) selectedIds.add(id);
  }
  let intereses: MentorAreasState['intereses'];
  if ('intereses' in value) {
    if (!Array.isArray(value.intereses) || value.intereses.some(item => !item || typeof item !== 'object'
      || typeof item.id_area !== 'string' || typeof item.nombre !== 'string')) {
      throw new Error('El backend devolvió los intereses dependientes con un formato inválido.');
    }
    intereses = value.intereses.map(item => ({ id_area: item.id_area, nombre: item.nombre }));
  }
  return { areas, selectedIds: Array.from(selectedIds), ...(intereses === undefined ? {} : { intereses }) };
}

export async function getMentorAreas(signal?: AbortSignal): Promise<MentorAreasState> {
  return parseAreasState(await request('/mentorship/my-profile/areas', { method: 'GET', signal }));
}

export async function updateMentorAreas(areaIds: string[], signal?: AbortSignal): Promise<MentorAreasState> {
  return parseAreasState(await request('/mentorship/my-profile/areas', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ areaIds: Array.from(new Set(areaIds)) }),
    signal,
  }));
}
