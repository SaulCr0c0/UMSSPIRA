// apps/api/src/shared/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
import type { UserRole } from '@umsspira/shared-types';

export const ROLES_KEY = 'roles';

/**
 * Marca un endpoint (o un controller completo) con los roles permitidos.
 * Debe usarse junto con AuthGuard y RolesGuard:
 *
 *   @UseGuards(AuthGuard, RolesGuard)
 *   @Roles('administrador')
 *   @Get('solo-admins')
 *   algo() { ... }
 *
 * Si un endpoint no lleva @Roles(), RolesGuard lo deja pasar sin
 * restricción de rol (pero AuthGuard igual exige un token válido).
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);