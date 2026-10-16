let accessToken: string | null = null;
const ACCESS_TOKEN_KEY = 'umsspira.access-token';
let isRedirecting = false;

import { clearSession } from '@/modules/auth/frontend/services/session';
import { authStore } from '@/modules/auth/frontend/store/auth.store';

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function clearLocalStorageToken(): void {
  try {
    if (isBrowser()) window.localStorage.removeItem('token');
  } catch {
    /* sin acceso a storage */
  }
}

export function getAccessToken(): string | null {
  if (accessToken) return accessToken;
  if (!isBrowser()) return null;
  accessToken = window.sessionStorage.getItem(ACCESS_TOKEN_KEY);
  return accessToken;
}

export function setAccessToken(token: string): void {
  accessToken = token;
  if (isBrowser()) window.sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function clearAccessToken(): void {
  accessToken = null;
  if (isBrowser()) window.sessionStorage.removeItem(ACCESS_TOKEN_KEY);
}

export function resetSessionExpiredState(): void {
  isRedirecting = false;
  customRedirect = null;
}

let customRedirect: ((url: string) => void) | null = null;

export function setSessionExpiredRedirectHandler(handler: ((url: string) => void) | null): void {
  customRedirect = handler;
}

function defaultNavigate(url: string): void {
  if (process.env.NODE_ENV === 'test') {
    return;
  }
  try {
    if (typeof window.location?.replace === 'function') {
      window.location.replace(url);
    } else {
      window.location.href = url;
    }
  } catch {
    try {
      window.location.href = url;
    } catch {
      /* jsdom sin navegación activa */
    }
  }
}

export function handleSessionExpired(redirectUrl = '/login?expired=1'): Promise<void> {
  if (!isBrowser()) return Promise.resolve();

  // Evita bucle si ya estamos en la pantalla de login
  if (window.location.pathname === '/login') return Promise.resolve();

  // Evita redirecciones múltiples ante peticiones concurrentes con 401
  if (isRedirecting) return Promise.resolve();
  isRedirecting = true;

  clearAccessToken();
  clearLocalStorageToken();
  authStore.reset();

  return clearSession()
    .catch(() => {})
    .finally(() => {
      if (customRedirect) {
        customRedirect(redirectUrl);
      } else {
        defaultNavigate(redirectUrl);
      }
    });
}
