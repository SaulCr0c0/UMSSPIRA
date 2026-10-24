import type { Event } from '../../domain/entities/event';

export function presentEvent(event: Event) {
  return {
    id: event.id,
    title: event.title,
    description: event.description,
    startDate: event.startDate.toISOString(),
    endDate: event.endDate.toISOString(),
    maxCapacity: event.maxCapacity,
    ...(event.currentCapacity === undefined ? {} : { currentCapacity: event.currentCapacity }),
    location: event.location,
    imageUrl: event.coverId ? '/api/v1/events/covers/' + event.coverId : null,
    status: event.status,
    createdBy: event.ownerId,
    creatorName: event.creatorName,
    createdAt: event.createdAt.toISOString(),
  };
}
