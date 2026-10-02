// apps/api/src/modules/auth/services/auth.service.ts
import { Injectable } from '@nestjs/common';
import { AuthRepository } from '../repositories/auth.repository';
import { UnauthorizedError } from '@/shared/errors';
import type { LoginInput, LoginResponse, UserRole } from '@umsspira/shared-types';

@Injectable()
export class AuthService {
  constructor(private readonly repo: AuthRepository) {}

  async login(input: LoginInput): Promise<LoginResponse> {
    const { data, error } = await this.repo.signInWithPassword(input.email, input.password);

    if (error || !data.session || !data.user) {
      // Mensaje genérico: nunca decimos si falló el correo o la contraseña
      throw new UnauthorizedError();
    }

    const role = data.user.app_metadata?.role as UserRole | undefined;
    if (!role) {
      // Cuenta sin rol asignado en app_metadata: no debería pasar si el sembrado está completo
      throw new UnauthorizedError();
    }

    return {
      accessToken: data.session.access_token,
      role,
    };
  }
}