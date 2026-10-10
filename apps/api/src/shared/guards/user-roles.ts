// apps/api/src/shared/guards/user-roles.ts
import type { UserRole } from '@umsspira/shared-types';

export const USER_ROLES: readonly UserRole[] = ['administrador', 'titulado'];

export function isUserRole(value: unknown): value is UserRole {
  return typeof value === 'string' && (USER_ROLES as readonly string[]).includes(value);
}