import type { Prisma, PrismaClient } from '../../src/generated/prisma/client';

// Eventos: añadir datos con UUID fijos y referencias a registros ya cargados.
export const eventos: Array<Prisma.EventoCreateManyInput & { id: string }> = [];
export const inscripciones: Array<Prisma.InscripcionEventoCreateManyInput & { id: string }> = [];

export async function seedEpic7(prisma: PrismaClient): Promise<void> {
  if (eventos.length > 0) {
    await prisma.evento.createMany({ data: eventos, skipDuplicates: true });
  }
  if (inscripciones.length > 0) {
    await prisma.inscripcionEvento.createMany({ data: inscripciones, skipDuplicates: true });
  }
}
