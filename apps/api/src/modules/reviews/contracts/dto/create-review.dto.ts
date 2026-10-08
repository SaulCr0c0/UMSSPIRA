import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';

export const REVIEW_DECISIONS = ['APPROVED', 'OBSERVED', 'REJECTED'] as const;
export type ReviewDecisionValue = (typeof REVIEW_DECISIONS)[number];

// Mismos valores que el CHECK de dictamen.categoria en la base de datos
export const REVIEW_CATEGORIES = [
  'DATOS_INCORRECTOS',
  'DOC_ILEGIBLE',
  'DOC_VENCIDO',
  'DOC_NO_CORRESPONDE',
  'FALTA_FIRMA_SELLO',
  'INFO_NO_COINCIDE',
  'OTRO',
] as const;
export type ReviewCategory = (typeof REVIEW_CATEGORIES)[number];

export const MIN_NOTE_LENGTH = 10;
export const MAX_NOTE_LENGTH = 500;

// La categoría y la nota solo son obligatorias al observar o rechazar
const requiresJustification = (o: CreateReviewDto) =>
  o.decision === 'OBSERVED' || o.decision === 'REJECTED';

// Quita espacios al inicio y al final antes de validar
const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class CreateReviewDto {
  @IsIn(REVIEW_DECISIONS, {
    message: 'La decisión debe ser APPROVED, OBSERVED o REJECTED.',
  })
  decision!: ReviewDecisionValue;

  @ValidateIf(requiresJustification)
  @IsIn(REVIEW_CATEGORIES, {
    message: `La categoría es obligatoria y debe ser una de: ${REVIEW_CATEGORIES.join(', ')}.`,
  })
  category?: ReviewCategory;

  @ValidateIf(requiresJustification)
  @Transform(trim)
  @IsString({ message: 'La justificación es obligatoria.' })
  @MinLength(MIN_NOTE_LENGTH, {
    message: `La justificación debe tener al menos ${MIN_NOTE_LENGTH} caracteres.`,
  })
  @MaxLength(MAX_NOTE_LENGTH, {
    message: `La justificación no puede superar ${MAX_NOTE_LENGTH} caracteres.`,
  })
  note?: string;

  @IsOptional()
  @IsBoolean()
  notifyDean?: boolean;
}