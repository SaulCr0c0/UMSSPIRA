export type EventStatus = 'BORRADOR' | 'PUBLICADO' | 'CANCELADO';

export interface Event {
  id: string;
  ownerId: string;
  title: string;
  description: string | null;
  startDate: Date;
  endDate: Date;
  maxCapacity: number;
  location: string | null;
  coverId: string | null;
  status: EventStatus;
  creatorName: string | null;
  createdAt: Date;
}

export type InactiveEventStatus = 'CANCELADO' | 'FINALIZADO';

