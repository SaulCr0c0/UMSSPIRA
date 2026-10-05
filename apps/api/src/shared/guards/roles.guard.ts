// apps/api/src/shared/guards/roles.guard.ts
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '@/shared/decorators/roles.decorator';
import { ForbiddenError } from '@/shared/errors';
import type { RequestWithUser } from './auth.guard';
import type { UserRole } from '@umsspira/shared-types';

/**
 * Compara el rol de request.user (puesto ahí por AuthGuard) contra los
 * roles declarados con @Roles(...) en el endpoint o el controller.
 *
 * Debe usarse SIEMPRE después de AuthGuard:
 *   @UseGuards(AuthGuard, RolesGuard)
 *
 * Si el endpoint no tiene @Roles(), deja pasar a cualquier usuario
 * autenticado (solo exige que AuthGuard haya validado el token).
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[] | undefined>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const userRole = request.user?.role;

    if (!userRole || !requiredRoles.includes(userRole)) {
      throw new ForbiddenError();
    }

    return true;
  }
}