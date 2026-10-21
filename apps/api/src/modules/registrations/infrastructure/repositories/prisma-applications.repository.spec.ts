import type { ActorContext } from '../../../../shared/security/contexts/actor-context';
import type { ApplicationQuery } from '../../application/contracts/registration-inputs';
import { PrismaApplicationsRepository } from './prisma-applications.repository';
 
// El repositorio solo usa PrismaService como tipo del constructor; se evita cargar el cliente generado.
jest.mock('../../../../shared/infrastructure/database/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));
 
const actor = { id: 'actor-1', scopes: { careerIds: ['carrera-1'] } } as unknown as ActorContext;
 
const query = (overrides: Partial<ApplicationQuery> = {}) =>
  ({ page: 1, pageSize: 10, ...overrides }) as ApplicationQuery;
 
const rows = (count: number, prefix: string) =>
  Array.from({ length: count }, (_, index) => ({
    id: `${prefix}-${index}`,
    estado: prefix === 'pendiente' ? 'PENDING' : 'APPROVED',
    fecha_creacion: new Date('2026-10-01T10:00:00Z'),
  }));
 
interface Setup {
  pending: number;
  others: number;
  pendingRows?: unknown[];
  otherRows?: unknown[];
}
 
function createRepository({ pending, others, pendingRows = [], otherRows = [] }: Setup) {
  const prisma = {
    $transaction: jest.fn((operations: Promise<unknown>[]) => Promise.all(operations)),
    solicitud: {
      // Primero se cuenta el total y luego los pendientes, como en el repositorio.
      count: jest.fn().mockResolvedValueOnce(pending + others).mockResolvedValueOnce(pending),
      findMany: jest.fn(({ where }: { where: { AND: Array<{ estado: unknown }> } }) =>
        Promise.resolve(where.AND[1].estado === 'PENDING' ? pendingRows : otherRows),
      ),
    },
  };
  return { prisma, repository: new PrismaApplicationsRepository(prisma as never) };
}
 
describe('PrismaApplicationsRepository.list', () => {
  it('primera página: pendientes más antiguos primero y con el id como desempate (CA-08.2)', async () => {
    const { prisma, repository } = createRepository({
      pending: 25,
      others: 10,
      pendingRows: rows(10, 'pendiente'),
    });
 
    const page = await repository.list(actor, query({ page: 1, pageSize: 10 }));
 
    expect(prisma.solicitud.findMany).toHaveBeenCalledTimes(1);
    expect(prisma.solicitud.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: [{ fecha_creacion: 'asc' }, { id: 'asc' }],
        skip: 0,
        take: 10,
      }),
    );
    expect(page.items).toHaveLength(10);
    expect(page.total).toBe(35);
    expect(page.totalPages).toBe(4);
  });
 
  it('una página que cruza de pendientes a dictaminadas no repite ni omite expedientes (CA-08.2)', async () => {
    const { prisma, repository } = createRepository({
      pending: 25,
      others: 10,
      pendingRows: rows(5, 'pendiente'),
      otherRows: rows(5, 'dictaminada'),
    });
 
    const page = await repository.list(actor, query({ page: 3, pageSize: 10 }));
 
    const [pendingCall, otherCall] = prisma.solicitud.findMany.mock.calls.map(([args]) => args);
    expect(pendingCall).toMatchObject({ skip: 20, take: 10 });
    expect(otherCall).toMatchObject({
      orderBy: [{ fecha_creacion: 'desc' }, { id: 'asc' }],
      skip: 0,
      take: 5,
    });
    expect(page.items).toHaveLength(10);
  });
 
  it('una página posterior a los pendientes solo consulta las dictaminadas con el desplazamiento correcto', async () => {
    const { prisma, repository } = createRepository({
      pending: 25,
      others: 20,
      otherRows: rows(10, 'dictaminada'),
    });
 
    await repository.list(actor, query({ page: 4, pageSize: 10 }));
 
    expect(prisma.solicitud.findMany).toHaveBeenCalledTimes(1);
    expect(prisma.solicitud.findMany).toHaveBeenCalledWith(expect.objectContaining({ skip: 5, take: 10 }));
  });
 
  it('sin resultados devuelve una sola página vacía (CA-08.6)', async () => {
    const { repository } = createRepository({ pending: 0, others: 0 });
 
    const page = await repository.list(actor, query({ search: 'nadie' }));
 
    expect(page.items).toEqual([]);
    expect(page.total).toBe(0);
    expect(page.totalPages).toBe(1);
  });
 
  it('limita la consulta a las carreras del actor', async () => {
    const { prisma, repository } = createRepository({ pending: 0, others: 0 });
 
    await repository.list(actor, query());
 
    const { where } = prisma.solicitud.count.mock.calls[0][0];
    expect(where.AND[0]).toEqual({ detalle_solicitud: { is: { id_carrera: { in: ['carrera-1'] } } } });
  });
 
  it('combina carrera, estado y búsqueda: deben cumplirse todas las condiciones (CA-08.3)', async () => {
    const { prisma, repository } = createRepository({ pending: 0, others: 0 });
 
    await repository.list(actor, query({ career: 'sistemas', status: 'PENDING', search: 'rojas' }));
 
    const { where } = prisma.solicitud.count.mock.calls[0][0];
    expect(where.AND).toEqual(
      expect.arrayContaining([
        { estado: 'PENDING' },
        {
          detalle_solicitud: {
            is: {
              AND: [
                { carrera: { is: { nombre: { contains: 'sistemas', mode: 'insensitive' } } } },
                { OR: expect.arrayContaining([{ nombre: { contains: 'rojas', mode: 'insensitive' } }]) },
              ],
            },
          },
        },
      ]),
    );
  });
 
  it('busca por Código SIS solo cuando el texto tiene entre 6 y 9 dígitos (CA-08.3)', async () => {
    const withSis = createRepository({ pending: 0, others: 0 });
    await withSis.repository.list(actor, query({ search: '201804921' }));
    expect(JSON.stringify(withSis.prisma.solicitud.count.mock.calls[0][0])).toContain('"cod_sis":"201804921"');
 
    const withoutSis = createRepository({ pending: 0, others: 0 });
    await withoutSis.repository.list(actor, query({ search: '123' }));
    expect(JSON.stringify(withoutSis.prisma.solicitud.count.mock.calls[0][0])).not.toContain('cod_sis');
  });
 
  it('busca por C.I. con coincidencia parcial (CA-08.3)', async () => {
    const { prisma, repository } = createRepository({ pending: 0, others: 0 });
 
    await repository.list(actor, query({ search: '68492' }));
 
    expect(JSON.stringify(prisma.solicitud.count.mock.calls[0][0])).toContain('{"ci":{"contains":"68492"}}');
  });
});
 
