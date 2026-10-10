import { apiClient, ApiException } from './api-client';

describe('compatibilidad del cliente HTTP entre eventos y afinidad', () => {
  const originalFetch = global.fetch;
  const fetchMock = jest.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('conserva la llamada de eventos, los encabezados y la serialización del cuerpo', async () => {
    fetchMock.mockResolvedValue({ ok: true, text: async () => '{"id":"evento-1"}' });

    await expect(apiClient('/api/events', {
      method: 'POST', headers: { 'x-user-id': 'usuario-1' }, body: { titulo: 'Encuentro' },
    })).resolves.toEqual({ id: 'evento-1' });

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toEqual(expect.stringContaining('/api/events'));
    expect(options.body).toBe('{"titulo":"Encuentro"}');
    expect(options.headers.get('x-user-id')).toBe('usuario-1');
    expect(options.headers.get('Content-Type')).toBe('application/json');
  });

  it('conserva get y post usados por afinidad', async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ porcentaje: 80 }) });

    await expect(apiClient.get('/api/affinity/vector')).resolves.toEqual({ porcentaje: 80 });
    await expect(apiClient.post('/api/affinity/calculate', {})).resolves.toEqual({ porcentaje: 80 });
    expect(fetchMock.mock.calls[1][1]).toMatchObject({ method: 'POST', body: '{}' });
  });

  it('conserva el estado HTTP en los errores de los métodos de afinidad', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 404 });
    await expect(apiClient.get('/api/affinity/vector')).rejects.toBeInstanceOf(ApiException);
    await expect(apiClient.get('/api/affinity/vector')).rejects.toMatchObject({ status: 404 });
  });

  it('conserva los mensajes de validación del backend de eventos', async () => {
    fetchMock.mockResolvedValue({
      ok: false, status: 400, text: async () => '{"message":["Falta el título","Falta la fecha"]}',
    });
    await expect(apiClient('/api/events')).rejects.toThrow('Falta el título Falta la fecha');
  });
});
