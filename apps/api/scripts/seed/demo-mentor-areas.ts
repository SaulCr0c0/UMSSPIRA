import type { Prisma } from '../../src/generated/prisma/client';

const areas = [
  { id: '60000000-0000-4000-8000-000000000001', nombre: 'Tecnología', padre_id: null },
  { id: '60000000-0000-4000-8000-000000000002', nombre: 'Gestión', padre_id: null },
  {
    id: '60000000-0000-4000-8000-000000000003',
    nombre: 'Desarrollo de software',
    padre_id: '60000000-0000-4000-8000-000000000001',
  },
  {
    id: '60000000-0000-4000-8000-000000000004',
    nombre: 'Análisis de datos',
    padre_id: '60000000-0000-4000-8000-000000000001',
  },
  {
    id: '60000000-0000-4000-8000-000000000005',
    nombre: 'Gestión de proyectos',
    padre_id: '60000000-0000-4000-8000-000000000002',
  },
];

export async function seedDemoMentorAreas(tx: Prisma.TransactionClient): Promise<void> {
  for (const area of areas) {
    await tx.area.upsert({
      where: { id: area.id },
      create: { ...area, esta_activo: true, fecha_creacion: new Date() },
      update: {},
    });
  }
}
