import { crearExperiencia, crearFormacion } from './perfil-api';

const fetchMock = jest.fn();

beforeEach(() => {
  fetchMock.mockReset();
  fetchMock.mockResolvedValue({ ok: true, status: 201, json: () => Promise.resolve({}) });
  global.fetch = fetchMock as unknown as typeof fetch;
});

function cuerpoEnviado() {
  return JSON.parse(fetchMock.mock.calls[0][1].body);
}

describe('crearFormacion', () => {
  it('hace POST a /perfil/formacion-academica con el año como numero', async () => {
    await crearFormacion({ institucion: ' UMSS ', titulo: 'Ingeniería de Sistemas', anioEgreso: '2022', grado: 'Licenciatura' });

    expect(fetchMock.mock.calls[0][0]).toMatch(/\/api\/v1\/perfil\/formacion-academica$/);
    expect(fetchMock.mock.calls[0][1].method).toBe('POST');
    expect(cuerpoEnviado()).toEqual({
      institucion: 'UMSS',
      titulo: 'Ingeniería de Sistemas',
      grado: 'Licenciatura',
      anioEgreso: 2022,
    });
  });
});

describe('crearExperiencia', () => {
  it('omite fechaFin cuando es trabajo actual', async () => {
    await crearExperiencia({ empresa: 'Jalasoft', cargo: 'Dev', fechaInicio: '2023-08-01' });

    expect(fetchMock.mock.calls[0][0]).toMatch(/\/api\/v1\/perfil\/experiencia-laboral$/);
    expect(cuerpoEnviado()).toEqual({ empresa: 'Jalasoft', cargo: 'Dev', fechaInicio: '2023-08-01' });
  });

  it('envia fechaFin cuando la experiencia ya termino', async () => {
    await crearExperiencia({ empresa: 'Jalasoft', cargo: 'Dev', fechaInicio: '2023-08-01', fechaFin: '2024-01-31' });

    expect(cuerpoEnviado().fechaFin).toBe('2024-01-31');
  });
});
