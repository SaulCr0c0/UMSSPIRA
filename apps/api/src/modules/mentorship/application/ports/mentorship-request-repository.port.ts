import type { CreateMentorshipRequestInput } from '../contracts/create-mentorship-request.input';
import type { MentorshipRequest } from '../../domain/entities/mentorship-request';

export const MENTORSHIP_REQUEST_REPOSITORY = Symbol('MENTORSHIP_REQUEST_REPOSITORY');

export interface MentorshipRequestRepository {
  create(
    userId: string,
    input: CreateMentorshipRequestInput,
    now: Date,
  ): Promise<MentorshipRequest>;
}
