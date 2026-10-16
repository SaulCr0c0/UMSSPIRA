import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { CrearFormacionAcademicaDto } from './dto/crear-formacion-academica.dto';
import {
  FormacionComparable,
  MENSAJE_FORMACION_DUPLICADA,
  esFormacionDuplicada,
} from './validators/formacion-duplicada';

export const FORMACION_REPOSITORIO = 'FORMACION_REPOSITORIO';

// Contrato que deberá implementar quien conecte la base de datos (Supabase)
export interface FormacionRepositorio {
  obtenerPorEgresado(idEgresado: string): Promise<FormacionComparable[]>;
  crear(idEgresado: string, datos: CrearFormacionAcademicaDto): Promise<unknown>;
}

@Injectable()
export class FormacionAcademicaService {
  constructor(
    @Inject(FORMACION_REPOSITORIO)
    private readonly repositorio: FormacionRepositorio,
  ) {}

  // T2.5: si Institución + Título + Año de egreso ya existen para este egresado -> 409 Conflict
  async crear(idEgresado: string, datos: CrearFormacionAcademicaDto) {
    const existentes = await this.repositorio.obtenerPorEgresado(idEgresado);

    if (esFormacionDuplicada(datos, existentes)) {
      throw new ConflictException(MENSAJE_FORMACION_DUPLICADA);
    }

    return this.repositorio.crear(idEgresado, datos);
  }
}