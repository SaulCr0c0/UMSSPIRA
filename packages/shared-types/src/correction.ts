export interface CorrectionAccessResponse {
  valid: boolean;
}

export interface RequestCorrectionLinkDto {
  ci: string;
  complemento?: string;
  expedidoEn: string;
}

export interface RequestCorrectionLinkResponse {
  message: string;
}
