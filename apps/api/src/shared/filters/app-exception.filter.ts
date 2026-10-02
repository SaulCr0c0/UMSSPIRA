// apps/api/src/shared/filters/app-exception.filter.ts
import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { AppError } from '../errors';

@Catch()
export class AppExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();

    if (exception instanceof AppError) {
      response.status(exception.statusCode).json({ error: exception.message });
      return;
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse() as any;
      const message = typeof body === 'string' ? body : body?.message ?? 'Error inesperado';
      response.status(status).json({ error: Array.isArray(message) ? message[0] : message });
      return;
    }

    console.error(exception);
    response.status(500).json({ error: 'Error interno del servidor' });
  }
}