import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import type {
  EventItem,
  EventStatus,
} from '@umsspira/shared-types';
import type { SupabaseClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

import { supabase } from '../../shared/lib/supabase';
import {
  CreateEventDto,
  MAX_EVENT_CAPACITY,
} from './dto/create-event.dto';
import { UpdateDraftEventDto } from './dto/update-draft-event.dto';
import type { EventCoverFile } from './event-cover-file';
import {
  EVENT_DATE_MAX_YEAR,
  EVENT_DATE_MIN_YEAR,
  EVENT_LOCATION_MAX_LENGTH,
  EVENT_TITLE_HAS_LETTER_PATTERN,
  EVENT_TITLE_MAX_LENGTH,
  isEventDateTimeWithinRange,
} from './event-constraints';

const DRAFT_EVENT_STATUS: Extract<EventStatus, 'BORRADOR'> =
  'BORRADOR';
const PUBLISHED_EVENT_STATUS: Extract<EventStatus, 'PUBLICADO'> =
  'PUBLICADO';

type EventRow = {
  id: string;
  id_usuario: string;
  titulo: string;
  descripcion: string | null;
  fecha_inicio: string;
  fecha_fin: string;
  cupo_maximo: number;
  ubicacion: string | null;
  imagen_url: string | null;
  estado: string;
  fecha_creacion: string;
};

@Injectable()
export class EventsService {
  async uploadEventCover(
    file: EventCoverFile,
    userId: string,
    authenticatedSupabase: SupabaseClient,
  ): Promise<string> {
    const allowedTypes: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
    };
    const extension = allowedTypes[file.mimetype];
    if (!extension || file.size > 5 * 1024 * 1024) {
      throw new BadRequestException(
        'La portada debe ser JPG, PNG o WebP y no superar los 5 MB.',
      );
    }

    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '-');
    const objectPath = `${userId}/${randomUUID()}-${safeName || `portada.${extension}`}`;
    const { data, error } = await authenticatedSupabase.storage
      .from('event-covers')
      .upload(objectPath, file.buffer, {
        contentType: file.mimetype,
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      throw new InternalServerErrorException(
        `No se pudo guardar la portada: ${error.message}`,
      );
    }

    return authenticatedSupabase.storage
      .from('event-covers')
      .getPublicUrl(data.path).data.publicUrl;
  }

  async removeEventCover(
    imageUrl: string,
    userId: string,
    authenticatedSupabase: SupabaseClient,
  ): Promise<void> {
    const marker = '/storage/v1/object/public/event-covers/';
    let objectPath: string;
    try {
      objectPath = decodeURIComponent(new URL(imageUrl).pathname.split(marker)[1] ?? '');
    } catch {
      throw new BadRequestException('La URL de portada no es válida.');
    }
    if (!objectPath.startsWith(`${userId}/`)) {
      throw new BadRequestException('La portada no pertenece al administrador autenticado.');
    }

    const { error } = await authenticatedSupabase.storage
      .from('event-covers')
      .remove([objectPath]);
    if (error) {
      throw new InternalServerErrorException('No se pudo limpiar la portada temporal.');
    }
  }

  /**
   * T4
   * Crea un nuevo evento.
   */
  async createEvent(
    createEventDto: CreateEventDto,
    userId: string,
    authenticatedSupabase: SupabaseClient,
  ): Promise<EventItem> {
    const {
      title,
      description,
      startDate,
      endDate,
      maxCapacity,
      location,
      imageUrl,
      status,
    } = createEventDto;

    this.validateEventData(
      title,
      startDate,
      endDate,
      maxCapacity,
      location,
    );
    const normalizedTitle = title.trim();

    // Si no se envía un estado, se crea como BORRADOR.
    const initialStatus: EventStatus =
      status ?? DRAFT_EVENT_STATUS;

    /*
     * En shared-types manejamos:
     * BORRADOR | PUBLICADO | CANCELADO
     *
     * En la base de datos se almacena:
     * borrador | publicado | cancelado
     */
    const databaseStatus = initialStatus.toLowerCase();
    const createdAt = new Date().toISOString();

    const { data, error } = await authenticatedSupabase
      .from('evento')
      .insert([
        {
          id_usuario: userId,
          titulo: normalizedTitle,
          descripcion: description ?? null,
          fecha_inicio: startDate,
          fecha_fin: endDate,
          cupo_maximo: maxCapacity,
          ubicacion: location ?? null,
          imagen_url: imageUrl ?? null,
          estado: databaseStatus,
          fecha_creacion: createdAt,
        },
      ])
      .select()
      .single();

    if (error) {
      throw new InternalServerErrorException(
        'No se pudo guardar el evento. Inténtalo nuevamente.',
      );
    }

    return this.mapEventRow(data);
  }

  async getAdminEvents(
    userId: string,
    authenticatedSupabase: SupabaseClient,
  ): Promise<EventItem[]> {
    const { data, error } = await authenticatedSupabase
      .from('evento')
      .select('*')
      .eq('id_usuario', userId)
      .order('fecha_creacion', {
        ascending: false,
      });

    if (error) {
      throw new InternalServerErrorException(
        `Error al consultar los eventos administrativos: ${error.message}`,
      );
    }

    const { data: creator, error: creatorError } = await authenticatedSupabase
      .from('usuario')
      .select('nombre')
      .eq('usuario_id', userId)
      .maybeSingle();

    if (creatorError) {
      throw new InternalServerErrorException(
        `Error al consultar el nombre del creador de eventos: ${creatorError.message}`,
      );
    }

    return (data ?? []).map((row) =>
      this.mapEventRow(row, creator?.nombre ?? 'Administrador'),
    );
  }

  async getAdminDraft(
    eventId: string,
    userId: string,
    authenticatedSupabase: SupabaseClient,
  ): Promise<EventItem> {
    const event = await this.getOwnedEvent(
      eventId,
      userId,
      authenticatedSupabase,
    );

    this.ensureDraft(event);

    return this.mapEventRow(event);
  }

  async getAdminEvent(
    eventId: string,
    userId: string,
    authenticatedSupabase: SupabaseClient,
  ): Promise<EventItem> {
    const event = await this.getOwnedEvent(
      eventId,
      userId,
      authenticatedSupabase,
    );
    const { data: creator, error: creatorError } = await authenticatedSupabase
      .from('usuario')
      .select('nombre')
      .eq('usuario_id', userId)
      .maybeSingle();

    if (creatorError) {
      throw new InternalServerErrorException(
        `Error al consultar el nombre del creador del evento: ${creatorError.message}`,
      );
    }

    return this.mapEventRow(event, creator?.nombre ?? 'Administrador');
  }

  async updateAdminDraft(
    eventId: string,
    updateEventDto: UpdateDraftEventDto,
    userId: string,
    authenticatedSupabase: SupabaseClient,
  ): Promise<EventItem> {
    const currentEvent = await this.getOwnedEvent(
      eventId,
      userId,
      authenticatedSupabase,
    );

    this.ensureDraft(currentEvent);

    const {
      title,
      description,
      startDate,
      endDate,
      maxCapacity,
      location,
      imageUrl,
    } = updateEventDto;

    this.validateEventData(
      title,
      startDate,
      endDate,
      maxCapacity,
      location,
    );
    const normalizedTitle = title.trim();

    const { data, error } = await authenticatedSupabase
      .from('evento')
      .update({
        titulo: normalizedTitle,
        descripcion: description ?? null,
        fecha_inicio: startDate,
        fecha_fin: endDate,
        cupo_maximo: maxCapacity,
        ubicacion: location ?? null,
        ...(imageUrl ? { imagen_url: imageUrl } : {}),
        estado: DRAFT_EVENT_STATUS.toLowerCase(),
      })
      .eq('id', eventId)
      .eq('id_usuario', userId)
      .ilike('estado', DRAFT_EVENT_STATUS)
      .select()
      .maybeSingle();

    if (error) {
      throw new InternalServerErrorException(
        'No se pudo actualizar el borrador. Inténtalo nuevamente.',
      );
    }

    if (!data) {
      throw new ConflictException(
        'No se pudo actualizar el borrador porque dejó de estar disponible.',
      );
    }

    if (imageUrl && currentEvent.imagen_url && currentEvent.imagen_url !== imageUrl) {
      await this.removeEventCover(currentEvent.imagen_url, userId, authenticatedSupabase)
        .catch(() => undefined);
    }

    return this.mapEventRow(data);
  }

  async publishAdminDraft(
    eventId: string,
    userId: string,
    authenticatedSupabase: SupabaseClient,
  ): Promise<EventItem> {
    const currentEvent = await this.getOwnedEvent(
      eventId,
      userId,
      authenticatedSupabase,
    );

    this.ensureDraft(currentEvent);
    this.validateEventData(
      currentEvent.titulo,
      currentEvent.fecha_inicio,
      currentEvent.fecha_fin,
      currentEvent.cupo_maximo,
      currentEvent.ubicacion,
    );

    const { data, error } = await authenticatedSupabase
      .from('evento')
      .update({
        estado: PUBLISHED_EVENT_STATUS.toLowerCase(),
      })
      .eq('id', eventId)
      .eq('id_usuario', userId)
      .ilike('estado', DRAFT_EVENT_STATUS)
      .select()
      .maybeSingle();

    if (error) {
      throw new InternalServerErrorException(
        `Error al publicar el borrador: ${error.message}`,
      );
    }

    if (!data) {
      throw new ConflictException(
        'No se pudo publicar el borrador porque dejó de estar disponible.',
      );
    }

    return this.mapEventRow(data);
  }

  /**
   * T7
   * Catálogo para el egresado.
   *
   * Devuelve únicamente eventos PUBLICADOS
   * que todavía no han finalizado.
   *
   * Los eventos se ordenan por fecha de inicio
   * de manera ascendente.
   */
  async getCatalog(): Promise<EventItem[]> {
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('evento')
      .select('*')
      .eq(
        'estado',
        PUBLISHED_EVENT_STATUS.toLowerCase(),
      )
      .gt('fecha_fin', now)
      .order('fecha_inicio', {
        ascending: true,
      });

    if (error) {
      throw new InternalServerErrorException(
        `Error al consultar el catálogo de eventos: ${error.message}`,
      );
    }

    return (data ?? [])
      .filter((row) => Number.isInteger(row.cupo_maximo)
        && row.cupo_maximo >= 1
        && row.cupo_maximo <= MAX_EVENT_CAPACITY)
      .map((row) => this.mapEventRow(row));
  }

  async getEventById(eventId: string): Promise<EventItem> {
    const { data, error } = await supabase
      .from('evento')
      .select('*')
      .eq('id', eventId)
      .eq('estado', PUBLISHED_EVENT_STATUS.toLowerCase())
      .maybeSingle();

    if (error) {
      throw new InternalServerErrorException(
        `Error al consultar el evento: ${error.message}`,
      );
    }

    if (
      !data
      || data.estado.toUpperCase() !== PUBLISHED_EVENT_STATUS
      || !Number.isInteger(data.cupo_maximo)
      || data.cupo_maximo < 1
      || data.cupo_maximo > MAX_EVENT_CAPACITY
    ) {
      throw new NotFoundException(
        'No se encontró un evento publicado disponible',
      );
    }

    return this.mapEventRow(data);
  }

  private async getOwnedEvent(
    eventId: string,
    userId: string,
    authenticatedSupabase: SupabaseClient,
  ): Promise<EventRow> {
    const { data, error } = await authenticatedSupabase
      .from('evento')
      .select('*')
      .eq('id', eventId)
      .eq('id_usuario', userId)
      .maybeSingle();

    if (error) {
      throw new InternalServerErrorException(
        `Error al consultar el evento: ${error.message}`,
      );
    }

    if (!data) {
      throw new NotFoundException(
        'No se encontró el evento solicitado para el usuario autenticado',
      );
    }

    return data as EventRow;
  }

  private ensureDraft(event: Pick<EventRow, 'estado'>): void {
    if (event.estado?.trim().toUpperCase() !== DRAFT_EVENT_STATUS) {
      throw new ConflictException(
        'El evento ya no se encuentra en estado BORRADOR',
      );
    }
  }

  private validateEventData(
    title: string,
    startDate: string,
    endDate: string,
    maxCapacity: number,
    location?: string | null,
  ): void {
    if (!title?.trim()) {
      throw new BadRequestException(
        'El título es obligatorio',
      );
    }

    if (!EVENT_TITLE_HAS_LETTER_PATTERN.test(title.trim())) {
      throw new BadRequestException(
        'El título debe contener al menos una letra',
      );
    }

    if (title.trim().length > EVENT_TITLE_MAX_LENGTH) {
      throw new BadRequestException(
        `El título no puede superar los ${EVENT_TITLE_MAX_LENGTH} caracteres`,
      );
    }

    if (
      !isEventDateTimeWithinRange(startDate) ||
      !isEventDateTimeWithinRange(endDate)
    ) {
      throw new BadRequestException(
        `Las fechas deben tener un año de 4 dígitos entre ${EVENT_DATE_MIN_YEAR} y ${EVENT_DATE_MAX_YEAR}`,
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end <= start) {
      throw new BadRequestException(
        'La fecha de finalización debe ser posterior a la fecha de inicio',
      );
    }

    if (
      !Number.isInteger(maxCapacity) ||
      maxCapacity < 1 ||
      maxCapacity > MAX_EVENT_CAPACITY
    ) {
      throw new BadRequestException(
        'El cupo máximo debe ser un número entero entre 1 y 10000',
      );
    }

    if (
      location
      && location.trim().length > EVENT_LOCATION_MAX_LENGTH
    ) {
      throw new BadRequestException(
        `La ubicación no puede superar los ${EVENT_LOCATION_MAX_LENGTH} caracteres`,
      );
    }
  }

  /**
   * Convierte una fila de la tabla "evento"
   * al modelo EventItem utilizado por la API.
   */
  private mapEventRow(row: EventRow, creatorName?: string): EventItem {
    return {
      id: row.id,
      title: row.titulo,
      description: row.descripcion ?? null,
      startDate: row.fecha_inicio,
      endDate: row.fecha_fin,
      maxCapacity: row.cupo_maximo,
      location: row.ubicacion ?? null,
      imageUrl: row.imagen_url ?? null,
      status: row.estado.toUpperCase() as EventStatus,
      createdBy: row.id_usuario,
      ...(creatorName ? { creatorName } : {}),
      createdAt: row.fecha_creacion,
    };
  }
}
