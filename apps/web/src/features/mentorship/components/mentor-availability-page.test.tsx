import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { clearAccessToken } from '@/shared/services/auth-session';
import { clearSession, saveSession } from '@/modules/auth/frontend/services/session';
import { MentorAvailabilityPage } from './mentor-availability-page';

jest.mock('next/navigation', () => ({ useRouter: () => ({ replace: jest.fn(), push: jest.fn() }) }));

const originalFetch = global.fetch;
const fetchMock = jest.fn();

beforeEach(() => {
  clearAccessToken();
  clearSession();
  fetchMock.mockReset();
  global.fetch = fetchMock;
});

afterEach(() => {
  clearAccessToken();
  clearSession();
  global.fetch = originalFetch;
});

it('carga al entrar directamente con la sesión del login y sin copia en sessionStorage', async () => {
  saveSession('login-token', 'titulado', true);
  fetchMock.mockResolvedValue({ ok: true, json: async () => ({ availabilityStatus: 'AVAILABLE', fecha_actualizacion: null }) });
  render(<MentorAvailabilityPage />);
  expect(await screen.findByText('Mentor disponible')).toBeInTheDocument();
  expect(fetchMock).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
    headers: expect.objectContaining({ Authorization: 'Bearer login-token' }),
  }));
  expect(screen.queryByRole('link', { name: 'Iniciar sesión' })).not.toBeInTheDocument();
});

it('sin sesión solicita login sin enviar peticiones', async () => {
  render(<MentorAvailabilityPage />);
  expect(await screen.findByRole('link', { name: 'Iniciar sesión' })).toHaveAttribute('href', '/login');
  expect(fetchMock).not.toHaveBeenCalled();
  expect(screen.queryByRole('button', { name: 'Reintentar' })).not.toBeInTheDocument();
});

it('ante un 401 solicita login sin reintentar el token rechazado', async () => {
  saveSession('rejected-token', 'titulado', false);
  fetchMock.mockResolvedValue({ ok: false, status: 401 });
  render(<MentorAvailabilityPage />);
  await screen.findByRole('link', { name: 'Iniciar sesión' });
  expect(screen.queryByRole('button', { name: 'Reintentar' })).not.toBeInTheDocument();
  expect(screen.queryByRole('group', { name: 'Selecciona tu disponibilidad' })).not.toBeInTheDocument();
  expect(fetchMock).toHaveBeenCalledTimes(1);
});

it('un HTTP 500 muestra un error de carga y permite reintentar', async () => {
  saveSession('login-token', 'titulado', false);
  fetchMock.mockResolvedValueOnce({ ok: false, status: 500 })
    .mockResolvedValueOnce({ ok: true, json: async () => ({ availabilityStatus: 'AVAILABLE', fecha_actualizacion: null }) });
  render(<MentorAvailabilityPage />);
  fireEvent.click(await screen.findByRole('button', { name: 'Reintentar' }));
  await waitFor(() => expect(screen.getByText('Mentor disponible')).toBeInTheDocument());
  expect(fetchMock).toHaveBeenCalledTimes(2);
  expect(screen.queryByRole('link', { name: 'Iniciar sesión' })).not.toBeInTheDocument();
});

