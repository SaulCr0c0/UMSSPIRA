const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export interface Career {
  id: string;
  nombre: string;
}

const DEFAULT_CAREERS: Career[] = [
  { id: 'sistemas', nombre: 'Licenciatura en Ingeniería de Sistemas' },
  { id: 'informatica', nombre: 'Licenciatura en Ingeniería Informática' },
];

export async function fetchCareers(): Promise<Career[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/registrations/careers`);
    const body = await response.json();
    if (response.ok && Array.isArray(body.data) && body.data.length > 0) {
      return body.data;
    }
    return DEFAULT_CAREERS;
  } catch {
    return DEFAULT_CAREERS;
  }
}

export async function createRegistrationSession(data: Record<string, unknown>) {
  const response = await fetch(`${API_BASE_URL}/registrations/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const body = await response.json();
  if (!response.ok) {
    return { ok: false as const, message: (body.message ?? body.error ?? 'Error al procesar') as string };
  }
  return { ok: true as const, sessionToken: body.data.sessionToken as string };
}