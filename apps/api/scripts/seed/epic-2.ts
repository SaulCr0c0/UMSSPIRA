import type { Prisma, PrismaClient } from '../../src/generated/prisma/client';
import { DEMO_GRADUATE_ID } from './demo-accounts';
import { DEMO_IDS } from './demo-ids';

export const formaciones: Array<Prisma.FormacionAcademicaCreateManyInput & { id: string }> = [
  {
    id: DEMO_IDS.education,
    id_titulado: DEMO_GRADUATE_ID,
    institucion: 'Universidad Mayor de San Simón',
    titulo: 'Ingeniería de Sistemas',
    grado: 'Licenciatura',
    anio_egreso: 2025,
  },
];
export const respaldosFormacion: Array<Prisma.FormacionRespaldoCreateManyInput & { id: string }> =
  [];
export const experiencias: Array<Prisma.ExperienciaLaboralCreateManyInput & { id: string }> = [
  {
    id: '22000000-0000-4000-8000-000000000002',
    id_titulado: DEMO_GRADUATE_ID,
    empresa: 'Empresa de demostración',
    cargo: 'Desarrollador de software',
    fecha_inicio: new Date('2025-01-15T00:00:00Z'),
    fecha_fin: null,
  },
];
export const certificaciones: Array<Prisma.CertificacionCreateManyInput & { id: string }> = [
  {
    id: DEMO_IDS.certification,
    id_titulado: DEMO_GRADUATE_ID,
    nombre: 'Desarrollo de aplicaciones con TypeScript',
    entidad_emisora: 'Academia de demostración',
    grado: 'Curso',
    anio_emision: 2025,
    estado_validacion: 'sin_respaldo',
  },
];
// Los respaldos se pueden cargar con el endpoint de archivos; no se simulan aprobaciones sin evidencia.
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
