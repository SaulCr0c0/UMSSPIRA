import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
} from '@nestjs/common';
import { parseExperienceInput } from './experience.dto';
import { ExperienceService } from './experience.service';

// Estos endpoints conectan listado, detalle, alta, edición y eliminación de
// /profile/experience con PostgreSQL y la entidad experiencia_laboral.
@Controller('api/profile/experiences')
export class ExperienceController {
  constructor(private readonly experienceService: ExperienceService) {}

  // Devuelve el listado del perfil que está configurado para este backend local.
  @Get()
  findAll() {
    return this.experienceService.findAll();
  }

  // Devuelve el registro que consumen las páginas de detalle y edición.
  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.experienceService.findOne(id);
  }

  // Valida y registra una nueva experiencia enviada por el formulario.
  @Post()
  create(@Body() body: unknown) {
    return this.experienceService.create(parseExperienceInput(body));
  }

  // Valida y reemplaza los campos editables de una experiencia existente.
  @Put(':id')
  update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() body: unknown,
  ) {
    return this.experienceService.update(id, parseExperienceInput(body));
  }

  // Responde 204 para confirmar que la experiencia se eliminó correctamente.
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.experienceService.remove(id);
  }
}
