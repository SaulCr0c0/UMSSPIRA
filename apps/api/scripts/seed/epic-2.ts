import type { Prisma, PrismaClient } from '../../src/generated/prisma/client';

// Perfil profesional: añadir datos con UUID fijos y referencias a registros ya cargados.
export const formaciones: Array<Prisma.FormacionAcademicaCreateManyInput & { id: string }> = [];
export const respaldosFormacion: Array<Prisma.FormacionRespaldoCreateManyInput & { id: string }> =
  [];
export const experiencias: Array<Prisma.ExperienciaLaboralCreateManyInput & { id: string }> = [];
export const certificaciones: Array<Prisma.CertificacionCreateManyInput & { id: string }> = [];
export const respaldos: Array<Prisma.CertificacionRespaldoCreateManyInput & { id: string }> = [];
// Las validaciones necesitan certificaciones y administradores de sistema ya cargados.
export const validaciones: Array<Prisma.ValidacionCertificacionCreateManyInput & { id: string }> =
  [];

export async function seedEpic2(prisma: PrismaClient): Promise<void> {
  if (formaciones.length > 0) {
    await prisma.formacionAcademica.createMany({ data: formaciones, skipDuplicates: true });
  }
  if (respaldosFormacion.length > 0) {
    await prisma.formacionRespaldo.createMany({ data: respaldosFormacion, skipDuplicates: true });
  }
  if (experiencias.length > 0) {
    await prisma.experienciaLaboral.createMany({ data: experiencias, skipDuplicates: true });
  }
  if (certificaciones.length > 0) {
    await prisma.certificacion.createMany({ data: certificaciones, skipDuplicates: true });
  }
  if (respaldos.length > 0) {
    await prisma.certificacionRespaldo.createMany({ data: respaldos, skipDuplicates: true });
  }
  if (validaciones.length > 0) {
    await prisma.validacionCertificacion.createMany({ data: validaciones, skipDuplicates: true });
  }
}
