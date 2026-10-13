import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Sin token: si DEFAULT_EMPRESA_ID esta definido, usa esa empresa.
 * Con token: se valida normalmente (cuando exista el login real, sigue funcionando).
 * Sin la variable: exige token, como antes.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const empresaId = process.env.DEFAULT_EMPRESA_ID;
    if (empresaId) {
      const request = context.switchToHttp().getRequest();
      if (!request.headers?.authorization) {
        request.user = {
          userId: 'sin-sesion',
          email: '',
          empresaId,
          role: 'EMPRESA',
        };
        return true;
      }
    }
    return super.canActivate(context);
  }
}