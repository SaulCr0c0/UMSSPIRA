import type {
  ActivateCompanyInvitationPayload,
  CompanyInvitationResponse,
} from '@umsspira/shared-types';
import { InvitationError } from '../services/invitation-error';

// TODO: eliminar cuando el backend de invitaciones esté integrado.
export const MOCK_TOKENS = {
  valid: 'valido'.padEnd(43, 'a'),
  expired: 'vencido'.padEnd(43, 'a'),
  used: 'usado'.padEnd(43, 'a'),
  serverError: 'error'.padEnd(43, 'a'),
} as const;

// Contraseña que simula una falla del servidor al activar (HU-02 CA-31).
export const MOCK_SERVER_FAILURE_PASSWORD = 'Servidor123';

const wait = (milliseconds: number) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

export async function mockValidateInvitation(token: string): Promise<CompanyInvitationResponse> {
  await wait(1200);
  switch (token) {
    case MOCK_TOKENS.valid:
      return {
        companyName: 'TechSolutions S.A.',
        email: 'co***@techsolutions.com',
        expiresAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
      };
    case MOCK_TOKENS.expired:
      throw new InvitationError('expired', 'La invitación venció.');
    case MOCK_TOKENS.used:
      throw new InvitationError('used', 'La invitación ya fue utilizada.');
    case MOCK_TOKENS.serverError:
      throw new InvitationError('unavailable', 'Error del servidor.');
    default:
      throw new InvitationError('invalid', 'La invitación no existe.');
  }
}

export async function mockActivateInvitation(
  token: string,
  payload: ActivateCompanyInvitationPayload,
): Promise<void> {
  await wait(1000);
  if (payload.password === MOCK_SERVER_FAILURE_PASSWORD) {
    throw new InvitationError('unavailable', 'Error del servidor.');
  }
  if (token !== MOCK_TOKENS.valid) {
    throw new InvitationError('invalid', 'La invitación no existe.');
  }
}