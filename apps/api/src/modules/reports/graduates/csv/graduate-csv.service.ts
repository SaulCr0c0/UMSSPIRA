import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { GraduateCsvRecord } from './types/graduate-csv-record.type';

export interface GeneratedCsvFile {
  buffer: Buffer;
  filename: string;
}

@Injectable()
export class GraduateCsvService {
  private readonly headers = [
    'Número',
    'Nombre completo',
    'Carrera',
    'Código SIS',
    'Teléfono',
    'Correo electrónico',
    'Fecha de ingreso',
    'Duración de la carrera',
    'Fecha de egreso',
    'Fecha de titulación',
    'Fecha de verificación',
  ];

  generate(
    records: GraduateCsvRecord[],
    generationDate: Date = new Date(),
  ): GeneratedCsvFile {
    if (!Array.isArray(records) || records.length === 0) {
      throw new BadRequestException(
        'No hay egresados verificados para exportar',
      );
    }

    try {
      const rows = records.map((record) =>
        [
          record.numero,
          record.nombreCompleto,
          record.carrera,
          record.codigoSis,
          record.telefono,
          record.correoElectronico,
          record.fechaIngreso,
          record.duracionCarrera,
          record.fechaEgreso,
          record.fechaTitulacion,
          record.fechaVerificacion,
        ]
          .map((value) => this.escapeValue(value))
          .join(','),
      );

      const headerRow = this.headers
        .map((header) => this.escapeValue(header))
        .join(',');

      /*
       * Se usa CRLF para una mejor compatibilidad con Excel.
       * El carácter \uFEFF corresponde al BOM requerido para UTF-8.
       */
      const csvContent = `\uFEFF${[headerRow, ...rows].join('\r\n')}\r\n`;

      return {
        buffer: Buffer.from(csvContent, 'utf8'),
        filename: this.buildFilename(generationDate),
      };
    } catch {
      throw new InternalServerErrorException(
        'No se pudo generar el archivo CSV. Intente nuevamente.',
      );
    }
  }

  private escapeValue(value: string | number): string {
    const text = String(value ?? '');

    const escapedText = text.replace(/"/g, '""');

    const requiresQuotes =
      escapedText.includes(',') ||
      escapedText.includes('"') ||
      escapedText.includes('\n') ||
      escapedText.includes('\r');

    return requiresQuotes ? `"${escapedText}"` : escapedText;
  }

  private buildFilename(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `nomina-egresados-verificados-${day}${month}${year}.csv`;
  }
}
