import { IsEmail, IsIn, IsInt, IsOptional, IsString, Matches, Max, MaxLength, Min } from 'class-validator';

export const EXPEDITION_DEPARTMENTS = ['LP', 'CB', 'SC', 'OR', 'PT', 'TJ', 'CH', 'BE', 'PD', 'EX'] as const;

export class CreateRegistrationDataDto {
  @IsString()
  @Matches(/^[A-Za-zÁÉÍÓÚÑáéíóúñ' -]{2,45}$/)
  nombres!: string;

  @IsString()
  @Matches(/^[A-Za-zÁÉÍÓÚÑáéíóúñ' -]{2,45}$/)
  apellidos!: string;

  @IsString()
  @Matches(/^\d{5,10}$/)
  ci!: string;

  @IsOptional()
  @IsString()
  @Matches(/^[A-Za-z0-9]{0,2}$/)
  complementoCi?: string;

  @IsIn(EXPEDITION_DEPARTMENTS)
  expedidoEn!: (typeof EXPEDITION_DEPARTMENTS)[number];

  @IsEmail()
  @MaxLength(100)
  correo!: string;

  @IsString()
  @Matches(/^\d{8}$/)
  telefono!: string;

  @IsString()
  carreraId!: string;

  @IsInt()
  @Min(1970)
  @Max(new Date().getFullYear())
  anioEgreso!: number;

  @IsString()
  @Matches(/^\d{6,9}$/)
  codigoSis!: string;
}