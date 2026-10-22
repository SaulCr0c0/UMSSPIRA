import type { ActorContext } from '../../../../shared/security/contexts/actor-context';
import type { ApplicationsRepository } from '../ports/applications-repository.port';

export class GetApplicationMetricsUseCase {
  constructor(private readonly repository: ApplicationsRepository) {}

  execute(actor: ActorContext) {
    return this.repository.metrics(actor);
  }
}
