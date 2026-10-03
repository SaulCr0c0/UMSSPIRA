// Servicio de autenticación del módulo auth (HU-05)

export type UserRole = "administrador" | "egresado";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResult {
  accessToken: string;
  role: UserRole;
}

// Mensaje fijo por CA-05.4: no revela si falló el correo o la contraseña
export const LOGIN_ERROR_MESSAGE = "Correo electrónico o contraseña incorrectos";

// Mientras el PR de authApi no esté fusionado y el backend corriendo, se usa el mock.
// Cambiar a false cuando el endpoint real esté disponible.
const USE_MOCK = true;

// El backend corre en el puerto 3000 y su controlador ya incluye el prefijo "api/auth"
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

async function loginMock(credentials: LoginCredentials): Promise<LoginResult> {
  await new Promise((resolve) => setTimeout(resolve, 400));

  const email = credentials.email.trim().toLowerCase();

  if (email === "admin@umss.edu.bo" && credentials.password === "admin1234") {
    return { accessToken: "mock-token-administrador", role: "administrador" };
  }
  if (email === "egresado@umss.edu.bo" && credentials.password === "egresado1234") {
    return { accessToken: "mock-token-egresado", role: "egresado" };
  }
  throw new Error(LOGIN_ERROR_MESSAGE);
}

async function loginRequest(credentials: LoginCredentials): Promise<LoginResult> {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  // 401 (credenciales) y 400 (validación): siempre el mismo mensaje genérico
  if (!response.ok) {
    throw new Error(LOGIN_ERROR_MESSAGE);
  }

  // El backend envuelve la respuesta en { data: ... }
  const json = (await response.json()) as { data: LoginResult };
  return json.data;
}

export function login(credentials: LoginCredentials): Promise<LoginResult> {
  return USE_MOCK ? loginMock(credentials) : loginRequest(credentials);
}

// Destino tras iniciar sesión según el rol (CA-05.2 y CA-05.3)
export function getRedirectPath(role: UserRole): string {
  return role === "administrador" ? "/applications" : "/me";
}