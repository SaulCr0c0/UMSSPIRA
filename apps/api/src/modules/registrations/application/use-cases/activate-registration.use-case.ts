import { BusinessRuleError } from '../../../../shared/errors/business-rule-error';
import type { PasswordHasher } from '../../../auth/application/ports/password-hasher.port';
import type { ApplicationsRepository } from '../ports/applications-repository.port';
import type { RegistrationSecurity } from '../ports/registration-security.port';

export class ActivateRegistrationUseCase {
  constructor(
    private readonly repository: ApplicationsRepository,
    private readonly security: RegistrationSecurity,
    private readonly passwords: PasswordHasher,
  ) {}

  async execute(id: string, code: string, password: string) {
    const result = await this.repository.activate(
      id,
      this.security.hash('activation', id + ':' + code),
      await this.passwords.hash(password),
    );
    if (result === 'expired') {
      throw new BusinessRuleError(
        'expired',
        'ACTIVATION_EXPIRED',
        'El código de activación venció',
      );
    }
    if (result === 'locked') {
      throw new BusinessRuleError(
        'limited',
        'ACTIVATION_ATTEMPTS_EXCEEDED',
        'Se agotaron los intentos de activación',
      );
    }
    if (result !== 'activated') {
      throw new BusinessRuleError(
        'invalid',
        'INVALID_ACTIVATION',
        'La activación no es válida o ya fue utilizada',
      );
    }
    return { activated: true };
  }
}
