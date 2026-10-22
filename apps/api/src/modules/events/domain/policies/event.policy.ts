import { BusinessRuleError } from '../../../../shared/errors/business-rule-error';
import type { Event } from '../entities/event';

export function assertDraft(event: Event): void {
  if (event.status !== 'BORRADOR') {
    throw new BusinessRuleError(
      'conflict',
      'EVENT_NOT_DRAFT',
      'El evento ya no está en estado BORRADOR',
    );
  }
}

export function validateEventDates(start: Date, end: Date): void {
  if (
    [start, end].some(
      (date) =>
        Number.isNaN(date.getTime()) ||
        date.getUTCFullYear() < 1900 ||
        date.getUTCFullYear() > 2100,
    )
  ) {
    throw new BusinessRuleError(
      'invalid',
      'INVALID_EVENT_DATES',
      'Las fechas deben estar entre los años 1900 y 2100',
    );
  }
  if (end <= start) {
    throw new BusinessRuleError(
      'invalid',
      'INVALID_EVENT_DATES',
      'La fecha de fin debe ser posterior al inicio',
    );
  }
}
