import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';

// Solo para desarrollo local con ENABLE_MENTOR_TEST_AUTH=true; nunca habilitar en producción.
const LOCAL_MENTOR_TEST_TOKEN = 'umsspira-local-mentor-test-only';
export const LOCAL_MENTOR_TEST_USER_ID = '00000000-0000-4000-8000-000000000006';

type MentorRequest = Request & { user?: { id?: string } };

@Injectable()
export class MentorTestAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<MentorRequest>();
    const authorization = request.headers.authorization;
    const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : null;

    if (process.env.NODE_ENV !== 'production'
      && process.env.ENABLE_MENTOR_TEST_AUTH === 'true'
      && token === LOCAL_MENTOR_TEST_TOKEN) {
      request.user = { id: LOCAL_MENTOR_TEST_USER_ID };
      return true;
    }

    if (request.user?.id) return true;
    throw new UnauthorizedException('Usuario no autenticado');
  }
}
