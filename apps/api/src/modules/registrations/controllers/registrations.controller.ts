import { Body, Controller, Get, Post } from '@nestjs/common';
import { RegistrationsService } from '../services/registrations.service';
import { CreateRegistrationDataDto } from '../contracts/dto';

@Controller('registrations')
export class RegistrationsController {
  constructor(private readonly registrationsService: RegistrationsService) {}

  @Get('careers')
  async getCareers() {
    const careers = await this.registrationsService.listCareers();
    return { data: careers };
  }

  @Post('sessions')
  async createSession(@Body() dto: CreateRegistrationDataDto) {
    const result = await this.registrationsService.createRegistrationSession(dto);
    return { data: result };
  }
}