import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { DatabaseService } from '../../../shared/database/database.service';
import type { ExperienceInput, WorkExperience } from './experience.types';
import { ExperienceRepository } from './experience.repository';

// Aplica el alcance de dueño de datos del perfil local antes de cada operación;
// las experiencias persistidas quedan disponibles para futuras HUs de vacantes.
@Injectable()
export class ExperienceService {
  constructor(
    private readonly database: DatabaseService,
    private readonly repository: ExperienceRepository,
  ) {}

  // Entrega la colección ordenada que muestra /profile/experience.
  async findAll(): Promise<WorkExperience[]> {
    return this.repository.findAll(await this.getProfileId());
  }

  // Entrega el registro solicitado por las pantallas de detalle y edición.
  async findOne(id: string): Promise<WorkExperience> {
    return this.repository.findOne(id, await this.getProfileId());
  }

  // Guarda una nueva experiencia creada por el formulario /new.
  async create(input: ExperienceInput): Promise<WorkExperience> {
    return this.repository.create(input, await this.getProfileId());
  }

  // Persiste los cambios enviados desde la pantalla /[id]/edit.
  async update(id: string, input: ExperienceInput): Promise<WorkExperience> {
    return this.repository.update(id, input, await this.getProfileId());
  }

  // Borra el registro confirmado desde el modal de la lista.
  async remove(id: string): Promise<void> {
    await this.repository.remove(id, await this.getProfileId());
  }

  // En esta HU el login aún no entrega el UUID del perfil: se usa una sola
  // identidad local configurada por servidor y nunca se acepta del navegador.
  private async getProfileId(): Promise<string> {
    const id = process.env.PROFILE_EGRESADO_ID;
    if (!id || !isUuid(id)) {
      throw new ServiceUnavailableException(
        'Configura PROFILE_EGRESADO_ID con el UUID de un egresado existente para habilitar el perfil local.',
      );
    }

    const result = await this.database.query<{ id: string }>(
      'SELECT id FROM egresado WHERE id = $1',
      [id],
    );
    if (!result.rows[0]) {
      throw new ServiceUnavailableException(
        'PROFILE_EGRESADO_ID no corresponde a un egresado existente en PostgreSQL.',
      );
    }

    return id;
  }
}

// Valida el identificador configurado antes de utilizarlo en consultas SQL.
function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}
