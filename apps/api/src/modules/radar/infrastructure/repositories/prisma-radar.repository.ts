import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service';
import { AFFINITY_ALGORITHM_VERSION } from '../../domain/affinity-config';
import { RADAR_AREA_IDS } from '../../domain/entities/radar-area';
import type { AffinityCalculation } from '../../domain/entities/affinity-calculation';
import type { 
  RadarRepositoryPort,
  RadarCalculationSnapshot,
  AreaScoreRecord
} from '../../application/ports/radar-repository.port';

@Injectable()
export class PrismaRadarRepository implements RadarRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async save(calculation: AffinityCalculation): Promise<void> {
    await this.prisma.$transaction(async (transaction) => {
      const savedCalculation = await transaction.calculoRadar.create({
        data: {
          id_titulado: calculation.graduateId,
          hash_entrada: calculation.inputHash,
          version_algoritmo: AFFINITY_ALGORITHM_VERSION,
          estado: 'COMPLETADO',
          fecha_calculo: calculation.calculatedAt,
        },
        select: { id: true },
      });

      await transaction.afinidadRadar.createMany({
        data: calculation.areas.map((area) => ({
          id_calculo_radar: savedCalculation.id,
          id_area: RADAR_AREA_IDS[area.area],
          puntaje: area.score,
          porcentaje: area.percentage,
          palabras_clave_top: area.topKeywords as never,
        })),
      });

      const currentUnmappedTerms = calculation.unmapped.map(({ term }) => term);
      await transaction.palabraClaveNoMapeada.deleteMany({
        where: {
          id_titulado: calculation.graduateId,
          ...(currentUnmappedTerms.length > 0 ? { termino: { notIn: currentUnmappedTerms } } : {}),
        },
      });

      for (const keyword of calculation.unmapped) {
        await transaction.palabraClaveNoMapeada.upsert({
          where: {
            id_titulado_termino: {
              id_titulado: calculation.graduateId,
              termino: keyword.term,
            },
          },
          create: {
            id_titulado: calculation.graduateId,
            termino: keyword.term,
            frecuencia: keyword.count,
            fecha_deteccion: calculation.calculatedAt,
          },
          update: {
            frecuencia: keyword.count,
            fecha_deteccion: calculation.calculatedAt,
          },
        });
      }
    });
  }
  // --- Métodos agregados para T3.1 (A ser implementados en BD por Mirko) ---

  async getLatestCalculation(_tituladoId: string): Promise<RadarCalculationSnapshot | null> {
    return null;
  }

  async getPreviousCalculation(_tituladoId: string, _currentCalculationId: string): Promise<RadarCalculationSnapshot | null> {
    return null;
  }

  async executeWithAdvisoryLock<T>(_tituladoId: string, operation: () => Promise<T>): Promise<T> {
    return await operation();
  }

  async saveCalculation(_params: {
    tituladoId: string;
    hashEntrada: string;
    estado: 'COMPLETADO' | 'VACIO';
    versionAlgoritmo: string;
    areas: AreaScoreRecord[];
    unmapped: Array<{ term: string; count: number }>;
  }): Promise<RadarCalculationSnapshot> {
    return {
      id: 'mock-id',
      tituladoId: _params.tituladoId,
      hashEntrada: _params.hashEntrada,
      estado: _params.estado,
      versionAlgoritmo: _params.versionAlgoritmo,
      fechaCalculo: new Date(),
      afinidad: [],
    };
  }

  async getAreaWeights(): Promise<Record<string, Array<{ term: string; peso: number }>>> {
    return {};
  }
}
