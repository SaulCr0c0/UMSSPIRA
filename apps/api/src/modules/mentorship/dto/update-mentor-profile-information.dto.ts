import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateMentorProfileInformationDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  descripcion?: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/\S/)
  @MaxLength(800)
  experiencia!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  informacion_relevante?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(7 * 1024 * 1024)
  foto_perfil?: string | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(80)
  anios_exp?: number;
}
