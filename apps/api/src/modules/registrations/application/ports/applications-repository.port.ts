import type { ActorContext } from '../../../../shared/security/contexts/actor-context';
import type { ApplicationQuery, ReviewInput } from '../contracts/registration-inputs';
import type {
  ApplicationDetail,
  ApplicationPage,
  ReviewResult,
} from '../../domain/entities/application';
import type { RegistrationFile } from '../../domain/entities/registration';

export const APPLICATIONS_REPOSITORY = Symbol('APPLICATIONS_REPOSITORY');

export interface ApplicationsRepository {
  renewActivation(
    actor: ActorContext,
    id: string,
    hash: string,
    encryptedMail: string,
  ): Promise<void>;
  list(actor: ActorContext, query: ApplicationQuery): Promise<ApplicationPage>;
  find(actor: ActorContext, id: string): Promise<ApplicationDetail>;
  document(actor: ActorContext, id: string): Promise<RegistrationFile>;
  review(
    actor: ActorContext,
    id: string,
    input: ReviewInput,
    activationHash: string | null,
    encryptedMail: string,
  ): Promise<ReviewResult>;
  activate(id: string, codeHash: string, passwordHash: string): Promise<string>;
}
