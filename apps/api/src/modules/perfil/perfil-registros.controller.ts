import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Put,
  Req,
} from '@nestjs/common';
import { Request } from 'express';

import { Seccion, esSeccion } from './perfil.constants';
import { Registro, datosAColumnas } from './perfil.mappers';
import { PerfilRepository } from './perfil.repository';
import { obtenerTituladoId } from './titulado-actual';

@Controller('perfil')
export class PerfilRegistrosController {
  constructor(private readonly perfilRepository: PerfilRepository) {}

  @Get(':seccion/:id')
  async obtenerRegistro(
    @Param('seccion') seccionParam: string,
    @Param('id') id: string,
    @Req() req: Request,
  ) {
    return this.obtenerRegistroPropio(seccionParam, id, req);
  }

  // T4.2: actualiza el registro existente, sin crear otro
  @Put(':seccion/:id')
  async actualizarRegistro(
    @Param('seccion') seccionParam: string,
    @Param('id') id: string,
    @Body() datos: object,
    @Req() req: Request,
  ) {
    const registro = await this.obtenerRegistroPropio(seccionParam, id, req);
    const seccion = seccionParam as Seccion;

    if (datosAColumnas(seccion, datos ?? {}).columnas.length === 0) {
      throw new BadRequestException('No se enviaron campos para actualizar');
    }

    return this.perfilRepository.actualizar(seccion, registro.id, datos);
  }

  // T4.3: elimina el registro; 404 si no existe
  @Delete(':seccion/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async eliminarRegistro(
    @Param('seccion') seccionParam: string,
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<void> {
    const registro = await this.obtenerRegistroPropio(seccionParam, id, req);
    await this.perfilRepository.eliminar(seccionParam as Seccion, registro.id);
  }

  // 404 si la sección o el registro no existen; 403 si el registro es de otro titulado
  private async obtenerRegistroPropio(
    seccionParam: string,
    id: string,
    req: Request,
  ): Promise<Registro> {
    if (!esSeccion(seccionParam)) {
      throw new NotFoundException('La sección solicitada no existe');
    }

    const registro = await this.perfilRepository.obtenerPorId(
      seccionParam,
      id,
    );

    if (!registro) {
      throw new NotFoundException('El registro no existe');
    }

    const tituladoId = await obtenerTituladoId(req);

    if (registro.idTitulado !== tituladoId) {
      throw new ForbiddenException(
        'No tienes permiso para acceder a este registro',
      );
    }

    return registro;
  }
}
