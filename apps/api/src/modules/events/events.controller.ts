import {
  Body,
  BadRequestException,
  Delete,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateDraftEventDto } from './dto/update-draft-event.dto';
import type { EventCoverFile } from './event-cover-file';
import type { AuthenticatedUser } from '@umsspira/shared-types';
import { AuthGuard, CurrentUser, Roles, RolesGuard } from '../../shared/guards';
import { supabase } from '../../shared/lib/supabase';

@Controller('api/events')
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
  ) {}

  @Post('admin/cover')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('administrador')
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_request, file, callback) => {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
        callback(new BadRequestException('Formato no admitido. Solo se permiten imágenes JPG, PNG o WebP.'), false);
        return;
      }
      callback(null, true);
    },
  }))
  async uploadEventCover(
    @UploadedFile() file: EventCoverFile | undefined,
    @CurrentUser() admin: AuthenticatedUser,
  ) {
    if (!file) {
      throw new BadRequestException('Selecciona una portada de hasta 5 MB.');
    }
    const imageUrl = await this.eventsService.uploadEventCover(
      file,
      admin.id,
      supabase,
    );
    return { imageUrl };
  }

  @Delete('admin/cover')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('administrador')
  async removeEventCover(
    @Query('imageUrl') imageUrl: string,
    @CurrentUser() admin: AuthenticatedUser,
  ) {
    await this.eventsService.removeEventCover(
      imageUrl,
      admin.id,
      supabase,
    );
    return { removed: true };
  }

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('administrador')
  async createEvent(
    @Body() createEventDto: CreateEventDto,
    @CurrentUser() admin: AuthenticatedUser,
  ) {
    return this.eventsService.createEvent(
      createEventDto,
      admin.id,
      supabase,
    );
  }

  @Get('catalog')
  async getCatalog() {
    return this.eventsService.getCatalog();
  }

  @Get('admin')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('administrador')
  async getAdminEvents(@CurrentUser() admin: AuthenticatedUser) {
    return this.eventsService.getAdminEvents(admin.id, supabase);
  }

  @Get('admin/event/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('administrador')
  async getAdminEvent(
    @Param('id') eventId: string,
    @CurrentUser() admin: AuthenticatedUser,
  ) {
    return this.eventsService.getAdminEvent(
      eventId,
      admin.id,
      supabase,
    );
  }

  @Get('admin/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('administrador')
  async getAdminDraft(
    @Param('id') eventId: string,
    @CurrentUser() admin: AuthenticatedUser,
  ) {
    return this.eventsService.getAdminDraft(
      eventId,
      admin.id,
      supabase,
    );
  }

  @Get(':id')
  async getEventById(
    @Param('id', new ParseUUIDPipe()) eventId: string,
  ) {
    return this.eventsService.getEventById(eventId);
  }

  @Patch('admin/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('administrador')
  async updateAdminDraft(
    @Param('id') eventId: string,
    @Body() updateEventDto: UpdateDraftEventDto,
    @CurrentUser() admin: AuthenticatedUser,
  ) {
    return this.eventsService.updateAdminDraft(
      eventId,
      updateEventDto,
      admin.id,
      supabase,
    );
  }

  @Patch('admin/:id/publish')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('administrador')
  async publishAdminDraft(
    @Param('id') eventId: string,
    @CurrentUser() admin: AuthenticatedUser,
  ) {
    return this.eventsService.publishAdminDraft(
      eventId,
      admin.id,
      supabase,
    );
  }
}
