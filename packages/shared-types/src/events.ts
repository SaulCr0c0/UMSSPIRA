export const EVENT_STATUS = {
  BORRADOR: 'BORRADOR',
  PUBLICADO: 'PUBLICADO',
  CANCELADO: 'CANCELADO',
} as const;

export const EVENT_MAX_CAPACITY = 10_000 as const;
export const EVENT_TITLE_MAX_LENGTH = 45 as const;
export const EVENT_LOCATION_MAX_LENGTH = 100 as const;
export const EVENT_DATE_MIN_YEAR = 1900 as const;
export const EVENT_DATE_MAX_YEAR = 2100 as const;

export type EventStatus = (typeof EVENT_STATUS)[keyof typeof EVENT_STATUS];

export interface EventItem {
  id: string;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string;
  maxCapacity: number;
  currentCapacity?: number;
  location: string | null;
  imageUrl?: string | null;
  status: EventStatus;
  createdBy: string;
  creatorName?: string;
  createdAt: string;
}

export interface CreateEventDto {
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  maxCapacity: number;
  location?: string;
  imageUrl?: string;
  status?: Extract<EventStatus, 'BORRADOR' | 'PUBLICADO'>;
}

export type UpdateDraftEventDto = Omit<CreateEventDto, 'status'>;

export interface EventFilters {
  status?: EventStatus;
  upcomingOnly?: boolean;
}
