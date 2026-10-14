import { CURRENT_GRADUATE_ID } from '@/modules/profile/data/profile-records-data';
import type { CertificationRecord } from '@/modules/profile/types/profile-record';
import { ApiError } from '@/shared/services/api-client';

import { obtenerPerfil, type PerfilApi } from './perfil-api';

// jsdom no trae fetch: se simula con la forma mínima que usa apiFetch
const fetchMock = jest.fn();

function responder(status: number, cuerpo: unknown) {
  fetchMock.mockResolvedValue({ ok: status >= 200 && status < 300, status, json: async () => cuerpo });
}

const base = { idTitulado: '9bab2c02-d99b-4e06-a16c-ba5ee762654e', fechaCreacion: '2026-10-01' };

const PERFIL_API: PerfilApi = {
  formacionAcademica: {
    registros: [
      { ...base, id: 'f-1', institucion: 'UMSS', titulo: 'Ingeniería de Sistemas', grado: 'Licenciatura', anioEgreso: 2018 },
    ],
  },
  experienciaLaboral: {
    registros: [
      { ...base, id: 'e-1', empresa: 'Jalasoft', cargo: 'Dev', fechaInicio: '2023-08-01', fechaFin: null },
    ],
  },
  certificaciones: {
    registros: [
      { ...base, id: 'c-1', nombre: 'AWS', entidadEmisora: 'Amazon', grado: 'Profesional', anioEmision: 2022, respaldo: { tieneRespaldo: true } },
      { ...base, id: 'c-2', nombre: 'PSM I', entidadEmisora: 'Scrum.org', grado: 'Asociado', anioEmision: 2021, respaldo: { tieneRespaldo: false } },
    ],
  },
};

describe('obtenerPerfil', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock;
  });

  afterEach(() => {
    // @ts-expect-error se vuelve al entorno de jsdom, que no tiene fetch
    delete global.fetch;
  });

  it('consulta GET /api/v1/perfil', async () => {
    responder(200, PERFIL_API);

    await obtenerPerfil();

    const [url, opciones] = fetchMock.mock.calls[0];
    expect(url).toMatch(/\/api\/v1\/perfil$/);
    expect(opciones.method).toBeUndefined();
  });

  it('convierte los registros de la API al formato del estado del perfil', async () => {
    responder(200, PERFIL_API);

    const registros = await obtenerPerfil();

    expect(registros.education).toEqual([
      {
        id: 'f-1',
        ownerId: CURRENT_GRADUATE_ID,
        institution: 'UMSS',
        title: 'Ingeniería de Sistemas',
        graduationYear: '2018',
        degree: 'Licenciatura',
      },
    ]);
    expect(registros.experience).toEqual([
      { id: 'e-1', ownerId: CURRENT_GRADUATE_ID, company: 'Jalasoft', position: 'Dev', startDate: '2023-08-01', endDate: '' },
    ]);
    expect((registros.certification as CertificationRecord[]).map((c) => [c.id, c.issueYear, c.backupFile])).toEqual([
      ['c-1', '2022', 'respaldo.jpg'],
      ['c-2', '2021', undefined],
    ]);
  });

  it('propaga el error de la API con su estado y mensaje', async () => {
    responder(403, { statusCode: 403, message: 'El usuario no es un titulado' });

    const error = await obtenerPerfil().catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 403, message: 'El usuario no es un titulado' });
  });
});
