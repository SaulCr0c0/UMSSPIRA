export interface GraduateCsvFilters {
  career?: string;
  search?: string;
}

export interface GraduateCsvDownload {
  blob: Blob;
  filename: string;
}

const DEFAULT_ERROR_MESSAGE =
  'No se pudo generar el archivo CSV. Intente nuevamente.';

function buildDefaultFilename(date: Date = new Date()): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `nomina-egresados-verificados-${day}${month}${year}.csv`;
}

function getFilename(contentDisposition: string | null): string {
  if (!contentDisposition) {
    return buildDefaultFilename();
  }

  const match = /filename="?([^";]+)"?/i.exec(contentDisposition);
  return match?.[1] ?? buildDefaultFilename();
}

async function getErrorMessage(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as { message?: unknown };

    if (typeof payload.message === 'string' && payload.message.trim() !== '') {
      return payload.message;
    }
  } catch {
    // La API puede responder sin cuerpo JSON ante ciertos errores de red/proxy.
  }

  return DEFAULT_ERROR_MESSAGE;
}

export async function requestGraduateCsv(
  filters: GraduateCsvFilters = {},
  apiBaseUrl: string = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000',
): Promise<GraduateCsvDownload> {
  const params = new URLSearchParams();

  if (filters.career?.trim()) {
    params.set('career', filters.career.trim());
  }

  if (filters.search?.trim()) {
    params.set('search', filters.search.trim());
  }

  const query = params.toString();
  const baseUrl = apiBaseUrl.replace(/\/$/, '');
  const url = `${baseUrl}/graduates-report/csv${query ? `?${query}` : ''}`;
  const response = await fetch(url, { method: 'GET' });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return {
    blob: await response.blob(),
    filename: getFilename(response.headers.get('Content-Disposition')),
  };
}

export function triggerGraduateCsvDownload({
  blob,
  filename,
}: GraduateCsvDownload): void {
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = objectUrl;
  anchor.download = filename;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(objectUrl);
}
