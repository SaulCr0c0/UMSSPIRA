import type { Prisma, PrismaClient } from '../../src/generated/prisma/client';

// Motor NLP: añadir datos con UUID fijos y referencias a registros ya cargados.
export const perfilesArea: Array<Prisma.PerfilAreaCreateManyInput & { id: string }> = [];
export const palabrasClave: Array<Prisma.PalabraClaveCreateManyInput & { id: string }> = [];
export const alias: Array<Prisma.AliasPalabraClaveCreateManyInput & { id: string }> = [];
export const palabrasPorArea: Array<Prisma.PalabraClaveAreaCreateManyInput & { id: string }> = [];
export const palabrasNoMapeadas: Array<
  Prisma.PalabraClaveNoMapeadaCreateManyInput & { id: string }
> = [];
export const calculos: Array<Prisma.CalculoRadarCreateManyInput & { id: string }> = [];
export const afinidades: Array<Prisma.AfinidadRadarCreateManyInput & { id: string }> = [];

export async function seedEpic3(prisma: PrismaClient): Promise<void> {
  if (perfilesArea.length > 0) {
    await prisma.perfilArea.createMany({ data: perfilesArea, skipDuplicates: true });
  }
  if (palabrasClave.length > 0) {
    await prisma.palabraClave.createMany({ data: palabrasClave, skipDuplicates: true });
  }
  if (alias.length > 0) {
    await prisma.aliasPalabraClave.createMany({ data: alias, skipDuplicates: true });
  }
  if (palabrasPorArea.length > 0) {
    await prisma.palabraClaveArea.createMany({ data: palabrasPorArea, skipDuplicates: true });
  }
  if (palabrasNoMapeadas.length > 0) {
    await prisma.palabraClaveNoMapeada.createMany({
      data: palabrasNoMapeadas,
      skipDuplicates: true,
    });
  }
  if (calculos.length > 0) {
    await prisma.calculoRadar.createMany({ data: calculos, skipDuplicates: true });
  }
  if (afinidades.length > 0) {
    await prisma.afinidadRadar.createMany({ data: afinidades, skipDuplicates: true });
  }
}
