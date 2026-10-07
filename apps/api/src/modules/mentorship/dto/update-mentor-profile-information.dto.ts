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
  @IsString()
  @IsNotEmpty()
  @Matches(/\S/)
  @MaxLength(800)
  experiencia!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(80)
  anios_exp?: number;
}
