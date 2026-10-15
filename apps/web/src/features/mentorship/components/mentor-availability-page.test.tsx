import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
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
  const retry = await screen.findByRole('button', { name: 'Reintentar' });
  expect(screen.getByText('No se pudo cargar la disponibilidad')).toBeInTheDocument();
  expect(screen.queryByText('Estado no disponible')).not.toBeInTheDocument();
  expect(screen.queryByRole('group', { name: 'Selecciona tu disponibilidad' })).not.toBeInTheDocument();
  fireEvent.click(retry);
  await waitFor(() => expect(screen.getByText('Mentor disponible')).toBeInTheDocument());
  expect(fetchMock).toHaveBeenCalledTimes(2);
  expect(screen.queryByRole('link', { name: 'Iniciar sesión' })).not.toBeInTheDocument();
});

it.each([
  ['AVAILABLE', 'Mentor disponible', 'Disponible'],
  ['PAUSED', 'Mentor en pausa', 'Pausar disponibilidad'],
  ['UNAVAILABLE', 'Mentor no disponible', 'No disponible'],
])('refleja %s en la cabecera y en una sola tarjeta', async (status, label, title) => {
  saveSession('login-token', 'titulado', false);
  fetchMock.mockResolvedValue({ ok: true, json: async () => ({ availabilityStatus: status, fecha_actualizacion: null }) });
  render(<MentorAvailabilityPage />);
  await screen.findByText(label);
  const card = screen.getByRole('heading', { name: title }).closest('article')!;
  expect(within(card).getByRole('button', { name: 'Seleccionado', pressed: true })).toBeInTheDocument();
  expect(screen.getAllByRole('button', { pressed: true })).toHaveLength(1);
  expect(screen.getAllByRole('button', { name: 'Elegir', pressed: false })).toHaveLength(2);
});

it('distingue disponibilidad sin configurar de No disponible', async () => {
  saveSession('login-token', 'titulado', false);
  fetchMock.mockResolvedValue({ ok: true, json: async () => ({ availabilityStatus: null, fecha_actualizacion: null }) });
  render(<MentorAvailabilityPage />);
  await screen.findByText('Disponibilidad sin configurar');
  expect(screen.queryByRole('button', { pressed: true })).not.toBeInTheDocument();
  expect(screen.getAllByRole('button', { name: 'Elegir' })).toHaveLength(3);
});

it('conserva el estado guardado al editar y sincroniza cabecera y tarjeta al guardar y volver a cargar', async () => {
  saveSession('login-token', 'titulado', false);
  let persisted = 'AVAILABLE';
  fetchMock.mockImplementation(async (_url: string, options: RequestInit) => {
    if (options.method === 'PATCH') persisted = JSON.parse(String(options.body)).availabilityStatus;
    return { ok: true, json: async () => ({ availabilityStatus: persisted, fecha_actualizacion: null }) };
  });
  const view = render(<MentorAvailabilityPage />);
  await screen.findByText('Mentor disponible');
  const card = screen.getByRole('heading', { name: 'No disponible' }).closest('article')!;
  fireEvent.click(within(card).getByRole('button', { name: 'Elegir' }));
  fireEvent.click(screen.getByRole('button', { name: 'Sí, marcar como no disponible' }));
  expect(within(card).getByRole('button', { name: 'Seleccionado', pressed: true })).toBeInTheDocument();
  expect(screen.getAllByRole('button', { pressed: true })).toHaveLength(1);
  expect(screen.getByText('Mentor disponible')).toBeInTheDocument();
  expect(screen.getByText('Cambio pendiente de guardar')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Guardar disponibilidad' }));
  await screen.findByText('Mentor no disponible');
  expect(persisted).toBe('UNAVAILABLE');
  view.unmount();
  render(<MentorAvailabilityPage />);
  await screen.findByText('Mentor no disponible');
  const reloadedCard = screen.getByRole('heading', { name: 'No disponible' }).closest('article')!;
  expect(within(reloadedCard).getByRole('button', { name: 'Seleccionado', pressed: true })).toBeInTheDocument();
  expect(screen.getAllByRole('button', { pressed: true })).toHaveLength(1);
});
