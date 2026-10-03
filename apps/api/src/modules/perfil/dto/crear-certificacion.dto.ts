import { Transform } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString, MaxLength, Min } from 'class-validator';
import { CrearCertificacionDto as CrearCertificacionContrato } from '@umsspira/shared-types';
import { AnioNoFuturo } from '../validators/anio-no-futuro.validator';

const recortar = ({ value }) => (typeof value === 'string' ? value.trim() : value);

export class CrearCertificacionDto implements CrearCertificacionContrato {
  @Transform(recortar)
  @IsString({ message: 'El nombre de la certificación debe ser texto' })
  @IsNotEmpty({ message: 'El nombre de la certificación es obligatorio' })
  @MaxLength(150, { message: 'El nombre de la certificación no puede superar los 150 caracteres' })
  nombre: string;

  @Transform(recortar)
  @IsString({ message: 'La entidad emisora debe ser texto' })
  @IsNotEmpty({ message: 'La entidad emisora es obligatoria' })
  @MaxLength(150, { message: 'La entidad emisora no puede superar los 150 caracteres' })
  entidadEmisora: string;

  @Transform(recortar)
  @IsString({ message: 'El grado debe ser texto' })
  @IsNotEmpty({ message: 'El grado es obligatorio' })
  @MaxLength(50, { message: 'El grado no puede superar los 50 caracteres' })
  grado: string;

  @IsNotEmpty({ message: 'El año de emisión es obligatorio' })
  @IsInt({ message: 'El año de emisión debe ser un número entero' })
  @Min(1000, { message: 'El año de emisión debe tener 4 dígitos' })
  @AnioNoFuturo({ message: 'El año de emisión no puede ser mayor al año actual' })
  anioEmision: number;
}
