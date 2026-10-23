import type { MentorRepository } from '../ports/mentor-repository.port';
import { BusinessRuleError } from '../../../../shared/errors/business-rule-error';

export class GetMentorDetailUseCase {
  constructor(private readonly repository: MentorRepository) {}
  async execute(mentorId: string) {
    const detail = await this.repository.detail(mentorId);
    if (!detail) {
      throw new BusinessRuleError(
        'missing',
        'MENTOR_NOT_FOUND',
        'Este perfil no está disponible',
      );
    }
    return detail;
  }
}
