import type { ExperienceInput, WorkExperience } from "../types/experience";

// Centraliza las llamadas usadas por las cuatro pantallas y comparte el
// contrato REST de experiencia laboral con el backend NestJS.
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";
const EXPERIENCES_URL = `${API_URL}/api/profile/experiences`;

// Convierte errores HTTP del API en mensajes visibles en la pantalla.
async function throwResponseError(response: Response): Promise<never> {
  const responseText = await response.text();
  if (!responseText) {
    throw new Error(`La solicitud falló con estado HTTP ${response.status}.`);
  }

  let body: unknown;
  try {
    body = JSON.parse(responseText);
  } catch {
    throw new Error(responseText);
  }

  if (typeof body === "object" && body !== null && "message" in body) {
    const message = body.message;
    if (typeof message === "string") throw new Error(message);
    if (Array.isArray(message) && message.every((item) => typeof item === "string")) {
      throw new Error(message.join(", "));
    }
  }

  throw new Error(responseText);
}

// Ejecuta solicitudes JSON y evita tratar una respuesta HTTP fallida como éxito.
async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    await throwResponseError(response);
  }

  return (await response.json()) as T;
}

// Lista experiencias del perfil configurado en el backend.
export function getExperiences(): Promise<WorkExperience[]> {
  return requestJson<WorkExperience[]>(EXPERIENCES_URL);
}

// Recupera una experiencia por UUID para ver sus datos o precargar la edición.
export function getExperience(id: string): Promise<WorkExperience> {
  return requestJson<WorkExperience>(`${EXPERIENCES_URL}/${encodeURIComponent(id)}`);
}

// Crea una experiencia desde el formulario /new y devuelve su UUID de base de datos.
export function createExperience(input: ExperienceInput): Promise<WorkExperience> {
  return requestJson<WorkExperience>(EXPERIENCES_URL, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

// Actualiza todos los campos editables del registro existente.
export function updateExperience(id: string, input: ExperienceInput): Promise<WorkExperience> {
  return requestJson<WorkExperience>(`${EXPERIENCES_URL}/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

// Elimina el registro confirmado por la persona en el modal de la lista.
export async function deleteExperience(id: string): Promise<void> {
  const response = await fetch(`${EXPERIENCES_URL}/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    await throwResponseError(response);
  }
}
