type SharedEventTitleMaxLength =
  typeof import('@umsspira/shared-types').EVENT_TITLE_MAX_LENGTH;
type SharedEventLocationMaxLength =
  typeof import('@umsspira/shared-types').EVENT_LOCATION_MAX_LENGTH;
type SharedEventDateMinYear =
  typeof import('@umsspira/shared-types').EVENT_DATE_MIN_YEAR;
type SharedEventDateMaxYear =
  typeof import('@umsspira/shared-types').EVENT_DATE_MAX_YEAR;

export const EVENT_TITLE_MAX_LENGTH: SharedEventTitleMaxLength = 45;
export const EVENT_LOCATION_MAX_LENGTH: SharedEventLocationMaxLength = 100;
export const EVENT_DATE_MIN_YEAR: SharedEventDateMinYear = 1900;
export const EVENT_DATE_MAX_YEAR: SharedEventDateMaxYear = 2100;
export const EVENT_TITLE_HAS_LETTER_PATTERN = /\p{L}/u;
export const EVENT_DATE_TIME_YEAR_PATTERN = /^(?:19\d{2}|20\d{2}|2100)-/;

export function isEventDateTimeWithinRange(value: string): boolean {
  if (!EVENT_DATE_TIME_YEAR_PATTERN.test(value)) return false;

  const date = new Date(value);
  return !Number.isNaN(date.getTime());
}

export const EVENT_DATE_RANGE_MESSAGE =
  `La fecha debe tener un año de 4 dígitos entre ${EVENT_DATE_MIN_YEAR} y ${EVENT_DATE_MAX_YEAR}`;
