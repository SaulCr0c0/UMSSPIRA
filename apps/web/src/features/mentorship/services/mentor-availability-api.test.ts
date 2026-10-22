import { clearAccessToken, getAccessToken, setAccessToken } from '@/shared/services/auth-session';
import { clearSession, saveSession } from '@/modules/auth/frontend/services/session';
import { getMentorAvailability, updateMentorAvailability } from './mentor-availability-api';

const originalFetch = global.fetch;
const fetchMock = jest.fn();
const state = { availabilityStatus: 'AVAILABLE', fecha_actualizacion: '2026-10-07' };

beforeEach(() => {
  clearSession();
  fetchMock.mockReset();
  global.fetch = fetchMock;
  setAccessToken('mentor-token');
});

afterEach(() => {
  clearSession();
  clearAccessToken();
  global.fetch = originalFetch;
});

it('consulta la disponibilidad con el token de la sesión', async () => {
  fetchMock.mockResolvedValue({ ok: true, json: async () => ({ data: state }) });
  expect(await getMentorAvailability()).toEqual(state);
  expect(fetchMock).toHaveBeenCalledWith(expect.stringMatching(/\/mentorship\/availability$/), expect.objectContaining({
    method: 'GET', credentials: 'omit',
    headers: expect.objectContaining({ Authorization: 'Bearer mentor-token' }),
  }));
});

it('recupera la sesión del login en una pestaña sin token en sessionStorage', async () => {
  clearAccessToken();
  saveSession('login-token', 'titulado', true);
  fetchMock.mockResolvedValue({ ok: true, json: async () => state });
  expect(await getMentorAvailability()).toEqual(state);
  expect(fetchMock).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
    headers: expect.objectContaining({ Authorization: 'Bearer login-token' }),
  }));
});

it('prioriza la sesión actual del login frente a una copia anterior', async () => {
  saveSession('current-login-token', 'titulado', false);
  fetchMock.mockResolvedValue({ ok: true, json: async () => state });
  await getMentorAvailability();
  expect(fetchMock).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
    headers: expect.objectContaining({ Authorization: 'Bearer current-login-token' }),
  }));
});

it.each([500, 503])('no confunde HTTP %i con una sesión inválida', async status => {
  fetchMock.mockResolvedValue({ ok: false, status });
  await expect(getMentorAvailability()).rejects.toMatchObject({ status, message: 'No se pudo cargar la disponibilidad. Inténtalo de nuevo.' });
  expect(getAccessToken()).toBe('mentor-token');
});

it('distingue un error de red de una sesión inválida', async () => {
  fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));
  await expect(getMentorAvailability()).rejects.toMatchObject({ status: 0, message: expect.stringContaining('Revisa tu conexión') });
  expect(getAccessToken()).toBe('mentor-token');
});

it('envía el token y el estado seleccionado al guardar', async () => {
  const paused = { ...state, availabilityStatus: 'PAUSED' };
  fetchMock.mockResolvedValue({ ok: true, json: async () => ({ data: paused }) });
  expect(await updateMentorAvailability('PAUSED')).toEqual(paused);
  expect(fetchMock).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
    method: 'PATCH', body: JSON.stringify({ availabilityStatus: 'PAUSED' }),
    headers: expect.objectContaining({ Authorization: 'Bearer mentor-token', 'content-type': 'application/json' }),
  }));
});

it('sin sesión rechaza la consulta y el guardado antes de enviar peticiones', async () => {
  clearAccessToken();
  await expect(getMentorAvailability()).rejects.toMatchObject({ status: 401 });
  await expect(updateMentorAvailability('AVAILABLE')).rejects.toMatchObject({ status: 401 });
  expect(fetchMock).not.toHaveBeenCalled();
});

it('limpia la sesión rechazada por el backend con 401', async () => {
  fetchMock.mockResolvedValue({ ok: false, status: 401 });
  await expect(getMentorAvailability()).rejects.toMatchObject({ status: 401 });
  expect(getAccessToken()).toBeNull();
});

it('conserva la sesión cuando el backend rechaza los permisos con 403', async () => {
  fetchMock.mockResolvedValue({ ok: false, status: 403 });
  await expect(updateMentorAvailability('PAUSED')).rejects.toMatchObject({ status: 403 });
  expect(getAccessToken()).toBe('mentor-token');
});

it('un 401 de una petición anterior no borra un token renovado', async () => {
  fetchMock.mockImplementation(async () => {
    setAccessToken('renewed-token');
    return { ok: false, status: 401 };
  });
  await expect(getMentorAvailability()).rejects.toMatchObject({ status: 401 });
  expect(getAccessToken()).toBe('renewed-token');
});
