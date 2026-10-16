import { getMentorAreas, updateMentorAreas, MentorAreasError } from './mentor-areas-api';
import {
  setAccessToken,
  clearAccessToken,
  setSessionExpiredRedirectHandler,
  resetSessionExpiredState,
} from '@/shared/services/auth-session';
const originalFetch = global.fetch;
const fetchMock = jest.fn();
beforeEach(() => {
  fetchMock.mockReset();
  global.fetch = fetchMock;
  resetSessionExpiredState();
  setAccessToken('test-token');
});
afterEach(() => {
  clearAccessToken();
  resetSessionExpiredState();
});
afterAll(() => { global.fetch = originalFetch; });
it('expone el estado HTTP para manejar acceso denegado', async () => {
  fetchMock.mockResolvedValue({ ok: false, status: 403 });
  await expect(getMentorAreas()).rejects.toMatchObject({ status: 403, message: 'No tienes permisos para acceder a esta sección' });
  try { await getMentorAreas(); } catch (error) { expect(error).toBeInstanceOf(MentorAreasError); }
});
it('al recibir 401 dispara handleSessionExpired y rechaza con MentorAreasError 401', async () => {
  const redirectSpy = jest.fn();
  setSessionExpiredRedirectHandler(redirectSpy);
  fetchMock.mockResolvedValue({ ok: false, status: 401 });

  await expect(getMentorAreas()).rejects.toMatchObject({
    status: 401,
    message: 'Inicia sesión para configurar tus áreas técnicas.',
  });
  expect(redirectSpy).toHaveBeenCalledWith('/login?expired=1');
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
