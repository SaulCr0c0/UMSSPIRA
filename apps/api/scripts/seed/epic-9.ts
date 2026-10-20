import type { Prisma, PrismaClient } from '../../src/generated/prisma/client';

// Reportes y encuestas: añadir datos con UUID fijos y referencias a registros ya cargados.
export const tiposReporte: Array<Prisma.TipoReporteCreateManyInput & { id: string }> = [];
export const reportes: Array<Prisma.ReporteCreateManyInput & { id: string }> = [];
export const encuestas: Array<Prisma.EncuestaCreateManyInput & { id: string }> = [];

export async function seedEpic9(prisma: PrismaClient): Promise<void> {
  if (tiposReporte.length > 0) {
    await prisma.tipoReporte.createMany({ data: tiposReporte, skipDuplicates: true });
  }
  if (reportes.length > 0) {
    await prisma.reporte.createMany({ data: reportes, skipDuplicates: true });
  }
  if (encuestas.length > 0) {
    await prisma.encuesta.createMany({ data: encuestas, skipDuplicates: true });
  }
}
