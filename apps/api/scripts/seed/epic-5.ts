import type { Prisma, PrismaClient } from '../../src/generated/prisma/client';

// Vacantes: añadir datos con UUID fijos y referencias a registros ya cargados.
export const vacantes: Array<Prisma.VacanteCreateManyInput & { id: string }> = [];

export async function seedEpic5(prisma: PrismaClient): Promise<void> {
  if (vacantes.length > 0) {
    await prisma.vacante.createMany({ data: vacantes, skipDuplicates: true });
  }
}
