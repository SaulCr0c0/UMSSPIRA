import type { PrismaService } from '../../../../shared/infrastructure/database/prisma.service';
import { PrismaMentorRepository } from './prisma-mentor.repository';

const time = (value: string) => new Date(`1970-01-01T${value}:00Z`);
const backend = { id: 'area-back', nombre: 'Backend', padre_id: null, esta_activo: true };

function row(overrides: Record<string, unknown> = {}) {
  return {
    id: 'mentor-1',
    id_titulado: 'titulado-1',
    descripcion: 'Mentora backend',
    experiencia: '   ',
    informacion_relevante: null,
    foto_perfil: null,
    esta_activo: true,
    anios_exp: 4,
    fecha_creacion: new Date('2026-10-18'),
    fecha_actualizacion: new Date('2026-10-20'),
    titulado: {
      nombre: 'María',
      apellido: 'Pérez',
      id_carrera: 'carrera-1',
      experiencia_laboral_registros: [{ cargo: 'Backend Developer', empresa: 'Acme' }],
    },
    disponibilidad_mentor_registros: [
      { estado: 'AVAILABLE', fecha_actualizacion: new Date('2026-10-20') },
    ],
    mentor_area_registros: [
      { area: { ...backend, padre: null } },
      { area: { ...backend, padre: null } },
      {
        area: {
          id: 'interes-nest',
          nombre: 'NestJS',
          padre_id: backend.id,
          esta_activo: true,
          padre: backend,
        },
      },
      {
        area: {
          id: 'interes-huerfano',
          nombre: 'Huérfano',
          padre_id: 'area-inactiva',
          esta_activo: true,
          padre: { id: 'area-inactiva', nombre: 'Inactiva', padre_id: null, esta_activo: false },
        },
      },
    ],
    espacio_disponible_mentor_registros: [
      { dia_semana: 2, horario_inicio: time('18:00'), horario_fin: time('20:00') },
      { dia_semana: 9, horario_inicio: time('08:00'), horario_fin: time('09:00') },
      { dia_semana: 3, horario_inicio: time('10:00'), horario_fin: time('09:00') },
    ],
    ...overrides,
  };
}

describe('PrismaMentorRepository.detail', () => {
  const findFirst = jest.fn();
  const repository = new PrismaMentorRepository({
    mentor: { findFirst },
  } as unknown as PrismaService);

  beforeEach(() => findFirst.mockReset());

  it('consulta solo perfiles activos de titulados con cuenta activa', async () => {
    findFirst.mockResolvedValue(null);
    await expect(repository.detail('mentor-1')).resolves.toBeNull();
    expect(findFirst.mock.calls[0][0].where).toEqual({
      id: 'mentor-1',
      esta_activo: true,
      titulado: { usuario: { estado: 'ACTIVO', rol: 'titulado' } },
    });
  });

  it('arma el perfil público con áreas, intereses, horarios y cargo actual', async () => {
    findFirst.mockResolvedValue(row());
    const detail = await repository.detail('mentor-1');
    expect(detail).toMatchObject({
      availability: 'AVAILABLE',
      canRequest: true,
      position: 'Backend Developer',
      company: 'Acme',
      areas: [{ id: 'area-back', name: 'Backend' }],
      interests: [
        { id: 'interes-nest', name: 'NestJS', area: { id: 'area-back', name: 'Backend' } },
      ],
      schedules: [{ weekday: 2, start: '18:00', end: '20:00' }],
    });
    expect(detail?.mentor.graduateName).toBe('María Pérez');
    expect(detail?.mentor.experience).toBeNull();
  });

  it('muestra un mentor en pausa sin permitir solicitudes', async () => {
    findFirst.mockResolvedValue(
      row({ disponibilidad_mentor_registros: [{ estado: 'PAUSED', fecha_actualizacion: null }] }),
    );
    await expect(repository.detail('mentor-1')).resolves.toMatchObject({
      availability: 'PAUSED',
      canRequest: false,
    });
  });

  it('oculta el perfil de un mentor no disponible', async () => {
    findFirst.mockResolvedValue(
      row({ disponibilidad_mentor_registros: [{ estado: 'UNAVAILABLE', fecha_actualizacion: null }] }),
    );
    await expect(repository.detail('mentor-1')).resolves.toBeNull();
  });
});
