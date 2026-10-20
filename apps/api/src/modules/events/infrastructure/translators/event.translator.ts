import type { Evento } from '../../../../generated/prisma/client';
import type { Event, EventStatus } from '../../domain/entities/event';

export function toEvent(row: Evento & { usuario?: { nombre: string | null } | null }): Event {
  const status = row.estado?.toUpperCase();
  if (
    !row.id_usuario ||
    !row.titulo ||
    !row.fecha_inicio ||
    !row.fecha_fin ||
    !row.fecha_creacion ||
    !row.cupo_maximo ||
    !['BORRADOR', 'PUBLICADO', 'CANCELADO'].includes(status ?? '')
  ) {
    throw new Error('Evento persistido incompleto');
  }
  return {
    id: row.id,
    ownerId: row.id_usuario,
    title: row.titulo,
    description: row.descripcion,
    startDate: row.fecha_inicio,
    endDate: row.fecha_fin,
    maxCapacity: row.cupo_maximo,
    location: row.ubicacion,
    coverId: row.id_portada,
    status: status as EventStatus,
    creatorName: row.usuario?.nombre ?? null,
    createdAt: row.fecha_creacion,
  };
}
