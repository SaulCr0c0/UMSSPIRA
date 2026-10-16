import {
  clearAccessToken,
  getAccessToken,
  handleSessionExpired,
  resetSessionExpiredState,
  setAccessToken,
  setSessionExpiredRedirectHandler,
} from './auth-session';
import { authStore } from '@/modules/auth/frontend/store/auth.store';
import { clearSession } from '@/modules/auth/frontend/services/session';

jest.mock('@/modules/auth/frontend/services/session', () => ({
  clearSession: jest.fn().mockResolvedValue(undefined),
}));

beforeEach(() => {
  clearAccessToken();
  resetSessionExpiredState();
  authStore.reset();
  window.localStorage.clear();
  window.sessionStorage.clear();
  (clearSession as jest.Mock).mockClear();
});

it('mantiene el token de prueba disponible durante la sesión del navegador', () => {
  setAccessToken('temporary-test-token');

  expect(getAccessToken()).toBe('temporary-test-token');
  expect(window.sessionStorage.getItem('umsspira.access-token')).toBe('temporary-test-token');
});

it('recupera el token de sesión después de reiniciar el módulo', () => {
  window.sessionStorage.setItem('umsspira.access-token', 'temporary-test-token');
  jest.resetModules();
  const session = require('./auth-session') as typeof import('./auth-session');

  expect(session.getAccessToken()).toBe('temporary-test-token');
});

it('elimina el token también del almacenamiento de sesión', () => {
  setAccessToken('temporary-test-token');
  clearAccessToken();

  expect(getAccessToken()).toBeNull();
  expect(window.sessionStorage.getItem('umsspira.access-token')).toBeNull();
});

it('handleSessionExpired limpia tokens, cookies, authStore de inmediato y redirige a login tras terminar clearSession', async () => {
  window.history.pushState({}, '', '/mentorship/profile/areas');
  const redirectSpy = jest.fn();
  setSessionExpiredRedirectHandler(redirectSpy);

  setAccessToken('token-test');
  window.localStorage.setItem('token', 'token-local');
  authStore.setState({ status: 'authenticated', role: 'titulado', accessToken: 'token-test' });

  let finishClearSession!: () => void;
  (clearSession as jest.Mock).mockImplementationOnce(() => new Promise<void>((resolve) => {
    finishClearSession = resolve;
  }));

  const promise = handleSessionExpired();

  expect(getAccessToken()).toBeNull();
  expect(window.localStorage.getItem('token')).toBeNull();
  expect(authStore.getState().status).toBe('idle');
  expect(clearSession).toHaveBeenCalled();
  expect(redirectSpy).not.toHaveBeenCalled();

  finishClearSession();
  await promise;

  expect(redirectSpy).toHaveBeenCalledWith('/login?expired=1');
});

it('handleSessionExpired no rompe si clearSession falla y ejecuta la redirección en finally', async () => {
  window.history.pushState({}, '', '/mentorship/profile/areas');
  const redirectSpy = jest.fn();
  setSessionExpiredRedirectHandler(redirectSpy);

  (clearSession as jest.Mock).mockRejectedValueOnce(new Error('Network failure'));

  await handleSessionExpired();

  expect(redirectSpy).toHaveBeenCalledWith('/login?expired=1');
});

it('handleSessionExpired no dispara múltiples redirecciones simultáneas ante peticiones concurrentes', async () => {
  window.history.pushState({}, '', '/mentorship/profile/areas');
  const redirectSpy = jest.fn();
  setSessionExpiredRedirectHandler(redirectSpy);

  await Promise.all([
    handleSessionExpired(),
    handleSessionExpired(),
    handleSessionExpired(),
  ]);

  expect(redirectSpy).toHaveBeenCalledTimes(1);
});

it('handleSessionExpired no redirige en bucle si ya se encuentra en /login', async () => {
  window.history.pushState({}, '', '/login');
  const redirectSpy = jest.fn();
  setSessionExpiredRedirectHandler(redirectSpy);

  await handleSessionExpired();
  expect(redirectSpy).not.toHaveBeenCalled();
});

