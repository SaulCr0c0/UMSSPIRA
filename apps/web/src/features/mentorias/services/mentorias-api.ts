import type { MentorState } from '@umsspira/shared-types';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000').replace(/\/+$/, '');

function isMentorState(value: unknown): value is MentorState {
  if (!value || typeof value !== 'object') return false;
  const state = value as Partial<MentorState>;
  return typeof state.isActive === 'boolean'
    && !!state.requirements
    && typeof state.requirements.egresado === 'boolean'
    && typeof state.requirements.perfil === 'boolean';
}

async function requestProfile(path: string, options: RequestInit): Promise<MentorState> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    cache: 'no-store',
    headers: { Accept: 'application/json', ...options.headers },
  });
  if (!response.ok) {
    const messages: Record<number, string> = {
      401: 'Inicia sesión para consultar tu participación como mentor.',
      403: 'No tienes permiso o no cumples los requisitos para esta operación.',
      404: 'El backend no tiene disponible el endpoint de perfil de mentor.',
    };
    throw new Error(messages[response.status] || `El backend respondió con un error (HTTP ${response.status}).`);
  }
  const data: unknown = await response.json();
  if (!isMentorState(data)) throw new Error('El backend devolvió un perfil de mentor con un formato inválido.');
  return data;
}

export function getMentorProfile(signal?: AbortSignal) {
  return requestProfile('/mentorias/mi-perfil', { method: 'GET', signal });
}

export function updateMentorParticipation(isActive: boolean, signal?: AbortSignal) {
  return requestProfile('/mentorias/mi-perfil/participacion', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isActive }),
    signal,
  });
}
