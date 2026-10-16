import {
  clearAccessToken,
  getAccessToken,
  handleSessionExpired,
  resetSessionExpiredState,
  setAccessToken,
  setSessionExpiredRedirectHandler,
} from './auth-session';
import { authStore } from '@/modules/auth/frontend/store/auth.store';
import { getSessionToken, saveSession } from '@/modules/auth/frontend/services/session';

beforeEach(() => {
  clearAccessToken();
  resetSessionExpiredState();
  authStore.reset();
  window.localStorage.clear();
  window.sessionStorage.clear();
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

it('handleSessionExpired limpia tokens, cookies, authStore y redirige a login', () => {
  window.history.pushState({}, '', '/mentorship/profile/areas');
  const redirectSpy = jest.fn();
  setSessionExpiredRedirectHandler(redirectSpy);

  setAccessToken('token-test');
  saveSession('token-cookie', 'titulado', false);
  window.localStorage.setItem('token', 'token-local');
  authStore.setState({ status: 'authenticated', role: 'titulado', accessToken: 'token-test' });

  handleSessionExpired();

  expect(getAccessToken()).toBeNull();
  expect(getSessionToken()).toBeNull();
  expect(window.localStorage.getItem('token')).toBeNull();
  expect(authStore.getState().status).toBe('idle');
  expect(redirectSpy).toHaveBeenCalledWith('/login?expired=1');
});

it('handleSessionExpired no dispara múltiples redirecciones simultáneas ante peticiones concurrentes', () => {
  window.history.pushState({}, '', '/mentorship/profile/areas');
  const redirectSpy = jest.fn();
  setSessionExpiredRedirectHandler(redirectSpy);

  handleSessionExpired();
  handleSessionExpired();
  handleSessionExpired();

  expect(redirectSpy).toHaveBeenCalledTimes(1);
});

it('handleSessionExpired no redirige en bucle si ya se encuentra en /login', () => {
  window.history.pushState({}, '', '/login');
  const redirectSpy = jest.fn();
  setSessionExpiredRedirectHandler(redirectSpy);

  handleSessionExpired();
  expect(redirectSpy).not.toHaveBeenCalled();
});

