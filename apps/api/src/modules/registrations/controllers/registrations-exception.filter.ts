import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';

/**
 * Reemite los errores HTTP del modulo de registro con su cuerpo original
 * ({ statusCode, message, field, errors }).
 * El filtro global de la API resume todo a { error: mensaje }; este filtro,
 * al ser de controlador, se aplica primero y conserva el contrato del modulo
 * (indicar el campo duplicado o invalido en CA-01.3 y CA-01.4).
 */
@Catch(HttpException)
export class RegistrationsExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(RegistrationsExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();
    const body = exception.getResponse();
    const status = exception.getStatus();

    if (status >= 500) {
      this.logger.error(exception.message, exception.stack);
      response.status(status).json({
        statusCode: status,
        message: 'Ocurrió un error interno. Intenta nuevamente más tarde.',
        error: 'Error interno del servidor',
      });
      return;
    }

    if (typeof body === 'object' && body !== null) {
      response.status(status).json(body);
      return;
    }
    response.status(status).json({ statusCode: status, message: String(body) });
  }
}
