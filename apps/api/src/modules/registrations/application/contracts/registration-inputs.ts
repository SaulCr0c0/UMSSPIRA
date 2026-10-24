export interface SubmitRegistrationInput {
  sessionToken: string;
  fechaTitulacion?: string;
  fechaIngreso?: string;
  deseaMentor: boolean;
  tipoDocumento: string;
  rutaStorage: string;
  sizeBytes: number;
  mimeType?: string;
}

export interface IssueEmailCodeInput {
  registrationId: string;
}

export interface VerifyEmailCodeInput extends IssueEmailCodeInput {
  code: string;
}

export interface UploadRegistrationDocumentInput {
  sessionToken: string;
  tipoDocumento: string;
}

export interface ActivateRegistrationInput {
  applicationId: string;
  code: string;
  password: string;
}

export interface UploadedDocument {
  originalname: string;
  buffer: Buffer;
  size: number;
}

export interface ReviewInput {
  decision: 'APROBADA' | 'OBSERVADA' | 'RECHAZADA';
  category?: string;
  note?: string;
}

export interface ApplicationQuery {
  page: number;
  pageSize: number;
  career?: string;
  status?: 'PENDIENTE' | 'APROBADA' | 'OBSERVADA' | 'RECHAZADA';
  search?: string;
  age?: 'within48' | 'over48';
}

export interface Notification {
  to: string;
  subject: string;
  text: string;
}
