import type { Prisma, PrismaClient } from '../../src/generated/prisma/client';

// Las áreas son compartidas con NLP; colocar los padres antes de sus hijos.
export const areas: Array<Prisma.AreaCreateManyInput & { id: string }> = [
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

export const mentores: Array<Prisma.MentorCreateManyInput & { id: string }> = [];
export const especialidades: Array<Prisma.MentorAreaCreateManyInput & { id: string }> = [];

export async function seedEpic6(prisma: PrismaClient): Promise<void> {
  for (const area of areas) {
    await prisma.area.upsert({
      where: { id: area.id },
      create: { ...area, esta_activo: true, fecha_creacion: new Date() },
      update: {},
    });
  }

  if (mentores.length > 0) {
    await prisma.mentor.createMany({ data: mentores, skipDuplicates: true });
  }
  if (especialidades.length > 0) {
    await prisma.mentorArea.createMany({ data: especialidades, skipDuplicates: true });
  }
}
