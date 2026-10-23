import { getMentorDirectory } from './mentor-directory-api';
import { filterDirectory } from '../model/mentor-directory';
import { setAccessToken, clearAccessToken } from '@/shared/services/auth-session';

const row = { id: 'mentor-1', nombre: 'Ana Pérez', descripcion: 'Presentación pública', foto_perfil: null,
  esta_activo: true, availabilityStatus: 'AVAILABLE', areas: [{ id: 'software', nombre: 'Desarrollo de Software' }],
};
const query = { areaIds: [], topicIds: [], offset: 0, limit: 6 };
const fetchMock = jest.fn();
const originalFetch = global.fetch;
beforeEach(() => { jest.resetAllMocks(); global.fetch = fetchMock; setAccessToken('directory-test-token'); });
afterEach(() => { clearAccessToken(); });
afterAll(() => { global.fetch = originalFetch; });

it('consume el contrato público, descarta campos privados, inactivos, no disponibles y duplicados', async () => {
  fetchMock.mockResolvedValue({ ok: true, json: async () => ({ data: [
    { ...row, email: 'privado@example.com', experiencia: 'No se presenta en las tarjetas' }, row,
    { ...row, id: 'inactive', esta_activo: false }, { ...row, id: 'unavailable', availabilityStatus: 'UNAVAILABLE' },
    { ...row, id: 'paused', availabilityStatus: 'PAUSED' }, { ...row, id: 'unknown', availabilityStatus: null },
  ] }) });
  const result = await getMentorDirectory(query);
  expect(fetchMock).toHaveBeenCalledWith('/api/v1/mentorship/profiles', expect.objectContaining({ method: 'GET', credentials: 'omit', cache: 'no-store', headers: expect.objectContaining({ Authorization: 'Bearer directory-test-token' }) }));
  expect(result.total).toBe(1);
  expect(result.mentors[0]).toEqual({ id: row.id, name: row.nombre, description: row.descripcion, photoUrl: null,
    availability: 'AVAILABLE', areas: [{ id: 'software', name: 'Desarrollo de Software' }],
  });
  expect(result.interestsSupported).toBe(false);
});

it('filtra áreas, pagina y mantiene el catálogo general', async () => {
  const rows = Array.from({ length: 8 }, (_, i) => ({ ...row, id: `mentor-${i}` }));
  rows.push({ ...row, id: 'data', areas: [{ id: 'data', nombre: 'Bases de Datos' }] });
  fetchMock.mockResolvedValue({ ok: true, json: async () => ({ data: rows }) });
  const result = await getMentorDirectory({ ...query, areaIds: ['software'], offset: 6 });
  expect(result.mentors).toHaveLength(2); expect(result.total).toBe(8);
  expect(result.catalog.map(area => area.id)).toEqual(['data', 'software']);
});

it('no transforma errores ni contratos inválidos en un directorio vacío', async () => {
  fetchMock.mockResolvedValueOnce({ ok: false, status: 503 });
  await expect(getMentorDirectory(query)).rejects.toThrow('Ocurrió un problema al consultar');
  fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ data: [{ ...row, availabilityStatus: 'unknown' }] }) });
  await expect(getMentorDirectory(query)).rejects.toThrow('No se pudo interpretar');
});

it('descarta protocolos de foto no seguros sin inventar imágenes', async () => {
  fetchMock.mockResolvedValue({ ok: true, json: async () => ({ data: [{ ...row, foto_perfil: 'javascript:alert(1)' }] }) });
  const result = await getMentorDirectory(query);
  expect(result.mentors[0]).toMatchObject({ availability: 'AVAILABLE', photoUrl: null });
});

it('muestra cargo, empresa e intereses públicos cuando los entregue la rama de backend', async () => {
  fetchMock.mockResolvedValue({ ok: true, json: async () => ({ data: [{ ...row,
    cargo: 'Arquitecta de Software', empresa: 'Empresa de prueba',
    intereses: [{ id: 'api', nombre: 'APIs REST', area: { id: 'software', nombre: 'Desarrollo de Software' } }],
  }] }) });
  const result = await getMentorDirectory(query);
  expect(result.mentors[0]).toMatchObject({ profession: 'Arquitecta de Software | Empresa de prueba',
    interests: [{ id: 'api', name: 'APIs REST', areaId: 'software' }],
  });
  expect(result.catalog[0].topics).toEqual([{ id: 'api', name: 'APIs REST' }]);
  expect(result.interestsSupported).toBe(true);
});

it('admite el catálogo independiente de los mentores sin cargar datos de perfiles privados', async () => {
  fetchMock.mockResolvedValue({ ok: true, json: async () => ({ data: [row], catalog: [{
    area: { id: 'data', nombre: 'Bases de Datos' }, intereses: [{ id: 'sql', nombre: 'PostgreSQL' }],
  }] }) });
  const result = await getMentorDirectory(query);
  expect(result.catalog[0]).toMatchObject({ id: 'data', topics: [{ id: 'sql', name: 'PostgreSQL' }] });
  expect(fetchMock).toHaveBeenCalledTimes(1);
});

it('no inventa intereses ni profesión si la API todavía no entrega esos campos', async () => {
  fetchMock.mockResolvedValue({ ok: true, json: async () => ({ data: [row] }) });
  const result = await getMentorDirectory(query);
  expect(result.mentors[0].interests).toBeUndefined();
  expect(result.mentors[0].profession).toBeUndefined();
});

it('rechaza el contrato inválido de intereses y no lo convierte en ausencia de datos', async () => {
  fetchMock.mockResolvedValue({ ok: true, json: async () => ({ data: [{ ...row, intereses: [{ id: 'api', nombre: 'APIs REST' }] }] }) });
  await expect(getMentorDirectory(query)).rejects.toThrow('No se pudo interpretar');
});

it('requiere sesión y no consulta la API de forma anónima', async () => {
  clearAccessToken();
  await expect(getMentorDirectory(query)).rejects.toThrow('Inicia sesión');
  expect(fetchMock).not.toHaveBeenCalled();
});

it('propaga una sesión vencida sin presentar resultados vacíos', async () => {
  fetchMock.mockResolvedValue({ ok: false, status: 401 });
  await expect(getMentorDirectory(query)).rejects.toThrow('Inicia sesión');
});

it('combina OR dentro de cada grupo y AND entre áreas e intereses', () => {
  const mentors = [{ id: 'a', name: 'Ana', description: null, photoUrl: null, availability: null,
    areas: [{ id: 'software', name: 'Software' }], interests: [{ id: 'api', name: 'API', areaId: 'software' }],
  }];
  expect(filterDirectory(mentors, { areaIds: ['software', 'data'], topicIds: ['api', 'sql'] })).toHaveLength(1);
  expect(filterDirectory(mentors, { areaIds: ['data'], topicIds: ['api'] })).toHaveLength(0);
});
