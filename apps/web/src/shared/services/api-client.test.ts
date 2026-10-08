import { ApiError, MENSAJE_SIN_CONEXION, apiPost } from './api-client';

// jsdom no trae fetch: se simula con la parte de Response que usa el cliente
function respuesta(status: number, cuerpo?: unknown) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: cuerpo === undefined ? () => Promise.reject(new SyntaxError('sin JSON')) : () => Promise.resolve(cuerpo),
  };
}

const fetchMock = jest.fn();

beforeEach(() => {
  fetchMock.mockReset();
  global.fetch = fetchMock as unknown as typeof fetch;
  delete process.env.NEXT_PUBLIC_API_URL;
});

async function errorDe(promesa: Promise<unknown>): Promise<ApiError> {
  try {
    await promesa;
  } catch (error) {
    return error as ApiError;
  }
  throw new Error('Se esperaba un error');
}

describe('apiPost', () => {
  it('201: envia JSON a /api/v1 del servidor por defecto y devuelve el cuerpo', async () => {
    fetchMock.mockResolvedValue(respuesta(201, { id: 'abc' }));

    await expect(apiPost('/perfil/formacion-academica', { titulo: 'X' })).resolves.toEqual({ id: 'abc' });

    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3000/api/v1/perfil/formacion-academica', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titulo: 'X' }),
    });
  });

  it('usa NEXT_PUBLIC_API_URL sin duplicar la barra final', async () => {
    process.env.NEXT_PUBLIC_API_URL = 'https://api.umsspira.test/';
    fetchMock.mockResolvedValue(respuesta(201, {}));

    await apiPost('/perfil/formacion-academica', {});

    expect(fetchMock.mock.calls[0][0]).toBe('https://api.umsspira.test/api/v1/perfil/formacion-academica');
  });

  it('400: lee la lista de mensajes del ValidationPipe', async () => {
    fetchMock.mockResolvedValue(
      respuesta(400, {
        statusCode: 400,
        message: ['La institución es obligatoria', 'El año de egreso debe tener 4 dígitos'],
        error: 'Bad Request',
      }),
    );

    const error = await errorDe(apiPost('/perfil/formacion-academica', {}));

    expect(error).toBeInstanceOf(ApiError);
    expect(error.statusCode).toBe(400);
    expect(error.mensajes).toEqual(['La institución es obligatoria', 'El año de egreso debe tener 4 dígitos']);
  });

  it('409: lee el mensaje de texto de NestJS', async () => {
    fetchMock.mockResolvedValue(
      respuesta(409, {
        statusCode: 409,
        message: 'La formación académica ya se encuentra registrada.',
        error: 'Conflict',
      }),
    );

    const error = await errorDe(apiPost('/perfil/formacion-academica', {}));

    expect(error.statusCode).toBe(409);
    expect(error.message).toBe('La formación académica ya se encuentra registrada.');
  });

  it('usa el código HTTP si la respuesta de error no es JSON', async () => {
    fetchMock.mockResolvedValue(respuesta(502));

    const error = await errorDe(apiPost('/perfil/formacion-academica', {}));

    expect(error.statusCode).toBe(502);
    expect(error.message).toBe('Error 502 al comunicarse con el servidor.');
  });

  it('sin conexion: lanza un ApiError con codigo 0', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));

    const error = await errorDe(apiPost('/perfil/formacion-academica', {}));

    expect(error.statusCode).toBe(0);
    expect(error.message).toBe(MENSAJE_SIN_CONEXION);
  });
});
