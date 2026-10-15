import { getMentorAreas, updateMentorAreas, MentorAreasError } from './mentor-areas-api';
import { setAccessToken, clearAccessToken, getAccessToken } from '@/shared/services/auth-session';
const originalFetch = global.fetch;
const fetchMock = jest.fn();
beforeEach(() => { fetchMock.mockReset(); global.fetch = fetchMock; setAccessToken('test-token'); });
afterEach(() => clearAccessToken());
afterAll(() => { global.fetch = originalFetch; });
it('expone el estado HTTP para manejar acceso denegado', async () => {
  fetchMock.mockResolvedValue({ ok: false, status: 403 });
  await expect(getMentorAreas()).rejects.toMatchObject({ status: 403, message: 'No tienes permisos para acceder a esta sección' });
  try { await getMentorAreas(); } catch (error) { expect(error).toBeInstanceOf(MentorAreasError); }
});
it('conserva los intereses dependientes cuando la API los proporciona', async () => {
  const state = { areas: [{ id: '1', nombre: 'Backend', descripcion: null }], selectedIds: ['1'], intereses: [{ id_area: '1', nombre: 'APIs REST' }] };
  fetchMock.mockResolvedValue({ ok: true, json: async () => state });
  expect(await getMentorAreas()).toEqual(state);
});
it('no inventa intereses si el contrato actual no los devuelve', async () => {
  fetchMock.mockResolvedValue({ ok: true, json: async () => ({ areas: [], selectedIds: [] }) });
  expect((await getMentorAreas()).intereses).toBeUndefined();
});

it.each([500, 502, 503, 599])('oculta detalles internos en GET y PATCH con HTTP %i', async status => {
  const detail = 'SELECT * FROM mentor_area; /srv/api/private.ts:42; postgres.internal:5432';
  fetchMock.mockResolvedValue({
    ok: false, status,
    text: async () => JSON.stringify({ message: detail, stack: detail }),
    json: async () => ({ message: detail, stack: detail }),
  });

  await expect(getMentorAreas()).rejects.toMatchObject({
    status, message: 'No pudimos cargar las áreas técnicas. Intenta nuevamente en unos momentos.',
  });
  await expect(updateMentorAreas(['1'])).rejects.toMatchObject({
    status, message: 'No pudimos guardar tus áreas técnicas. Intenta nuevamente en unos momentos.',
  });
  expect(getAccessToken()).toBe('test-token');
});

it.each(['<html>Error en /srv/api/private.ts</html>', 'SQLSTATE 42P01: relation mentor_area', ''])('no expone cuerpos 500 de texto o HTML: %s', async body => {
  fetchMock.mockResolvedValue({ ok: false, status: 500, text: async () => body });
  await expect(getMentorAreas()).rejects.toMatchObject({
    message: 'No pudimos cargar las áreas técnicas. Intenta nuevamente en unos momentos.',
  });
});

it.each([
  ['CANTIDAD_AREAS_INVALIDA', 'Debes seleccionar entre 1 y 5 áreas técnicas.'],
  ['AREA_NO_EXISTE', 'Una o más áreas seleccionadas ya no están disponibles en el catálogo.'],
  ['AREA_NO_VALIDA', 'Selecciona únicamente áreas técnicas del catálogo.'],
  ['AREA_INACTIVA', 'Una o más áreas seleccionadas están inactivas. Revisa tu selección.'],
])('conserva información útil para la validación 422 %s sin copiar el mensaje del servidor', async (code, message) => {
  fetchMock.mockResolvedValue({ ok: false, status: 422, json: async () => ({ code, message: 'SELECT * FROM private_table' }) });
  await expect(updateMentorAreas(['1'])).rejects.toMatchObject({ status: 422, message });
});

it.each([400, 422])('usa un mensaje de validación seguro si HTTP %i no tiene un código reconocido', async status => {
  fetchMock.mockResolvedValue({ ok: false, status, json: async () => ({ code: 'constructor', message: '/srv/private.ts' }) });
  await expect(updateMentorAreas(['1'])).rejects.toMatchObject({
    status, message: 'Revisa las áreas seleccionadas e intenta nuevamente.',
  });
});

it('mantiene la invalidación actual del token cuando la API responde 401', async () => {
  fetchMock.mockResolvedValue({ ok: false, status: 401 });
  await expect(getMentorAreas()).rejects.toMatchObject({ status: 401, message: 'Inicia sesión para configurar tus áreas técnicas.' });
  expect(getAccessToken()).toBeNull();
  await expect(getMentorAreas()).rejects.toMatchObject({ status: 401 });
  expect(fetchMock).toHaveBeenCalledTimes(1);
});
