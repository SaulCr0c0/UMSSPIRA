import type { DirectoryMentor, Mentor } from '../../domain/entities/mentor';
import type { MentorInformationInput, ParticipationInput } from '../contracts/mentor-inputs';

export const MENTOR_REPOSITORY = Symbol('MENTOR_REPOSITORY');

export interface MentorRepository {
  directory(): Promise<DirectoryMentor[]>;
  eligible(userId: string): Promise<boolean>;
  own(userId: string): Promise<Mentor | null>;
  participate(userId: string, input: ParticipationInput): Promise<Mentor>;
  updateInformation(userId: string, input: MentorInformationInput): Promise<Mentor>;
  clearInformation(userId: string): Promise<void>;
  deactivate(mentorId: string, careerIds: readonly string[]): Promise<Mentor>;
}
