const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

interface ApiClientOptions
  extends Omit<RequestInit, 'body'> {
  body?: unknown;
}

async function apiRequest<TResponse>(
  path: string,
  options: ApiClientOptions = {},
): Promise<TResponse> {
  const { body, headers: providedHeaders, ...requestOptions } =
    options;
  const headers = new Headers(providedHeaders);

  if (body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...requestOptions,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const responseText = await response.text();
  let responseData: unknown;

  if (responseText) {
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = responseText;
    }
  }

  if (!response.ok) {
    const message = getErrorMessage(responseData);

    throw new Error(
      message ??
        `La solicitud falló con el estado ${response.status}.`,
    );
  }

  return responseData as TResponse;
}

function getErrorMessage(responseData: unknown): string | null {
  if (
    typeof responseData !== 'object' ||
    responseData === null ||
    !('message' in responseData)
  ) {
    return null;
  }

  const { message } = responseData;

  if (Array.isArray(message)) {
    return message.join(' ');
  }

  return typeof message === 'string' ? message : null;
}

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

// Conserva las dos formas usadas por eventos y afinidad.
export const apiClient = Object.assign(apiRequest, {
  get: <TResponse>(path: string) => request<TResponse>(path),
  post: <TResponse, TBody = unknown>(path: string, body?: TBody) =>
    request<TResponse>(path, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),
});
