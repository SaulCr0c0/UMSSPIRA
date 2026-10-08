const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export type DocumentType = 'titulo_provision_nacional' | 'diploma_academico' | 'certificado_egreso';

export const DOCUMENT_TYPE_OPTIONS: { value: DocumentType; label: string }[] = [
  { value: 'titulo_provision_nacional', label: 'Título en Provisión Nacional' },
  { value: 'diploma_academico', label: 'Diploma Académico' },
  { value: 'certificado_egreso', label: 'Certificado de Egreso' },
];

export interface UploadedDocument {
  path: string;
  tipoDocumento: DocumentType;
  mimeType: 'application/pdf' | 'image/png' | 'image/jpeg';
  sizeBytes: number;
  originalName: string;
}

export interface DocumentFieldError {
  field: string;
  message: string;
}

export type UploadDocumentResult =
  | { ok: true; document: UploadedDocument }
  | { ok: false; status: number; code?: string; message: string; errors: DocumentFieldError[] };

type ApiErrorBody = {
  message?: string | string[];
  code?: string;
  errors?: DocumentFieldError[];
};

export interface UploadDocumentParams {
  sessionToken: string;
  tipoDocumento: DocumentType;
  file: File;
}

// Envia el documento al backend, que lo valida y lo guarda en el bucket privado (CA-03.2 y CA-03.3).
export async function uploadDocument({ sessionToken, tipoDocumento, file }: UploadDocumentParams): Promise<UploadDocumentResult> {
  const formData = new FormData();
  formData.append('sessionToken', sessionToken);
  formData.append('tipoDocumento', tipoDocumento);
  formData.append('archivo', file);

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/documents`, { method: 'POST', body: formData });
  } catch {
    return {
      ok: false,
      status: 0,
      message: 'No se pudo conectar con el servidor. Intenta nuevamente en unos minutos.',
      errors: [],
    };
  }

  let body: ({ data?: UploadedDocument } & ApiErrorBody) | null = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  if (response.ok && body?.data) {
    return { ok: true, document: body.data };
  }

  const rawMessage = body?.message;
  const message = Array.isArray(rawMessage) ? rawMessage[0] : rawMessage;
  return {
    ok: false,
    status: response.status,
    code: body?.code,
    message: message ?? 'No se pudo enviar el documento. Intenta nuevamente.',
    errors: Array.isArray(body?.errors) ? body.errors : [],
  };
}
