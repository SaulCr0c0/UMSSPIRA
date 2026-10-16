export const TOKEN_COOKIE = "umsspira_token";
export const ROLE_COOKIE = "umsspira_role";

export const LOGIN_PATH = "/login";
export const ADMIN_HOME = "/applications";
export const USER_HOME = "/me";
export const COMPANY_HOME = "/companies";
export const PORTAL_HOME = "/portal";

export type AccessDecision = { allowed: true } | { allowed: false; redirectTo: string };

export function homeFor(role: string | undefined): string {
  if (role === "administrador") return ADMIN_HOME;
  if (role === "empresa") return COMPANY_HOME;
  if (role === "titulado") return PORTAL_HOME;
  return USER_HOME;
}

export function decideAccess(
  pathname: string,
  token: string | undefined,
  role: string | undefined,
): AccessDecision {
  // Sesión recordada: quien ya tiene sesión no vuelve a ver el formulario de acceso,
  // lo lleva a su pantalla según el rol
  if (pathname === LOGIN_PATH) {
    return token ? { allowed: false, redirectTo: homeFor(role) } : { allowed: true };
  }

  // CA-05.1: sin sesión no se ve ninguna pantalla protegida
  if (!token) return { allowed: false, redirectTo: LOGIN_PATH };

  // CA-05.5: solo el administrador entra al panel administrativo
  if (pathname.startsWith(ADMIN_HOME) && role !== "administrador") {
    return { allowed: false, redirectTo: USER_HOME };
  }

  return { allowed: true };
}