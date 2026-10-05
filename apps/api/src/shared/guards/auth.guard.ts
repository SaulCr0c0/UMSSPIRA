// apps/api/src/shared/guards/auth.guard.ts
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { supabase } from '@/shared/lib/supabase';
import { UnauthorizedError } from '@/shared/errors';
import type { UserRole } from '@umsspira/shared-types';

export type AuthenticatedUser = {
  id: string;
  email: string;
  role: UserRole;
};

export interface RequestWithUser extends Request {
  user: AuthenticatedUser;
}

/**
 * Valida el Bearer token contra Supabase Auth y adjunta el usuario
 * autenticado (con su rol) a la request, en request.user.
 *
 * No decide permisos por rol — eso es trabajo de RolesGuard, que corre
 * después y asume que AuthGuard ya dejó request.user listo.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractBearerToken(request);

    if (!token) {
      throw new UnauthorizedError('No se encontró un token de autenticación');
    }

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      throw new UnauthorizedError('Token inválido o expirado');
    }

    const role = data.user.app_metadata?.role as UserRole | undefined;
    if (!role) {
      throw new UnauthorizedError('El usuario no tiene un rol asignado');
    }

    (request as RequestWithUser).user = {
      id: data.user.id,
      email: data.user.email ?? '',
      role,
    };

    return true;
  }

  private extractBearerToken(request: Request): string | null {
    const header = request.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return null;
    }
    return header.slice('Bearer '.length).trim() || null;
  }
}