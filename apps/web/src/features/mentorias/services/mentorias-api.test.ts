import { getMentorProfile, updateMentorParticipation } from './mentorias-api';

const profile = { isActive: false, requirements: { egresado: true, perfil: true } };
const fetchMock = jest.fn();
const originalFetch = global.fetch;

beforeEach(() => {
  fetchMock.mockReset();
  global.fetch = fetchMock;
});
afterAll(() => { global.fetch = originalFetch; });

it('consulta el perfil con credenciales y sin caché', async () => {
  fetchMock.mockResolvedValue({ ok: true, json: async () => profile });
  expect(await getMentorProfile()).toEqual(profile);
  expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/mentorias/mi-perfil'), expect.objectContaining({ method: 'GET', credentials: 'include', cache: 'no-store' }));
});

it('envía PATCH JSON y devuelve el estado confirmado', async () => {
  const active = { ...profile, isActive: true };
  fetchMock.mockResolvedValue({ ok: true, json: async () => active });
  expect(await updateMentorParticipation(true)).toEqual(active);
  expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/mentorias/mi-perfil/participacion'), expect.objectContaining({ method: 'PATCH', body: '{"isActive":true}', headers: { Accept: 'application/json', 'Content-Type': 'application/json' } }));
});

it.each([401, 403, 404, 500])('rechaza HTTP %s', async status => {
  fetchMock.mockResolvedValue({ ok: false, status });
  await expect(getMentorProfile()).rejects.toThrow();
});

it.each([null, {}, { isActive: 'true', requirements: profile.requirements }, { isActive: false, requirements: { egresado: true } }])('rechaza respuestas incompletas: %j', async data => {
  fetchMock.mockResolvedValue({ ok: true, json: async () => data });
  await expect(getMentorProfile()).rejects.toThrow('formato inválido');
});
