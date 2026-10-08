import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../../shared/database/database.service';
import type { ExperienceInput, WorkExperience } from './experience.types';

// Traduce el modelo de la UI al esquema SQL; las consultas parametrizadas
// evitan concatenar datos del formulario dentro de sentencias SQL.
@Injectable()
export class ExperienceRepository {
  constructor(private readonly database: DatabaseService) {}

  // Lista únicamente las experiencias del egresado configurado en el backend.
  async findAll(egresadoId: string): Promise<WorkExperience[]> {
    const result = await this.database.query<WorkExperienceRow>(
      `${selectExperience}
       WHERE id_egresado = $1
       ORDER BY fecha_inicio DESC, fecha_creacion DESC, id DESC`,
      [egresadoId],
    );

    return result.rows.map(mapExperience);
  }

  // Busca por UUID y propietario para impedir que una pantalla lea registros
  // pertenecientes a otro perfil de egresado.
  async findOne(id: string, egresadoId: string): Promise<WorkExperience> {
    const result = await this.database.query<WorkExperienceRow>(
      `${selectExperience}
       WHERE id = $1 AND id_egresado = $2`,
      [id, egresadoId],
    );

    if (!result.rows[0]) {
      throw new NotFoundException('No se encontró la experiencia laboral solicitada.');
    }

    return mapExperience(result.rows[0]);
  }

  // Crea la experiencia y guarda los campos usados por la pantalla detalle y
  // disponibles para futuras HUs de requerimientos laborales/vacantes.
  async create(input: ExperienceInput, egresadoId: string): Promise<WorkExperience> {
    const result = await this.database.query<WorkExperienceRow>(
      `INSERT INTO experiencia_laboral
        (id_egresado, empresa, cargo, fecha_inicio, fecha_fin, tipo_empleo, descripcion)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, empresa, cargo, fecha_inicio, fecha_fin, tipo_empleo, descripcion`,
      [
        egresadoId,
        input.company,
        input.position,
        input.startDate,
        input.currentlyWorking ? null : input.endDate,
        input.employmentType,
        input.description,
      ],
    );

    return mapExperience(result.rows[0]);
  }

  // Actualiza solo la fila que coincide con el UUID y el egresado propietario.
  async update(
    id: string,
    input: ExperienceInput,
    egresadoId: string,
  ): Promise<WorkExperience> {
    const result = await this.database.query<WorkExperienceRow>(
      `UPDATE experiencia_laboral
       SET empresa = $3,
           cargo = $4,
           fecha_inicio = $5,
           fecha_fin = $6,
           tipo_empleo = $7,
           descripcion = $8
       WHERE id = $1 AND id_egresado = $2
       RETURNING id, empresa, cargo, fecha_inicio, fecha_fin, tipo_empleo, descripcion`,
      [
        id,
        egresadoId,
        input.company,
        input.position,
        input.startDate,
        input.currentlyWorking ? null : input.endDate,
        input.employmentType,
        input.description,
      ],
    );

    if (!result.rows[0]) {
      throw new NotFoundException('No se encontró la experiencia laboral solicitada.');
    }

    return mapExperience(result.rows[0]);
  }

  // Elimina solo la experiencia del perfil configurado para este entorno local.
  async remove(id: string, egresadoId: string): Promise<void> {
    const result = await this.database.query(
      'DELETE FROM experiencia_laboral WHERE id = $1 AND id_egresado = $2',
      [id, egresadoId],
    );

    if (result.rowCount === 0) {
      throw new NotFoundException('No se encontró la experiencia laboral solicitada.');
    }
  }
}

// Alias explícitos convierten las columnas PostgreSQL a nombres de la UI.
const selectExperience = `
  SELECT id, empresa, cargo, fecha_inicio, fecha_fin, tipo_empleo, descripcion
  FROM experiencia_laboral`;

// Forma que entrega pg antes de traducirla al contrato camelCase del frontend.
interface WorkExperienceRow {
  id: string;
  empresa: string;
  cargo: string;
  fecha_inicio: string | Date;
  fecha_fin: string | Date | null;
  tipo_empleo: string;
  descripcion: string;
}

// Mantiene estables los nombres y el formato de fechas que consumen las páginas.
function mapExperience(row: WorkExperienceRow): WorkExperience {
  return {
    id: row.id,
    company: row.empresa,
    position: row.cargo,
    startDate: dateOnly(row.fecha_inicio),
    endDate: row.fecha_fin ? dateOnly(row.fecha_fin) : '',
    currentlyWorking: row.fecha_fin === null,
    employmentType: row.tipo_empleo,
    description: row.descripcion,
  };
}

// PostgreSQL puede devolver DATE como texto o Date según el driver/configuración.
function dateOnly(value: string | Date): string {
  return value instanceof Date ? value.toISOString().slice(0, 10) : value.slice(0, 10);
}
