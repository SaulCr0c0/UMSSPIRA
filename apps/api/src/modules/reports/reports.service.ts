import { Injectable } from '@nestjs/common';
import { MOCK_GRADUATES, GraduateRecordMock } from './mocks/reports-data.mock';
import { GetGraduatesQueryDto } from './dto/get-graduates-query.dto';

export interface DashboardMetricsResponse {
  totalGraduates: number;
  verifiedGraduates: number;
  observedGraduates: number;
  activeMentors: number;
}

export interface PaginatedGraduatesResponse {
  data: GraduateRecordMock[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

@Injectable()
export class ReportsService {
  private readonly records: GraduateRecordMock[] = MOCK_GRADUATES;

  getMetrics(): DashboardMetricsResponse {
    const totalGraduates = this.records.length;
    const verifiedGraduates = this.records.filter((r) => r.estado === 'VERIFICADO').length;
    const observedGraduates = this.records.filter((r) => r.estado === 'OBSERVADO').length;
    const activeMentors = this.records.filter(
      (r) => r.estado === 'VERIFICADO' && r.deseaMentor,
    ).length;

    return {
      totalGraduates,
      verifiedGraduates,
      observedGraduates,
      activeMentors,
    };
  }

  getGraduates(query: GetGraduatesQueryDto): PaginatedGraduatesResponse {
    const page = Math.max(1, parseInt(query.page ?? '1', 10));
    const limit = Math.max(1, parseInt(query.limit ?? '10', 10));

    let filtered = [...this.records];

    if (query.status) {
      filtered = filtered.filter((r) => r.estado === query.status);
    }

    if (query.search) {
      const rawSearch = query.search.trim().toLowerCase();
      const tokens = rawSearch.split(/\s+/).filter(Boolean);

      if (tokens.length > 0) {
        // BUG 3: Búsqueda por tokens que permite consultar Nombre + Apellido combinados en cualquier orden
        filtered = filtered.filter((r) => {
          const nombre = (r.nombre || '').toLowerCase();
          const apellido = (r.apellido || '').toLowerCase();
          const email = (r.email || '').toLowerCase();
          const codSis = (r.codSis || '').toLowerCase();
          const ci = (r.ci || '').toLowerCase();

          const fullSearchableText = `${nombre} ${apellido} ${email} ${codSis} ${ci}`;

          return tokens.every((token) => fullSearchableText.includes(token));
        });

        // BUG 1: Priorización de resultados para mostrar coincidencia directa/inicio primero
        filtered.sort((a, b) => {
          const nombreA = (a.nombre || '').toLowerCase();
          const apellidoA = (a.apellido || '').toLowerCase();
          const nombreB = (b.nombre || '').toLowerCase();
          const apellidoB = (b.apellido || '').toLowerCase();

          const fullA = `${nombreA} ${apellidoA}`;
          const reversedA = `${apellidoA} ${nombreA}`;
          const fullB = `${nombreB} ${apellidoB}`;
          const reversedB = `${apellidoB} ${nombreB}`;

          const getScore = (
            nom: string,
            ape: string,
            full: string,
            rev: string,
          ) => {
            if (full.startsWith(rawSearch) || rev.startsWith(rawSearch)) return 1;
            if (nom.startsWith(rawSearch) || ape.startsWith(rawSearch)) return 2;
            if (full.includes(rawSearch) || rev.includes(rawSearch)) return 3;
            return 4;
          };

          const scoreA = getScore(nombreA, apellidoA, fullA, reversedA);
          const scoreB = getScore(nombreB, apellidoB, fullB, reversedB);

          return scoreA - scoreB;
        });
      }
    }

    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const data = filtered.slice(offset, offset + limit);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }
}
