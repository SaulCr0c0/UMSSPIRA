// apps/api/src/shared/filters/app-exception.filter.ts
import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import { AppError } from '../errors';

@Catch()
export class AppExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(AppExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();

    if (exception instanceof AppError) {
      if (exception.statusCode >= 500) {
        this.logServerError(exception);
        response.status(exception.statusCode).json({
          statusCode: exception.statusCode,
          message: 'Ocurrió un error interno. Intenta nuevamente más tarde.',
          error: 'Error interno del servidor',
        });
        return;
      }
      response.status(exception.statusCode).json({ error: exception.message });
      return;
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      if (status >= 500) {
        this.logServerError(exception);
        response.status(status).json({
          statusCode: status,
          message: 'Ocurrió un error interno. Intenta nuevamente más tarde.',
          error: 'Error interno del servidor',
        });
        return;
      }
      const body = exception.getResponse();
      const message = typeof body === 'string' ? body : (body as { message?: string | string[] }).message ?? 'Error inesperado';
      response.status(status).json({
        ...(typeof body === 'object' ? body : { statusCode: status, message: body }),
        error: Array.isArray(message) ? message[0] : message,
      });
      return;
    }

    this.logServerError(exception);
    response.status(500).json({
      statusCode: 500,
      message: 'Ocurrió un error interno. Intenta nuevamente más tarde.',
      error: 'Error interno del servidor',
    });
  }

  private logServerError(exception: unknown): void {
    if (exception instanceof Error) {
      this.logger.error(exception.message, exception.stack);
    } else {
      this.logger.error('Error interno no reconocido');
    }
  }
}
