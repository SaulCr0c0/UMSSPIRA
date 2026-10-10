// apps/api/src/shared/guards/auth.guard.ts
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import type { AuthenticatedUser } from '@umsspira/shared-types';
import { UnauthorizedError } from '../errors';
import { getSupabase } from '../lib/supabase';
import { isUserRole } from './user-roles';

export type RequestWithUser = {
  headers: Record<string, string | string[] | undefined>;
  user?: AuthenticatedUser;
};

const SESSION_REQUIRED = 'Debes iniciar sesión para continuar';

@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const token = this.extractToken(request);
    if (!token) {
      throw new UnauthorizedError(SESSION_REQUIRED);
    }

    // Supabase valida firma, vigencia y que la cuenta siga existiendo
    const { data, error } = await getSupabase().auth.getUser(token);
    if (error || !data.user) {
      throw new UnauthorizedError(SESSION_REQUIRED);
    }

    const role: unknown = data.user.app_metadata?.role;
    if (!isUserRole(role)) {
      throw new UnauthorizedError(SESSION_REQUIRED);
    }

    request.user = { id: data.user.id, email: data.user.email ?? '', role };
    return true;
  }

  private extractToken(request: RequestWithUser): string | null {
    const header = request.headers.authorization;
    if (typeof header !== 'string') return null;

    const [scheme, token] = header.split(' ');
    return scheme?.toLowerCase() === 'bearer' && token ? token : null;
  }
}