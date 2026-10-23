import type { MentorRepository } from '../ports/mentor-repository.port';

export class ListMentorProfilesUseCase {
  constructor(private readonly repository: MentorRepository) {}
  async execute() {
    return this.repository.directory();
  }
}
