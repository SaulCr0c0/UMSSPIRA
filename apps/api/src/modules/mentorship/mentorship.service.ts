import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import type { PostgrestError } from '@supabase/supabase-js';
// Cliente compartido del equipo (única línea a ajustar si exporta otro nombre).
import { supabase } from '../../shared/lib/supabase';
import { UpdateParticipationDto } from './dto/update-participation.dto';
import { Mentor } from './mentor.model';

const PG_UNIQUE_VIOLATION = '23505';
const MAX_MENTOR_AREAS = 5;
const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

interface MentorArea {
  id: string;
  nombre: string;
  descripcion: string | null;
}

export interface MentorAreasState {
  areas: MentorArea[];
  selectedIds: string[];
}

export interface ModuleStatus {
  module: string;
  status: 'ok';
  activeMentors: number;
  timestamp: string;
}

@Injectable()
export class MentorshipService {
  /** GET /mentorship/status */
  async getStatus(): Promise<ModuleStatus> {
    const { count, error } = await supabase
      .from('mentor')
      .select('id', { count: 'exact', head: true })
      .eq('esta_activo', true);
    if (error) this.fail(error);

    return {
      module: 'mentorship',
      status: 'ok',
      activeMentors: count ?? 0,
      timestamp: new Date().toISOString(),
    };
  }

  /** GET /mentorship/profiles */
  async getActiveProfiles(): Promise<Mentor[]> {
    const { data, error } = await supabase
      .from('mentor')
      .select('*')
      .eq('esta_activo', true)
      .order('fecha_creacion', { ascending: false });
    if (error) this.fail(error);
    return (data ?? []) as Mentor[];
  }

  /** GET /mentorship/mi-perfil */
  async getMyProfile(userId: string): Promise<Mentor> {
    const profile = await this.findById(userId);
    if (!profile) {
      throw new NotFoundException('El usuario no tiene perfil de mentor');
    }
    return profile;
  }

  async getMyAreas(userId: string): Promise<MentorAreasState> {
    const [{ data: areaRows, error: areasError }, { data: mentorAreaRows, error: mentorAreasError }] =
      await Promise.all([
        supabase
          .from('area')
          .select('id, nombre, descripcion')
          .eq('esta_activo', true)
          .order('nombre', { ascending: true }),
        supabase
          .from('mentor_area')
          .select('id_area')
          .eq('id_mentor', userId),
      ]);
    if (areasError) this.fail(areasError);
    if (mentorAreasError) this.fail(mentorAreasError);

    const areas = new Map<string, MentorArea>();
    const seenAreaNames = new Set<string>();
    for (const row of areaRows ?? []) {
      const key = String(row.nombre).trim().toLocaleLowerCase('es');
      if (key && !seenAreaNames.has(key)) {
        const area = { id: row.id as string, nombre: row.nombre as string, descripcion: row.descripcion as string | null };
        areas.set(area.id, area);
        seenAreaNames.add(key);
      }
    }

    const selectedIds = [...new Set((mentorAreaRows ?? [])
      .map(row => row.id_area as string)
      .filter(id => areas.has(id)))];
    return { areas: [...areas.values()], selectedIds };
  }

  async updateMyAreas(userId: string, body: unknown): Promise<MentorAreasState> {
    if (!body || typeof body !== 'object' || !('areaIds' in body) || !Array.isArray(body.areaIds)) {
      throw new BadRequestException('Debes enviar una lista de áreas.');
    }
    const areaIds: unknown[] = body.areaIds;
    if (areaIds.length > MAX_MENTOR_AREAS) {
      throw new BadRequestException(`Puedes seleccionar hasta ${MAX_MENTOR_AREAS} áreas.`);
    }
    if (areaIds.some(id => typeof id !== 'string' || !UUID_V4.test(id))
      || new Set(areaIds).size !== areaIds.length) {
      throw new BadRequestException('La lista de áreas contiene identificadores inválidos o duplicados.');
    }

    if (areaIds.length > 0) {
      const { count, error } = await supabase
        .from('area')
        .select('id', { count: 'exact', head: true })
        .in('id', areaIds as string[])
        .eq('esta_activo', true);
      if (error) this.fail(error);
      if (count !== areaIds.length) {
        throw new BadRequestException('Solo puedes elegir áreas activas del catálogo.');
      }
    }

    const today = this.today();
    const { error: mentorError } = await supabase
      .from('mentor')
      .upsert({
        id: userId,
        esta_activo: false,
        fecha_creacion: today,
        fecha_actualizacion: today,
      }, { onConflict: 'id', ignoreDuplicates: true });
    if (mentorError) this.fail(mentorError);

    if (areaIds.length > 0) {
      const { error: saveError } = await supabase
        .from('mentor_area')
        .upsert(
          (areaIds as string[]).map(id => ({ id_mentor: userId, id_area: id, fecha_creacion: today })),
          { onConflict: 'id_mentor,id_area', ignoreDuplicates: true },
        );
      if (saveError) this.fail(saveError);

      const { error: removeError } = await supabase
        .from('mentor_area')
        .delete()
        .eq('id_mentor', userId)
        .not('id_area', 'in', `(${(areaIds as string[]).join(',')})`);
      if (removeError) this.fail(removeError);
    } else {
      const { error: removeError } = await supabase
        .from('mentor_area')
        .delete()
        .eq('id_mentor', userId);
      if (removeError) this.fail(removeError);
    }
    return this.getMyAreas(userId);
  }

  /**
   * Regla 6.1.1: ¿es egresado aprobado?
   * Supuesto: la tabla `egresado` solo contiene egresados aprobados y su `id`
   * es el UUID del usuario. Consulta de SOLO LECTURA.
   */
  async isApprovedGraduate(userId: string): Promise<boolean> {
    const { count, error } = await supabase
      .from('egresado')
      .select('id', { count: 'exact', head: true })
      .eq('id', userId);
    if (error) this.fail(error);
    return (count ?? 0) > 0;
  }

  /** POST /mentorship/eligibility */
  async checkEligibility(userId: string): Promise<{ eligible: boolean }> {
    return { eligible: await this.isApprovedGraduate(userId) };
  }

  /** PATCH /mentorship/mi-perfil/participacion (core HU-6.1) */
  async setParticipation(userId: string, dto: UpdateParticipationDto): Promise<Mentor> {
    const existing = await this.findById(userId);
    const today = this.today();

    if (!dto.esta_activo) {
      // 6.1.4: solo cambia estado y fecha, nunca borra.
      if (!existing) {
        throw new NotFoundException('El usuario no tiene perfil de mentor');
      }
      return this.update(userId, { esta_activo: false, fecha_actualizacion: today });
    }

    // 6.1.1: solo egresados aprobados pueden activar.
    if (!(await this.isApprovedGraduate(userId))) {
      throw new ForbiddenException(
        'Solo los egresados aprobados pueden activar su participación como mentores',
      );
    }

    // 6.1.2: activar NO implica aprobación administrativa; solo esta_activo = true.
    if (existing) {
      const changes: Partial<Mentor> = { esta_activo: true, fecha_actualizacion: today };
      if (dto.experiencia !== undefined) changes.experiencia = dto.experiencia;
      if (dto.anios_exp !== undefined) changes.anios_exp = dto.anios_exp;
      return this.update(userId, changes);
    }

    // 6.1.3: PK = UUID del usuario => un solo registro por usuario.
    const { data, error } = await supabase
      .from('mentor')
      .insert({
        id: userId,
        esta_activo: true,
        experiencia: dto.experiencia ?? null,
        anios_exp: dto.anios_exp ?? null,
        fecha_creacion: today,
        fecha_actualizacion: today,
      })
      .select('*')
      .single();

    if (error) {
      // Concurrencia: dos requests creando el mismo registro a la vez.
      if (error.code === PG_UNIQUE_VIOLATION) {
        throw new ConflictException('El usuario ya tiene un registro de mentor');
      }
      this.fail(error);
    }
    return data as Mentor;
  }

  /** PATCH /mentorship/deactivate/:userId */
  async deactivateByAdmin(userId: string): Promise<Mentor> {
    if (!(await this.findById(userId))) {
      throw new NotFoundException('Mentor no encontrado');
    }
    return this.update(userId, { esta_activo: false, fecha_actualizacion: this.today() });
  }

  /** POST /mentorship/profiles/reset (solo desarrollo, NO borra) */
  async resetMyProfile(userId: string): Promise<Mentor> {
    if (process.env.NODE_ENV === 'production') {
      throw new ForbiddenException('Endpoint deshabilitado en producción');
    }
    return this.deactivateByAdmin(userId);
  }

  // ---------- helpers privados ----------

  private async findById(userId: string): Promise<Mentor | null> {
    const { data, error } = await supabase
      .from('mentor')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    if (error) this.fail(error);
    return (data as Mentor | null) ?? null;
  }

  private async update(userId: string, changes: Partial<Mentor>): Promise<Mentor> {
    const { data, error } = await supabase
      .from('mentor')
      .update(changes)
      .eq('id', userId)
      .select('*')
      .single();
    if (error) this.fail(error);
    return data as Mentor;
  }

  private fail(error: PostgrestError): never {
    throw new InternalServerErrorException(error.message);
  }

  private today(): string {
    return new Date().toISOString().slice(0, 10);
  }
}
