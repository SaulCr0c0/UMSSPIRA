import { HttpException, Logger } from '@nestjs/common';
import { AppExceptionFilter } from './app-exception.filter';

function createHost() {
  const response = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
  const host = {
    switchToHttp: () => ({ getResponse: () => response }),
  };
  return { host, response };
}

describe('AppExceptionFilter', () => {
  afterEach(() => jest.restoreAllMocks());

  it('oculta detalles de errores 5xx de la respuesta y los conserva en los logs', () => {
    const logError = jest.spyOn(Logger.prototype, 'error').mockImplementation();
    const { host, response } = createHost();
    const exception = new HttpException('detalle de base de datos', 500);

    new AppExceptionFilter().catch(exception, host as never);

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith({
      statusCode: 500,
      message: 'Ocurrió un error interno. Intenta nuevamente más tarde.',
      error: 'Error interno del servidor',
    });
    expect(logError).toHaveBeenCalledWith(exception.message, exception.stack);
  });

  it('conserva los mensajes de errores 4xx para validación y permisos', () => {
    const { host, response } = createHost();

    new AppExceptionFilter().catch(new HttpException('Datos inválidos', 422), host as never);

    expect(response.status).toHaveBeenCalledWith(422);
    expect(response.json).toHaveBeenCalledWith({
      statusCode: 422,
      message: 'Datos inválidos',
      error: 'Datos inválidos',
    });
  });
});
