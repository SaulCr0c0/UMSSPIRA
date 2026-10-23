import {
  getMentorDetail,
  MentorNotFoundError,
} from './mentor-detail-api';
import { setAccessToken, clearAccessToken, SessionError } from '@/shared/services/auth-session';

const fetchMock = jest.fn();
const originalFetch = global.fetch;
const originalEnv = process.env.NEXT_PUBLIC_MOCK_MENTOR_DETAIL;

beforeEach(() => {
  jest.resetAllMocks();
  global.fetch = fetchMock;
  setAccessToken('test-token');
  delete process.env.NEXT_PUBLIC_MOCK_MENTOR_DETAIL;
});

afterEach(() => {
  clearAccessToken();
  if (originalEnv !== undefined) {
    process.env.NEXT_PUBLIC_MOCK_MENTOR_DETAIL = originalEnv;
  } else {
    delete process.env.NEXT_PUBLIC_MOCK_MENTOR_DETAIL;
  }
});

afterAll(() => {
  global.fetch = originalFetch;
});

describe('getMentorDetail - API Real', () => {
  const backendMentorPayload = {
    id: 'carlos-vargas',
    fullName: 'Carlos Vargas',
    photoUrl: 'https://example.com/carlos.jpg',
    jobTitle: 'Arquitecto de Software',
    company: 'Jalasoft',
    summary: 'Diseño plataformas distribuidas',
    about: 'Ingeniero de Sistemas con 12 años de experiencia.',
    experience: 'Arquitecto de Software en Jalasoft.',
    relevantInfo: 'Disponible para mentorías.',
    technicalAreas: ['Desarrollo de Software'],
    interests: [
      {
        area: 'Desarrollo de Software',
        items: ['Arquitectura limpia'],
      },
    ],
    availability: 'AVAILABLE',
    slots: [
      {
        date: '2026-10-19',
        dayLabel: 'lunes 19 oct',
        times: ['09:00', '11:00'],
      },
    ],
  };

  it('consulta el endpoint centralizado con autorización y retorna los datos públicos', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: backendMentorPayload }),
    });

    const result = await getMentorDetail('carlos-vargas');

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/mentorship/profiles/carlos-vargas',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token',
        }),
      }),
    );
    expect(result.fullName).toBe('Carlos Vargas');
    expect(result.availability).toBe('AVAILABLE');
    expect(result.technicalAreas).toEqual(['Desarrollo de Software']);
  });

  it('NO usa datos falsos o mock si la API real falla con 500', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    await expect(getMentorDetail('carlos-vargas')).rejects.toThrow(
      'Ocurrió un problema al consultar el perfil del mentor. Revisa tu conexión e inténtalo nuevamente.',
    );
  });

  it('lanza MentorNotFoundError cuando la API devuelve 404', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    await expect(getMentorDetail('inexistente')).rejects.toBeInstanceOf(MentorNotFoundError);
  });

  it('lanza SessionError cuando la API devuelve 401', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 401,
    });

    await expect(getMentorDetail('carlos-vargas')).rejects.toBeInstanceOf(SessionError);
  });

  it('ignora el parámetro ?state= cuando se conecta a la API real', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: backendMentorPayload }),
    });

    const result = await getMentorDetail('carlos-vargas', {
      simulatedState: 'error',
    });

    expect(result.fullName).toBe('Carlos Vargas');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe('getMentorDetail - Modo Mock (NEXT_PUBLIC_MOCK_MENTOR_DETAIL="true")', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_MOCK_MENTOR_DETAIL = 'true';
  });

  it('retorna el perfil mock adecuado para Carlos Vargas', async () => {
    const mentor = await getMentorDetail('carlos-vargas');
    expect(mentor.fullName).toBe('Carlos Vargas');
    expect(mentor.availability).toBe('AVAILABLE');
    expect(mentor.slots.length).toBeGreaterThan(0);
  });

  it('retorna el perfil mock adecuado para Luis Fernández (UNAVAILABLE)', async () => {
    const mentor = await getMentorDetail('luis-fernandez');
    expect(mentor.fullName).toBe('Luis Fernández Rojas');
    expect(mentor.availability).toBe('UNAVAILABLE');
    expect(mentor.slots).toHaveLength(0);
  });

  it('retorna el perfil mock adecuado para Rodrigo Salazar (PAUSED)', async () => {
    const mentor = await getMentorDetail('rodrigo-salazar');
    expect(mentor.fullName).toBe('Rodrigo Salazar Torrico');
    expect(mentor.availability).toBe('PAUSED');
  });

  it('retorna el perfil sin información para Gabriela Terrazas', async () => {
    const mentor = await getMentorDetail('gabriela-terrazas');
    expect(mentor.fullName).toBe('Gabriela Terrazas');
    expect(mentor.about).toBeNull();
    expect(mentor.experience).toBeNull();
  });

  it('simula estado notfound con ?state=notfound', async () => {
    await expect(
      getMentorDetail('carlos-vargas', { simulatedState: 'notfound' }),
    ).rejects.toBeInstanceOf(MentorNotFoundError);
  });

  it('simula estado error con ?state=error', async () => {
    await expect(
      getMentorDetail('carlos-vargas', { simulatedState: 'error' }),
    ).rejects.toThrow('Ocurrió un problema al consultar');
  });

  it('simula estado unavailable con ?state=unavailable', async () => {
    const mentor = await getMentorDetail('carlos-vargas', { simulatedState: 'unavailable' });
    expect(mentor.availability).toBe('UNAVAILABLE');
    expect(mentor.slots).toHaveLength(0);
  });

  it('simula estado empty con ?state=empty', async () => {
    const mentor = await getMentorDetail('carlos-vargas', { simulatedState: 'empty' });
    expect(mentor.about).toBeNull();
    expect(mentor.experience).toBeNull();
    expect(mentor.technicalAreas).toHaveLength(0);
    expect(mentor.interests).toHaveLength(0);
  });
});
