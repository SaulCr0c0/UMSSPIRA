import {
  IsIn,
  IsInt,
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Matches,
  Min,
} from 'class-validator';

import type {
  EventStatus,
  CreateEventDto as CreateEventContract,
} from '@umsspira/shared-types';
import {
  EVENT_DATE_RANGE_MESSAGE,
  EVENT_DATE_TIME_YEAR_PATTERN,
  EVENT_LOCATION_MAX_LENGTH,
  EVENT_TITLE_HAS_LETTER_PATTERN,
  EVENT_TITLE_MAX_LENGTH,
} from '../event-constraints';

type SharedEventMaxCapacity =
  typeof import('@umsspira/shared-types').EVENT_MAX_CAPACITY;

export const MAX_EVENT_CAPACITY: SharedEventMaxCapacity =
  10_000;

const CREATE_ALLOWED_STATUSES = [
  'BORRADOR',
  'PUBLICADO',
] as const;

export class CreateEventDto implements CreateEventContract {
  @IsNotEmpty({
    message: 'El título es obligatorio',
  })
  @IsString({
    message: 'El título debe ser texto',
  })
  @MaxLength(EVENT_TITLE_MAX_LENGTH, {
    message: 'El título no puede superar los 45 caracteres',
  })
  @Matches(EVENT_TITLE_HAS_LETTER_PATTERN, {
    message: 'El título debe contener al menos una letra',
  })
  title: string;

  @IsOptional()
  @IsString({
    message: 'La descripción debe ser texto',
  })
  description?: string;

  @IsISO8601(
    { strict: true },
    {
      message: 'La fecha de inicio debe ser una fecha válida',
    },
  )
  @Matches(EVENT_DATE_TIME_YEAR_PATTERN, {
    message: EVENT_DATE_RANGE_MESSAGE,
  })
  startDate: string;

  @IsISO8601(
    { strict: true },
    {
      message: 'La fecha de finalización debe ser una fecha válida',
    },
  )
  @Matches(EVENT_DATE_TIME_YEAR_PATTERN, {
    message: EVENT_DATE_RANGE_MESSAGE,
  })
  endDate: string;

  @IsInt({
    message: 'El cupo máximo debe ser un número entero entre 1 y 10000',
  })
  @Min(1, {
    message: 'El cupo máximo debe ser un número entero entre 1 y 10000',
  })
  @Max(MAX_EVENT_CAPACITY, {
    message: 'El cupo máximo debe ser un número entero entre 1 y 10000',
  })
  maxCapacity: number;

  @IsOptional()
  @IsString({
    message: 'La ubicación debe ser texto',
  })
  @MaxLength(EVENT_LOCATION_MAX_LENGTH, {
    message: 'La ubicación no puede superar los 100 caracteres',
  })
  location?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  imageUrl?: string;

  @IsOptional()
  @IsIn(CREATE_ALLOWED_STATUSES, {
    message: 'El estado debe ser BORRADOR o PUBLICADO',
  })
  status?: Extract<
    EventStatus,
    'BORRADOR' | 'PUBLICADO'
  >;
}
