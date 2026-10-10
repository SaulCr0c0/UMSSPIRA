import { ROLE_COOKIE, TOKEN_COOKIE } from "./route-access";

// Solo se usa en el navegador. Con "Recordar mi sesión" dura 7 días;
// sin marcar, las cookies terminan al cerrar el navegador.
export function saveSession(token: string, role: string, remember: boolean): void {
  const maxAge = remember ? "; max-age=604800" : "";
  document.cookie = `${TOKEN_COOKIE}=${encodeURIComponent(token)}; path=/; samesite=lax${maxAge}`;
  document.cookie = `${ROLE_COOKIE}=${encodeURIComponent(role)}; path=/; samesite=lax${maxAge}`;
}

export function clearSession(): void {
  document.cookie = `${TOKEN_COOKIE}=; path=/; max-age=0`;
  document.cookie = `${ROLE_COOKIE}=; path=/; max-age=0`;
}