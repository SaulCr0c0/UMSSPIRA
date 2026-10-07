import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Request } from 'express';

import { PerfilRegistrosController } from './perfil-registros.controller';
import { PerfilRepository } from './perfil.repository';
import { Registro } from './perfil.mappers';

describe('PerfilRegistrosController', () => {
  const TITULADO_ID = 'titulado-1';

  let controller: PerfilRegistrosController;
  let repository: jest.Mocked<
    Pick<PerfilRepository, 'obtenerPorId' | 'actualizar' | 'eliminar'>
  >;

  beforeEach(() => {
    process.env.TITULADO_ID_PRUEBA = TITULADO_ID;

    repository = {
      obtenerPorId: jest.fn(),
      actualizar: jest.fn(),
      eliminar: jest.fn(),
    };

    controller = new PerfilRegistrosController(
      repository as unknown as PerfilRepository,
    );
  });

  afterEach(() => {
    delete process.env.TITULADO_ID_PRUEBA;
    jest.clearAllMocks();
  });

  it('devuelve el registro cuando existe y pertenece al titulado actual', async () => {
    const registro: Registro = {
      id: 'certificacion-1',
      idTitulado: TITULADO_ID,
      fechaCreacion: '2026-10-01',
      nombre: 'AWS Cloud Practitioner',
      entidadEmisora: 'Amazon Web Services',
      grado: 'Profesional',
      anioEmision: 2024,
    };

    repository.obtenerPorId.mockResolvedValue(registro);

    const resultado = await controller.obtenerRegistro(
      'certificaciones',
      'certificacion-1',
      {} as Request,
    );

    expect(repository.obtenerPorId).toHaveBeenCalledWith(
      'certificaciones',
      'certificacion-1',
    );

    expect(resultado).toEqual(registro);
  });

  it('responde 404 cuando la sección no existe', async () => {
    await expect(
      controller.obtenerRegistro(
        'seccion-invalida',
        'registro-1',
        {} as Request,
      ),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(repository.obtenerPorId).not.toHaveBeenCalled();
  });

  it('responde 404 cuando el registro no existe', async () => {
    repository.obtenerPorId.mockResolvedValue(null);

    await expect(
      controller.obtenerRegistro(
        'certificaciones',
        'registro-inexistente',
        {} as Request,
      ),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(repository.obtenerPorId).toHaveBeenCalledWith(
      'certificaciones',
      'registro-inexistente',
    );
  });

  it('responde 403 cuando el registro pertenece a otro titulado', async () => {
    const registroAjeno: Registro = {
      id: 'certificacion-2',
      idTitulado: 'otro-titulado',
      fechaCreacion: '2026-10-01',
      nombre: 'Scrum Master',
      entidadEmisora: 'Entidad externa',
      grado: 'Profesional',
      anioEmision: 2025,
    };

    repository.obtenerPorId.mockResolvedValue(registroAjeno);

    await expect(
      controller.obtenerRegistro(
        'certificaciones',
        'certificacion-2',
        {} as Request,
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  describe('PUT /perfil/:seccion/:id', () => {
    const registroPropio: Registro = {
      id: 'experiencia-1',
      idTitulado: TITULADO_ID,
      fechaCreacion: '2026-10-01',
      empresa: 'UMSS',
      cargo: 'Auxiliar',
      fechaInicio: '2024-01-01',
      fechaFin: null,
    };

    it('actualiza el registro existente sin crear otro', async () => {
      const datos = { empresa: 'UMSS', cargo: 'Docente' };
      const actualizado = { ...registroPropio, cargo: 'Docente' };
      repository.obtenerPorId.mockResolvedValue(registroPropio);
      repository.actualizar.mockResolvedValue(actualizado);

      const resultado = await controller.actualizarRegistro(
        'experiencia-laboral',
        'experiencia-1',
        datos,
        {} as Request,
      );

      expect(repository.actualizar).toHaveBeenCalledWith(
        'experiencia-laboral',
        'experiencia-1',
        datos,
      );
      expect(resultado).toEqual(actualizado);
    });

    it('responde 404 cuando el registro no existe', async () => {
      repository.obtenerPorId.mockResolvedValue(null);

      await expect(
        controller.actualizarRegistro(
          'experiencia-laboral',
          'registro-inexistente',
          { cargo: 'Docente' },
          {} as Request,
        ),
      ).rejects.toBeInstanceOf(NotFoundException);

      expect(repository.actualizar).not.toHaveBeenCalled();
    });

    it('responde 404 cuando la sección no existe', async () => {
      await expect(
        controller.actualizarRegistro(
          'seccion-invalida',
          'registro-1',
          { cargo: 'Docente' },
          {} as Request,
        ),
      ).rejects.toBeInstanceOf(NotFoundException);

      expect(repository.actualizar).not.toHaveBeenCalled();
    });

    it('responde 403 cuando el registro pertenece a otro titulado', async () => {
      repository.obtenerPorId.mockResolvedValue({
        ...registroPropio,
        idTitulado: 'otro-titulado',
      });

      await expect(
        controller.actualizarRegistro(
          'experiencia-laboral',
          'experiencia-1',
          { cargo: 'Docente' },
          {} as Request,
        ),
      ).rejects.toBeInstanceOf(ForbiddenException);

      expect(repository.actualizar).not.toHaveBeenCalled();
    });

    it('responde 400 cuando no se envía ningún campo de la sección', async () => {
      repository.obtenerPorId.mockResolvedValue(registroPropio);

      await expect(
        controller.actualizarRegistro(
          'experiencia-laboral',
          'experiencia-1',
          { campoAjeno: 'x' },
          {} as Request,
        ),
      ).rejects.toBeInstanceOf(BadRequestException);

      expect(repository.actualizar).not.toHaveBeenCalled();
    });
  });

  describe('DELETE /perfil/:seccion/:id', () => {
    const registroPropio: Registro = {
      id: 'formacion-1',
      idTitulado: TITULADO_ID,
      fechaCreacion: '2026-10-01',
      institucion: 'UMSS',
      titulo: 'Licenciatura en Informática',
      anioEgreso: 2023,
    };

    it('elimina solo el registro indicado', async () => {
      repository.obtenerPorId.mockResolvedValue(registroPropio);

      await controller.eliminarRegistro(
        'formacion-academica',
        'formacion-1',
        {} as Request,
      );

      expect(repository.eliminar).toHaveBeenCalledTimes(1);
      expect(repository.eliminar).toHaveBeenCalledWith(
        'formacion-academica',
        'formacion-1',
      );
    });

    it('responde 404 cuando el registro no existe', async () => {
      repository.obtenerPorId.mockResolvedValue(null);

      await expect(
        controller.eliminarRegistro(
          'formacion-academica',
          'registro-inexistente',
          {} as Request,
        ),
      ).rejects.toBeInstanceOf(NotFoundException);

      expect(repository.eliminar).not.toHaveBeenCalled();
    });

    it('responde 403 cuando el registro pertenece a otro titulado', async () => {
      repository.obtenerPorId.mockResolvedValue({
        ...registroPropio,
        idTitulado: 'otro-titulado',
      });

      await expect(
        controller.eliminarRegistro(
          'formacion-academica',
          'formacion-1',
          {} as Request,
        ),
      ).rejects.toBeInstanceOf(ForbiddenException);

      expect(repository.eliminar).not.toHaveBeenCalled();
    });
  });
});