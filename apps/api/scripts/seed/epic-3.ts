import type { Prisma, PrismaClient } from '../../src/generated/prisma/client';
import { DEMO_GRADUATE_ID } from './demo-accounts';
import { AREA_IDS, DEMO_IDS } from './demo-ids';

export const perfilesArea: Array<Prisma.PerfilAreaCreateManyInput & { id: string }> = [
  {
    id: '33000000-0000-4000-8000-000000000010',
    id_titulado: DEMO_GRADUATE_ID,
    area_id: AREA_IDS.technology,
    descripcion_profesional:
      'Desarrollo aplicaciones con TypeScript y PostgreSQL. Participo en gestión de proyectos.',
    fecha_creacion: new Date(),
  },
];
export const palabrasClave: Array<Prisma.PalabraClaveCreateManyInput & { id: string }> = [
  { id: DEMO_IDS.keywords.typescript, nombre: 'TypeScript', termino_normalizado: 'typescript' },
  { id: DEMO_IDS.keywords.postgres, nombre: 'PostgreSQL', termino_normalizado: 'postgresql' },
  {
    id: DEMO_IDS.keywords.projects,
    nombre: 'Gestión de proyectos',
    termino_normalizado: 'gestion de proyectos',
  },
];
export const alias: Array<Prisma.AliasPalabraClaveCreateManyInput & { id: string }> = [
  {
    id: '33100000-0000-4000-8000-000000000001',
    id_palabra_clave: DEMO_IDS.keywords.postgres,
    alias: 'Postgres',
    alias_normalizado: 'postgres',
  },
];
export const palabrasPorArea: Array<Prisma.PalabraClaveAreaCreateManyInput & { id: string }> = [
  {
    id: '33200000-0000-4000-8000-000000000001',
    id_palabra_clave: DEMO_IDS.keywords.typescript,
    id_area: AREA_IDS.software,
    peso: 3,
  },
  {
    id: '33200000-0000-4000-8000-000000000002',
    id_palabra_clave: DEMO_IDS.keywords.postgres,
    id_area: AREA_IDS.data,
    peso: 2,
  },
  {
    id: '33200000-0000-4000-8000-000000000003',
    id_palabra_clave: DEMO_IDS.keywords.projects,
    id_area: AREA_IDS.projects,
    peso: 1,
  },
];
export const palabrasNoMapeadas: Array<
  Prisma.PalabraClaveNoMapeadaCreateManyInput & { id: string }
> = [
  {
    id: '33300000-0000-4000-8000-000000000001',
    id_titulado: DEMO_GRADUATE_ID,
    termino: 'observabilidad',
    frecuencia: 1,
  },
];
// Son resultados de ejemplo para desarrollar el consumidor; la seed no ejecuta el motor NLP.
export const calculos: Array<Prisma.CalculoRadarCreateManyInput & { id: string }> = [
  {
    id: DEMO_IDS.radar,
    id_titulado: DEMO_GRADUATE_ID,
    version_algoritmo: 'demo-seed-v1',
    estado: 'COMPLETADO',
  },
];
export const afinidades: Array<Prisma.AfinidadRadarCreateManyInput & { id: string }> = [
  {
    id: '33400000-0000-4000-8000-000000000001',
    id_calculo_radar: DEMO_IDS.radar,
    id_area: AREA_IDS.software,
    puntaje: '3',
    porcentaje: '50',
  },
  {
    id: '33400000-0000-4000-8000-000000000002',
    id_calculo_radar: DEMO_IDS.radar,
    id_area: AREA_IDS.data,
    puntaje: '2',
    porcentaje: '33.33',
  },
  {
    id: '33400000-0000-4000-8000-000000000003',
    id_calculo_radar: DEMO_IDS.radar,
    id_area: AREA_IDS.projects,
    puntaje: '1',
    porcentaje: '16.67',
  },
];

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
