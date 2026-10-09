// Cliente HTTP centralizado para consumir la API del backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export class ApiException extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiException';
    this.status = status;
  }
}

async function request<TResponse>(path: string, init?: RequestInit): Promise<TResponse> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });

  if (!response.ok) {
    throw new ApiException(response.status, `Error ${response.status} al consultar ${path}`);
  }

  return (await response.json()) as TResponse;
}

export const apiClient = {
  get: <TResponse>(path: string) => request<TResponse>(path),
  post: <TResponse, TBody = unknown>(path: string, body?: TBody) =>
    request<TResponse>(path, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),
};