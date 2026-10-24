// Contrato de invitaciones de empresa (Epic 4 - HU-01 y HU-02).

export interface CompanyInvitationResponse {
  companyName: string;
  email: string;
  expiresAt: string;
}

export interface ActivateCompanyInvitationPayload {
  password: string;
  confirmPassword: string;
}

export interface ActivateCompanyInvitationResponse {
  activated: true;
}

export type CompanyInvitationErrorCode =
  | 'INVITATION_TOKEN_INVALID'
  | 'INVITATION_NOT_FOUND'
  | 'INVITATION_EXPIRED'
  | 'INVITATION_ALREADY_USED';