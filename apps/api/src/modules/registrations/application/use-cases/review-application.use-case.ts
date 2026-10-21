import type { ActorContext } from '../../../../shared/security/contexts/actor-context';
import type { ReviewInput } from '../contracts/registration-inputs';
import type { ApplicationsRepository } from '../ports/applications-repository.port';
import type { RegistrationSecurity } from '../ports/registration-security.port';

export class ReviewApplicationUseCase {
  constructor(
    private readonly repository: ApplicationsRepository,
    private readonly security: RegistrationSecurity,
  ) {}

  async execute(actor: ActorContext, id: string, input: ReviewInput) {
    const detail = await this.repository.find(actor, id);
    const code = input.decision === 'APPROVED' ? this.security.code() : null;
    const text = code
      ? 'Tu solicitud fue aprobada. Activa tu cuenta con la solicitud ' +
        id +
        ' y el código ' +
        code +
        '. Vence en 24 horas.'
      : 'El dictamen de tu solicitud ' +
        id +
        ' es ' +
        input.decision +
        '.\n' +
        input.category +
        '\n' +
        input.note;
    return this.repository.review(
      actor,
      id,
      input,
      code ? this.security.hash('activation', id + ':' + code) : null,
      this.security.seal({
        to: detail.email,
        subject: 'Dictamen de tu registro en UMSSPIRA',
        text,
      }),
    );
  }
}
