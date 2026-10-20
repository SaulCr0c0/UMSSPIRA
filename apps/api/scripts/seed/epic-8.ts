import type { Prisma, PrismaClient } from '../../src/generated/prisma/client';

// Las suscripciones push y sus claves las genera el navegador al dar consentimiento.
// La PWA usa las cuentas, permisos y catálogos comunes; no necesita dispositivos ficticios.
export const dispositivos: Array<Prisma.DispositivoCreateManyInput & { id: string }> = [];

export async function seedEpic8(prisma: PrismaClient): Promise<void> {
  if (dispositivos.length > 0) {
    await prisma.dispositivo.createMany({ data: dispositivos, skipDuplicates: true });
  }
}
