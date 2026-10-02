// apps/api/src/modules/auth/contracts/dto/login.dto.ts
import { IsEmail, IsString, MinLength } from 'class-validator';
import type { LoginInput } from '@umsspira/shared-types';

export class LoginDto implements LoginInput {
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  email!: string;

  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password!: string;
}