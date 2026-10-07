import { query } from '../../shared/lib/database';
import { PerfilRepository } from './perfil.repository';

jest.mock('../../shared/lib/database', () => ({ query: jest.fn() }));

const queryMock = query as jest.MockedFunction<typeof query>;

describe('PerfilRepository', () => {
  const repositorio = new PerfilRepository();

  beforeEach(() => queryMock.mockReset());

  it('inserta una formación académica con el titulado y devuelve el registro en camelCase', async () => {
    queryMock.mockResolvedValue([
      {
        id: 'f1',
        id_egresado: 't1',
        institucion: 'UMSS',
        titulo: 'Ing. de Sistemas',
        grado: 'Licenciatura',
        anio_egreso: 2024,
        fecha_creacion: new Date('2026-10-06T10:00:00Z'),
      },
    ]);

    const registro = await repositorio.insertar('formacion-academica', 't1', {
      institucion: 'UMSS',
      titulo: 'Ing. de Sistemas',
      grado: 'Licenciatura',
      anioEgreso: 2024,
    });

    const [sql, parametros] = queryMock.mock.calls[0];
    expect(sql).toBe(
      'INSERT INTO formacion_academica (id_egresado, institucion, titulo, grado, anio_egreso, fecha_creacion) ' +
        'VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *',
    );
    expect(parametros).toEqual(['t1', 'UMSS', 'Ing. de Sistemas', 'Licenciatura', 2024]);
    expect(registro).toEqual({
      id: 'f1',
      idTitulado: 't1',
      fechaCreacion: '2026-10-06',
      institucion: 'UMSS',
      titulo: 'Ing. de Sistemas',
      grado: 'Licenciatura',
      anioEgreso: 2024,
    });
  });

  it('lista los registros del titulado del más reciente al más antiguo', async () => {
    queryMock.mockResolvedValue([]);

    await repositorio.listar('experiencia-laboral', 't1');

    const [sql, parametros] = queryMock.mock.calls[0];
    expect(sql).toContain('FROM experiencia_laboral WHERE id_egresado = $1');
    expect(sql).toContain('ORDER BY fecha_creacion DESC');
    expect(parametros).toEqual(['t1']);
  });

  it('devuelve null si el registro no existe', async () => {
    queryMock.mockResolvedValue([]);

    expect(await repositorio.obtenerPorId('certificaciones', 'no-existe')).toBeNull();
  });
});