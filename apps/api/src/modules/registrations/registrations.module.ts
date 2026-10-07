import { Module } from '@nestjs/common';
import { RegistrationsController } from './controllers/registrations.controller';
import { RegistrationsService } from './services/registrations.service';
import { RegistrationsRepository } from './repositories/registrations.repository';

@Module({
  controllers: [RegistrationsController],
  providers: [RegistrationsService, RegistrationsRepository],
  exports: [RegistrationsService, RegistrationsRepository],
})
export class RegistrationsModule {}