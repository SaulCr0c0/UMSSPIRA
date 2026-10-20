import type { Prisma, PrismaClient } from '../../src/generated/prisma/client';

// Portal de empresas: añadir datos con UUID fijos y referencias a registros ya cargados.
export const empresas: Array<Prisma.EmpresaCreateManyInput & { id: string }> = [];
export const modalidades: Array<Prisma.ModalidadTrabajoCreateManyInput & { id: string }> = [];
export const requerimientos: Array<Prisma.RequerimientoLaboralCreateManyInput & { id: string }> =
  [];
export const habilidades: Array<Prisma.RequerimientoHabilidadCreateManyInput & { id: string }> = [];

export async function seedEpic4(prisma: PrismaClient): Promise<void> {
  if (empresas.length > 0) {
    await prisma.empresa.createMany({ data: empresas, skipDuplicates: true });
  }
  if (modalidades.length > 0) {
    await prisma.modalidadTrabajo.createMany({ data: modalidades, skipDuplicates: true });
  }
  if (requerimientos.length > 0) {
    await prisma.requerimientoLaboral.createMany({ data: requerimientos, skipDuplicates: true });
  }
  if (habilidades.length > 0) {
    await prisma.requerimientoHabilidad.createMany({ data: habilidades, skipDuplicates: true });
  }
}
