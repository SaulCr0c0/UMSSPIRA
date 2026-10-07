import { IsIn, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator'
import { Transform } from 'class-transformer'

const MODALIDADES = ['PRESENCIAL', 'HIBRIDO', 'REMOTO'] as const

const NIVELES_EXPERIENCIA = ['SIN_EXPERIENCIA', 'JUNIOR', 'SEMI_SENIOR', 'SENIOR'] as const

export class CreateJobPostingDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'El título debe ser texto' })
  @IsNotEmpty({ message: 'El título es obligatorio' })
  @MaxLength(150, {
    message: 'El título no puede superar los 150 caracteres'
  })
  titulo: string

  @IsString({ message: 'La modalidad debe ser texto' })
  @IsNotEmpty({ message: 'La modalidad es obligatoria' })
  @IsIn(MODALIDADES, {
    message: 'La modalidad debe ser PRESENCIAL, HIBRIDO o REMOTO'
  })
  modalidad: 'PRESENCIAL' | 'HIBRIDO' | 'REMOTO'

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'El nivel de experiencia debe ser texto' })
  @IsNotEmpty({ message: 'El nivel de experiencia es obligatorio' })
  @IsIn(NIVELES_EXPERIENCIA, {
    message: 'El nivel de experiencia debe ser SIN_EXPERIENCIA, JUNIOR, SEMI_SENIOR o SENIOR'
  })
  nivelExperiencia: 'SIN_EXPERIENCIA' | 'JUNIOR' | 'SEMI_SENIOR' | 'SENIOR'

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'La descripción técnica debe ser texto' })
  @IsNotEmpty({ message: 'La descripción técnica es obligatoria' })
  @MinLength(50, {
    message: 'La descripción técnica debe tener al menos 50 caracteres'
  })
  descripcionTecnica: string
}
