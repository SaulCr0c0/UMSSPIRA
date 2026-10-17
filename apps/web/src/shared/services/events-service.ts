import type {
  CreateEventDto,
  EventItem,
  UpdateDraftEventDto,
} from '@umsspira/shared-types';

import { apiClient } from './api-client';
import { getSessionToken } from '@/modules/auth/frontend/services/session';
import { getAccessToken } from '@/shared/services/auth-session';
import { getToken } from '@/shared/services/api-client';

const MAX_EVENT_COVER_SIZE = 5 * 1024 * 1024;
const EVENT_COVER_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export async function uploadEventCover(file: File): Promise<string> {
  if (!EVENT_COVER_TYPES.has(file.type)) {
    throw new Error('Formato no admitido. Solo se permiten imágenes JPG, PNG o WebP.');
  }
  if (file.size > MAX_EVENT_COVER_SIZE) {
    throw new Error('La imagen no puede superar los 5 MB.');
  }

  const body = new FormData();
  body.append('file', file);
  const headers = getEventSessionHeaders();
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'}/api/events/admin/cover`,
    { method: 'POST', headers, body },
  );
  const result = await response.json().catch(() => null) as { imageUrl?: string; message?: string | string[] } | null;
  if (!response.ok || !result?.imageUrl) {
    const message = Array.isArray(result?.message) ? result.message.join(' ') : result?.message;
    throw new Error(message || 'No se pudo guardar la portada.');
  }
  return result.imageUrl;
}

export async function removeEventCover(imageUrl: string): Promise<void> {
  const headers = getEventSessionHeaders();
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'}/api/events/admin/cover?imageUrl=${encodeURIComponent(imageUrl)}`,
    { method: 'DELETE', headers },
  );
  if (!response.ok) throw new Error('No se pudo limpiar la portada temporal.');
}

function getEventSessionHeaders(): HeadersInit {
  const token = getSessionToken() ?? getAccessToken() ?? getToken();
  if (!token) throw new Error('Debes iniciar sesión para gestionar eventos.');
  return { Authorization: `Bearer ${token}` };
}

export function getEventCatalog(): Promise<EventItem[]> {
  return apiClient<EventItem[]>('/api/events/catalog');
}

export function getPublishedEvent(eventId: string): Promise<EventItem> {
  return apiClient<EventItem>(
    `/api/events/${encodeURIComponent(eventId)}`,
  );
}

export function createEvent(
  event: CreateEventDto,
  userId?: string,
): Promise<EventItem> {
  if (!userId) {
    throw new Error(
      'No hay un usuario autenticado disponible para crear el evento.',
    );
  }

  return apiClient<EventItem>('/api/events', {
    method: 'POST',
    headers: getEventSessionHeaders(),
    body: event,
  });
}

export function getAdminEvents(
  userId?: string,
): Promise<EventItem[]> {
  requireUserId(
    userId,
    'consultar los eventos',
  );

  return apiClient<EventItem[]>('/api/events/admin', {
    headers: getEventSessionHeaders(),
  });
}

export function getAdminDraft(
  eventId: string,
  userId?: string,
): Promise<EventItem> {
  requireUserId(
    userId,
    'consultar el borrador',
  );

  return apiClient<EventItem>(
    `/api/events/admin/${encodeURIComponent(eventId)}`,
    { headers: getEventSessionHeaders() },
  );
}

export function getAdminEvent(
  eventId: string,
  userId?: string,
): Promise<EventItem> {
  requireUserId(userId, 'consultar el evento');
  return apiClient<EventItem>(
    `/api/events/admin/event/${encodeURIComponent(eventId)}`,
    { headers: getEventSessionHeaders() },
  );
}

export function updateDraftEvent(
  eventId: string,
  event: UpdateDraftEventDto,
  userId?: string,
): Promise<EventItem> {
  requireUserId(
    userId,
    'actualizar el borrador',
  );

  return apiClient<EventItem>(
    `/api/events/admin/${encodeURIComponent(eventId)}`,
    {
      method: 'PATCH',
      headers: getEventSessionHeaders(),
      body: event,
    },
  );
}

export function publishDraftEvent(
  eventId: string,
  userId?: string,
): Promise<EventItem> {
  requireUserId(
    userId,
    'publicar el borrador',
  );

  return apiClient<EventItem>(
    `/api/events/admin/${encodeURIComponent(eventId)}/publish`,
    {
      method: 'PATCH',
      headers: getEventSessionHeaders(),
    },
  );
}

function requireUserId(
  userId: string | undefined,
  operation: string,
): string {
  if (!userId) {
    throw new Error(
      `No hay un usuario autenticado disponible para ${operation}.`,
    );
  }

  return userId;
}
