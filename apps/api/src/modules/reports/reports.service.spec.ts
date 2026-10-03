import { describe, it, beforeEach } from 'node:test';
import { strictEqual, ok } from 'node:assert';
import { ReportsService } from './reports.service';

describe('ReportsService', () => {
  let service: ReportsService;

  beforeEach(() => {
    service = new ReportsService();
  });

  it('debe estar definido', () => {
    ok(service);
  });

  it('debe calcular las metricas institucionales con exactitud', () => {
    const metrics = service.getMetrics();
    strictEqual(metrics.totalGraduates, 30);
    strictEqual(metrics.verifiedGraduates, 15);
    strictEqual(metrics.observedGraduates, 15);
    // Valida que ningún observado compute como mentor activo
    const mentoresVerificadosReales = service['records'].filter(
      (r) => r.estado === 'VERIFICADO' && r.deseaMentor
    ).length;
    strictEqual(metrics.activeMentors, mentoresVerificadosReales);
  });

  it('debe paginar el padron de egresados correctamente', () => {
    const res = service.getGraduates({ page: '1', limit: '5' });
    strictEqual(res.data.length, 5);
    strictEqual(res.meta.total, 30);
    strictEqual(res.meta.totalPages, 6);
    strictEqual(res.meta.page, 1);
  });

  it('debe filtrar por estado OBSERVADO', () => {
    const res = service.getGraduates({ status: 'OBSERVADO', limit: '30' });
    strictEqual(res.data.length, 15);
    ok(res.data.every((r) => r.estado === 'OBSERVADO'));
  });

  it('debe filtrar por termino de busqueda', () => {
    const res = service.getGraduates({ search: 'Perez' });
    ok(res.data.length >= 1);
    strictEqual(res.data[0].apellido, 'Perez');
  });
});