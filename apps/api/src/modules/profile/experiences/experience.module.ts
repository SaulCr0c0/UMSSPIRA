import { Module } from '@nestjs/common';
import { ExperienceController } from './experience.controller';
import { ExperienceRepository } from './experience.repository';
import { ExperienceService } from './experience.service';

// Registra el CRUD que conecta las cuatro pantallas de experiencia laboral
// con la base de datos compartida del backend.
@Module({
  controllers: [ExperienceController],
  providers: [ExperienceRepository, ExperienceService],
})
export class ExperienceModule {}
