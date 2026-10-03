import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import * as assert from 'node:assert/strict';
import { Readable } from 'node:stream';
import { test } from 'node:test';
import { MockGraduateReportDataSource } from '../data/mock-graduate-report-data-source.service';
import { GraduateCsvController } from '../graduate-csv.controller';
import { GraduateCsvService } from '../graduate-csv.service';
import { GraduateCsvRecord } from '../types/graduate-csv-record.type';

function createRecord(
  overrides: Partial<GraduateCsvRecord> = {},
): GraduateCsvRecord {
  return {
    numero: 1,
    nombreCompleto: 'Ana Muñoz Pérez',
    carrera: 'Ingeniería de Sistemas',
    codigoSis: '202012345',
    telefono: '70707070',
    correoElectronico: 'ana.munoz@example.com',
    fechaIngreso: '01/02/2020',
    duracionCarrera: '5 años',
    fechaEgreso: '15/12/2024',
    fechaTitulacion: '20/03/2025',
    fechaVerificacion: '01/10/2026',
    ...overrides,
  };
}

async function streamToBuffer(stream: Readable): Promise<Buffer> {
  const chunks: Buffer[] = [];

  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  return Buffer.concat(chunks);
}

test('genera un CSV con BOM UTF-8, 11 encabezados y nombre dinámico', () => {
  const service = new GraduateCsvService();
  const generationDate = new Date(2026, 9, 1, 12, 0, 0);

  const { buffer, filename } = service.generate(
    [createRecord()],
    generationDate,
  );

  assert.deepEqual(Array.from(buffer.subarray(0, 3)), [0xef, 0xbb, 0xbf]);
  assert.equal(filename, 'nomina-egresados-verificados-01102026.csv');

  const content = buffer.toString('utf8');
  assert.ok(content.startsWith('\uFEFF'));

  const contentWithoutBom = content.slice(1);
  const [header] = contentWithoutBom.split('\r\n');
  assert.equal(header.split(',').length, 11);
  assert.equal(
    header,
    'Número,Nombre completo,Carrera,Código SIS,Teléfono,Correo electrónico,Fecha de ingreso,Duración de la carrera,Fecha de egreso,Fecha de titulación,Fecha de verificación',
  );
  assert.ok(content.includes('Ana Muñoz Pérez'));
  assert.ok(content.includes('Ingeniería de Sistemas'));
  assert.ok(content.endsWith('\r\n'));
});

test('escapa comas, comillas y saltos de línea sin perder caracteres especiales', () => {
  const service = new GraduateCsvService();
  const record = createRecord({
    nombreCompleto: 'Muñoz, Ana "Ñusta"\nSegunda línea',
    carrera: 'Ingeniería, Sistemas',
  });

  const { buffer } = service.generate([record], new Date(2026, 9, 1));
  const content = buffer.toString('utf8');

  assert.ok(content.includes('"Muñoz, Ana ""Ñusta""\nSegunda línea"'));
  assert.ok(content.includes('"Ingeniería, Sistemas"'));
  assert.ok(content.includes('Ñusta'));
});

test('rechaza la exportación cuando no existen egresados verificados', () => {
  const service = new GraduateCsvService();

  assert.throws(() => service.generate([]), (error: unknown) => {
    assert.ok(error instanceof BadRequestException);
    assert.equal(error.message, 'No hay egresados verificados para exportar');
    return true;
  });
});

test('devuelve el mensaje esperado cuando ocurre un error de generación', () => {
  const service = new GraduateCsvService();
  const record = createRecord();

  Object.defineProperty(record, 'nombreCompleto', {
    get() {
      throw new Error('error simulado');
    },
  });

  assert.throws(() => service.generate([record]), (error: unknown) => {
    assert.ok(error instanceof InternalServerErrorException);
    assert.equal(
      error.message,
      'No se pudo generar el archivo CSV. Intente nuevamente.',
    );
    return true;
  });
});

test('la fuente temporal conserva los 105 registros ficticios de HU4', () => {
  const dataSource = new MockGraduateReportDataSource();
  const verified = dataSource.findAll({ status: 'verificado' });
  const observed = dataSource.findAll({ status: 'observado' });

  assert.equal(verified.length, 82);
  assert.equal(observed.length, 23);
  assert.equal(verified.length + observed.length, 105);
});

test('filtra verificados por carrera sin aplicar paginación', () => {
  const dataSource = new MockGraduateReportDataSource();
  const systems = dataSource.findAll({
    status: 'verificado',
    career: 'Ingeniería de Sistemas',
  });
  const informatics = dataSource.findAll({
    status: 'verificado',
    career: 'Ingeniería Informática',
  });

  assert.equal(systems.length, 72);
  assert.equal(informatics.length, 10);
  assert.equal(systems[0].numero, 1);
  assert.equal(systems[systems.length - 1].numero, 72);
});

test('aplica búsqueda por nombre o apellido ignorando tildes y mayúsculas', () => {
  const dataSource = new MockGraduateReportDataSource();
  const records = dataSource.findAll({
    status: 'verificado',
    career: 'Ingeniería Informática',
    search: 'alcocer',
  });

  assert.equal(records.length, 1);
  assert.equal(records[0].nombreCompleto, 'Alcócer Vargas, Daniela Sofía');
  assert.equal(records[0].fechaEgreso, '');
  assert.equal(records[0].fechaIngreso, '13/02/2017');
});

test('el endpoint CSV exporta todos los verificados filtrados y configura la descarga', async () => {
  const dataSource = new MockGraduateReportDataSource();
  const service = new GraduateCsvService();
  const controller = new GraduateCsvController(dataSource, service);
  const headers: Record<string, string> = {};
  const response = {
    setHeader(name: string, value: string): void {
      headers[name] = value;
    },
  };

  const file = controller.exportCsv(
    'Ingeniería de Sistemas',
    undefined,
    response,
  );
  const buffer = await streamToBuffer(file.getStream());
  const content = buffer.toString('utf8').slice(1).trimEnd();
  const lines = content.split('\r\n');

  assert.equal(lines.length, 73);
  assert.equal(headers['Content-Type'], 'text/csv; charset=utf-8');
  assert.match(
    headers['Content-Disposition'],
    /^attachment; filename="nomina-egresados-verificados-\d{8}\.csv"$/,
  );
});
