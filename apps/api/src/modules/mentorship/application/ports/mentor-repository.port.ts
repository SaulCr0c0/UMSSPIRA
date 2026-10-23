import type { DirectoryPage, Mentor, MentorDetail } from '../../domain/entities/mentor';
import type { MentorInformationInput, ParticipationInput } from '../contracts/mentor-inputs';

export interface MentorDirectoryQuery {
  offset: number;
  limit?: number;
}

export const MENTOR_REPOSITORY = Symbol('MENTOR_REPOSITORY');

export interface MentorRepository {
  directory(query?: MentorDirectoryQuery): Promise<DirectoryPage>;
  /** `from` y `to` (YYYY-MM-DD, inclusive) acotan las reservas que ocupan horarios. */
  detail(mentorId: string, from: string, to: string): Promise<MentorDetail | null>;
  eligible(userId: string): Promise<boolean>;
  own(userId: string): Promise<Mentor | null>;
  participate(userId: string, input: ParticipationInput): Promise<Mentor>;
  updateInformation(userId: string, input: MentorInformationInput): Promise<Mentor>;
  clearInformation(userId: string): Promise<void>;
  deactivate(mentorId: string, careerIds: readonly string[]): Promise<Mentor>;
}
