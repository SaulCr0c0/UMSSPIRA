import { BadRequestException } from '@nestjs/common';
import type { ExperienceInput } from './experience.types';

// Valida y normaliza el JSON de creación/edición antes de enviarlo a PostgreSQL.
export function parseExperienceInput(body: unknown): ExperienceInput {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    throw new BadRequestException('El cuerpo de la solicitud debe ser un objeto.');
  }

  const input = body as Record<string, unknown>;
  const company = normalizedText(input.company);
  const position = normalizedText(input.position);
  const startDate = input.startDate;
  const endDate = input.endDate;
  const currentlyWorking = input.currentlyWorking;
  const employmentType = normalizedText(input.employmentType);
  const description = normalizedText(input.description);

  if (!company || company.length > 150) {
    throw new BadRequestException('La empresa es obligatoria y no puede superar 150 caracteres.');
  }
  if (!position || position.length > 100) {
    throw new BadRequestException('El cargo es obligatorio y no puede superar 100 caracteres.');
  }
  if (typeof startDate !== 'string' || !isDateOnly(startDate)) {
    throw new BadRequestException('La fecha de inicio debe tener el formato YYYY-MM-DD.');
  }
  if (typeof currentlyWorking !== 'boolean') {
    throw new BadRequestException('Indica si actualmente trabajas en esta empresa.');
  }

  let normalizedEndDate = '';
  if (!currentlyWorking) {
    if (typeof endDate !== 'string' || !isDateOnly(endDate) || endDate < startDate) {
      throw new BadRequestException(
        'La fecha de finalización debe ser válida y posterior a la de inicio.',
      );
    }
    normalizedEndDate = endDate;
  }
  if (!employmentType || employmentType.length > 50) {
    throw new BadRequestException('El tipo de empleo es obligatorio y no puede superar 50 caracteres.');
  }
  if (!description || description.length > 1500) {
    throw new BadRequestException('La descripción es obligatoria y no puede superar 1500 caracteres.');
  }

  // El fin de una experiencia vigente es NULL en PostgreSQL; la pantalla recibe
  // endDate vacío y reconstruye currentlyWorking a partir de ese dato.
  return {
    company,
    position,
    startDate,
    endDate: normalizedEndDate,
    currentlyWorking,
    employmentType,
    description,
  };
}

// Comprueba fechas de calendario reales, no solo la forma superficial del texto.
function isDateOnly(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

// Recorta los campos de texto y rechaza tipos distintos de string.
function normalizedText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}
