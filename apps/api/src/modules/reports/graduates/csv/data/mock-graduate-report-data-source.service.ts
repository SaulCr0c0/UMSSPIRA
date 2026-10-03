import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Injectable } from '@nestjs/common';
import { GraduateCsvRecord } from '../types/graduate-csv-record.type';
import {
  GraduateReportDataSource,
  GraduateReportFilters,
} from './graduate-report-data-source';

interface MockGraduateRow {
  carrera: string;
  estado: string;
  apellido: string;
  nombre: string;
  codSis: string;
  telefono: string;
  email: string;
  fechaIngreso: string;
  fechaTitulacion: string;
  fechaRevision: string;
}

@Injectable()
export class MockGraduateReportDataSource implements GraduateReportDataSource {
  private readonly mockFilename = 'graduates-report.mock.csv';

  findAll(filters: GraduateReportFilters): GraduateCsvRecord[] {
    const rows = this.readRows();

    const filteredRows = rows.filter((row) => {
      if (row.estado !== filters.status) {
        return false;
      }

      if (
        filters.career &&
        this.normalize(row.carrera) !== this.normalize(filters.career)
      ) {
        return false;
      }

      if (filters.search) {
        const search = this.normalize(filters.search);
        const fullName = this.normalize(`${row.apellido} ${row.nombre}`);

        if (!fullName.includes(search)) {
          return false;
        }
      }

      return true;
    });

    return filteredRows.map((row, index) => ({
      numero: index + 1,
      nombreCompleto: `${row.apellido}, ${row.nombre}`,
      carrera: row.carrera,
      codigoSis: row.codSis,
      telefono: row.telefono,
      correoElectronico: row.email,
      fechaIngreso: this.formatDate(row.fechaIngreso),
      duracionCarrera: this.calculateDuration(
        row.fechaIngreso,
        row.fechaTitulacion,
      ),
      /*
       * El CSV temporal de HU4 no incluye fecha/anio de egreso.
       * Se conserva vacío para no inventar información. La fuente real de HU3
       * deberá mapear detalle_solicitud.anio_egreso cuando esté disponible.
       */
      fechaEgreso: '',
      fechaTitulacion: this.formatDate(row.fechaTitulacion),
      fechaVerificacion: this.formatDate(row.fechaRevision),
    }));
  }

  private readRows(): MockGraduateRow[] {
    const content = readFileSync(this.resolveMockFilePath(), 'utf8').replace(
      /^\uFEFF/,
      '',
    );
    const lines = content.split(/\r?\n/).filter((line) => line.trim() !== '');

    if (lines.length === 0) {
      return [];
    }

    const headers = this.parseDelimitedLine(lines[0]);
    const column = (name: string): number => {
      const index = headers.indexOf(name);

      if (index === -1) {
        throw new Error(`Falta la columna requerida "${name}" en el mock CSV`);
      }

      return index;
    };

    const indexes = {
      carrera: column('carrera'),
      estado: column('estado'),
      apellido: column('apellido'),
      nombre: column('nombre'),
      codSis: column('cod_sis'),
      telefono: column('telefono'),
      email: column('email'),
      fechaIngreso: column('fecha_ingreso'),
      fechaTitulacion: column('fecha_titulacion'),
      fechaRevision: column('fecha_verificacion_u_observacion'),
    };

    return lines.slice(1).map((line) => {
      const values = this.parseDelimitedLine(line);

      return {
        carrera: values[indexes.carrera] ?? '',
        estado: values[indexes.estado] ?? '',
        apellido: values[indexes.apellido] ?? '',
        nombre: values[indexes.nombre] ?? '',
        codSis: values[indexes.codSis] ?? '',
        telefono: values[indexes.telefono] ?? '',
        email: values[indexes.email] ?? '',
        fechaIngreso: values[indexes.fechaIngreso] ?? '',
        fechaTitulacion: values[indexes.fechaTitulacion] ?? '',
        fechaRevision: values[indexes.fechaRevision] ?? '',
      };
    });
  }

  private resolveMockFilePath(): string {
    const candidates = [
      join(process.cwd(), 'data', this.mockFilename),
      join(process.cwd(), 'apps', 'api', 'data', this.mockFilename),
    ];

    const filePath = candidates.find((candidate) => existsSync(candidate));

    if (!filePath) {
      throw new Error(
        `No se encontró el archivo temporal de datos ${this.mockFilename}`,
      );
    }

    return filePath;
  }

  private parseDelimitedLine(line: string): string[] {
    const values: string[] = [];
    let current = '';
    let quoted = false;

    for (let index = 0; index < line.length; index += 1) {
      const character = line[index];

      if (character === '"') {
        if (quoted && line[index + 1] === '"') {
          current += '"';
          index += 1;
        } else {
          quoted = !quoted;
        }

        continue;
      }

      if (character === ';' && !quoted) {
        values.push(current);
        current = '';
        continue;
      }

      current += character;
    }

    values.push(current);
    return values;
  }

  private normalize(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase();
  }

  private formatDate(value: string): string {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

    if (!match) {
      return value;
    }

    return `${match[3]}/${match[2]}/${match[1]}`;
  }

  private calculateDuration(startValue: string, endValue: string): string {
    const start = this.parseIsoDate(startValue);
    const end = this.parseIsoDate(endValue);

    if (!start || !end || end < start) {
      return '';
    }

    let totalMonths =
      (end.getUTCFullYear() - start.getUTCFullYear()) * 12 +
      (end.getUTCMonth() - start.getUTCMonth());

    if (end.getUTCDate() < start.getUTCDate()) {
      totalMonths -= 1;
    }

    const years = Math.floor(totalMonths / 12);
    const months = totalMonths % 12;

    const yearText = `${years} ${years === 1 ? 'año' : 'años'}`;
    const monthText = `${months} ${months === 1 ? 'mes' : 'meses'}`;

    return `${yearText}, ${monthText}`;
  }

  private parseIsoDate(value: string): Date | null {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return null;
    }

    const date = new Date(`${value}T00:00:00Z`);

    return Number.isNaN(date.getTime()) ? null : date;
  }
}
