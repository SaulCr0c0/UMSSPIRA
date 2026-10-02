import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CompaniesService } from './companies.service';
import { HeaderResponseDto } from './dto/header-response.dto';

@Controller('api/empresa/perfil')
@UseGuards(JwtAuthGuard)
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get('header')
  async getHeader(
    @CurrentUser('empresaId') empresaId: string,
  ): Promise<HeaderResponseDto> {
    return this.companiesService.getHeader(empresaId);
  }
}