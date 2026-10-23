import type { DirectoryMentor, Mentor } from '../../domain/entities/mentor';
import type { MentorInformationInput, ParticipationInput } from '../contracts/mentor-inputs';
import type {
  MentorDirectoryFilters,
  MentorFilterOptions,
} from '../contracts/mentor-directory-filters';

export const MENTOR_REPOSITORY = Symbol('MENTOR_REPOSITORY');

export interface MentorRepository {
  directory(): Promise<DirectoryMentor[]>;
  filteredDirectory(filters: MentorDirectoryFilters): Promise<DirectoryMentor[]>;
  filterOptions(areaIds: string[]): Promise<MentorFilterOptions>;
  eligible(userId: string): Promise<boolean>;
  own(userId: string): Promise<Mentor | null>;
  participate(userId: string, input: ParticipationInput): Promise<Mentor>;
  updateInformation(userId: string, input: MentorInformationInput): Promise<Mentor>;
  clearInformation(userId: string): Promise<void>;
  deactivate(mentorId: string, careerIds: readonly string[]): Promise<Mentor>;
}
