import type { Prisma, PrismaClient } from '../../src/generated/prisma/client';

// PWA y dispositivos: añadir datos con UUID fijos y referencias a registros ya cargados.
export const dispositivos: Array<Prisma.DispositivoCreateManyInput & { id: string }> = [];

export async function seedEpic8(prisma: PrismaClient): Promise<void> {
  if (dispositivos.length > 0) {
    await prisma.dispositivo.createMany({ data: dispositivos, skipDuplicates: true });
  }
}
