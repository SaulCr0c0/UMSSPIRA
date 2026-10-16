import '@testing-library/jest-dom';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { clearAccessToken, setAccessToken } from '@/shared/services/auth-session';
import { MentorAvailabilityPage } from './mentor-availability-page';

jest.mock('next/navigation', () => ({ useRouter: () => ({ replace: jest.fn(), push: jest.fn() }) }));

const originalFetch = global.fetch;
const fetchMock = jest.fn();

beforeEach(() => {
  clearAccessToken();
  fetchMock.mockReset();
  global.fetch = fetchMock;
});

afterEach(() => {
  clearAccessToken();
  global.fetch = originalFetch;
});

it('carga al entrar directamente con el token recuperado en sessionStorage', async () => {
  setAccessToken('login-token');
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
  setAccessToken('rejected-token');
  fetchMock.mockResolvedValue({ ok: false, status: 401 });
  render(<MentorAvailabilityPage />);
  await screen.findByRole('link', { name: 'Iniciar sesión' });
  expect(screen.queryByRole('button', { name: 'Reintentar' })).not.toBeInTheDocument();
  expect(screen.queryByRole('group', { name: 'Selecciona tu disponibilidad' })).not.toBeInTheDocument();
  expect(fetchMock).toHaveBeenCalledTimes(1);
});

it('un HTTP 500 muestra un error de carga y permite reintentar', async () => {
  setAccessToken('login-token');
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
  setAccessToken('login-token');
  fetchMock.mockResolvedValue({ ok: true, json: async () => ({ availabilityStatus: status, fecha_actualizacion: null }) });
  render(<MentorAvailabilityPage />);
  await screen.findByText(label);
  const card = screen.getByRole('heading', { name: title }).closest('article')!;
  expect(within(card).getByRole('button', { name: 'Seleccionado', pressed: true })).toBeInTheDocument();
  expect(screen.getAllByRole('button', { pressed: true })).toHaveLength(1);
  expect(screen.getAllByRole('button', { name: 'Elegir', pressed: false })).toHaveLength(2);
});

it('distingue disponibilidad sin configurar de No disponible', async () => {
  setAccessToken('login-token');
  fetchMock.mockResolvedValue({ ok: true, json: async () => ({ availabilityStatus: null, fecha_actualizacion: null }) });
  render(<MentorAvailabilityPage />);
  await screen.findByText('Disponibilidad sin configurar');
  expect(screen.queryByRole('button', { pressed: true })).not.toBeInTheDocument();
  expect(screen.getAllByRole('button', { name: 'Elegir' })).toHaveLength(3);
});

it('conserva el estado guardado al editar y sincroniza cabecera y tarjeta al guardar y volver a cargar', async () => {
  setAccessToken('login-token');
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

it.each([
  ['AVAILABLE', 'UNAVAILABLE', 'Disponible', null],
  ['PAUSED', 'AVAILABLE', 'Pausar disponibilidad', 'Sí, pausar disponibilidad'],
  ['UNAVAILABLE', 'AVAILABLE', 'No disponible', 'Sí, marcar como no disponible'],
] as const)('habilita Guardar al cambiar a %s', async (_target, initial, title, confirmation) => {
  setAccessToken('login-token');
  fetchMock.mockResolvedValue({ ok: true, json: async () => ({ availabilityStatus: initial, fecha_actualizacion: null }) });
  render(<MentorAvailabilityPage />);
  await screen.findByRole('group', { name: 'Selecciona tu disponibilidad' });
  expect(screen.getByRole('button', { name: 'Guardar disponibilidad' })).toBeDisabled();
  const card = screen.getByRole('heading', { name: title }).closest('article')!;
  fireEvent.click(within(card).getByRole('button', { name: 'Elegir' }));
  if (confirmation) fireEvent.click(screen.getByRole('button', { name: confirmation }));
  expect(screen.getByRole('button', { name: 'Guardar disponibilidad' })).toBeEnabled();
  expect(within(card).getByRole('button', { pressed: true })).toBeInTheDocument();
  expect(fetchMock).toHaveBeenCalledTimes(1);
});

it('bloquea solicitudes duplicadas mientras guarda y confirma el éxito', async () => {
  setAccessToken('login-token');
  let finish!: (response: unknown) => void;
  fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ availabilityStatus: 'PAUSED', fecha_actualizacion: null }) })
    .mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
  render(<MentorAvailabilityPage />);
  await screen.findByText('Mentor en pausa');
  fireEvent.click(within(screen.getByRole('heading', { name: 'Disponible' }).closest('article')!).getByRole('button', { name: 'Elegir' }));
  fireEvent.click(screen.getByRole('button', { name: 'Guardar disponibilidad' }));
  const savingButton = screen.getByRole('button', { name: 'Guardando…' });
  expect(savingButton).toBeDisabled();
  fireEvent.click(savingButton);
  expect(fetchMock.mock.calls.filter(([, options]) => options.method === 'PATCH')).toHaveLength(1);
  await act(async () => { finish({ ok: true, json: async () => ({ availabilityStatus: 'AVAILABLE', fecha_actualizacion: null }) }); });
  expect(await screen.findByText('Disponibilidad activada correctamente')).toBeInTheDocument();
  await waitFor(() => expect(screen.queryByRole('button', { name: 'Guardando…' })).not.toBeInTheDocument(), { timeout: 2500 });
  expect(screen.getByRole('button', { name: '¡Guardado!' })).toBeDisabled();
});

it('conserva la selección al fallar el guardado y permite reintentar', async () => {
  setAccessToken('login-token');
  fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ availabilityStatus: 'PAUSED', fecha_actualizacion: null }) })
    .mockResolvedValueOnce({ ok: false, status: 500 })
    .mockResolvedValueOnce({ ok: true, json: async () => ({ availabilityStatus: 'AVAILABLE', fecha_actualizacion: null }) });
  render(<MentorAvailabilityPage />);
  await screen.findByText('Mentor en pausa');
  const card = screen.getByRole('heading', { name: 'Disponible' }).closest('article')!;
  fireEvent.click(within(card).getByRole('button', { name: 'Elegir' }));
  fireEvent.click(screen.getByRole('button', { name: 'Guardar disponibilidad' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo actualizar la disponibilidad. Inténtalo de nuevo.');
  await waitFor(() => expect(screen.getByRole('button', { name: 'Guardar disponibilidad' })).toBeEnabled(), { timeout: 2500 });
  expect(within(card).getByRole('button', { pressed: true })).toBeInTheDocument();
  expect(screen.getByText('Mentor en pausa')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Guardar disponibilidad' }));
  await screen.findByText('Disponibilidad activada correctamente');
});

it('bloquea la edición y nuevos guardados si el backend rechaza la sesión al guardar', async () => {
  setAccessToken('login-token');
  fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ availabilityStatus: 'PAUSED', fecha_actualizacion: null }) })
    .mockResolvedValueOnce({ ok: false, status: 401 });
  render(<MentorAvailabilityPage />);
  await screen.findByText('Mentor en pausa');
  fireEvent.click(within(screen.getByRole('heading', { name: 'Disponible' }).closest('article')!).getByRole('button', { name: 'Elegir' }));
  fireEvent.click(screen.getByRole('button', { name: 'Guardar disponibilidad' }));
  await screen.findByRole('link', { name: 'Iniciar sesión' });
  expect(screen.queryByRole('button', { name: 'Guardar disponibilidad' })).not.toBeInTheDocument();
  expect(screen.queryByRole('group', { name: 'Selecciona tu disponibilidad' })).not.toBeInTheDocument();
  expect(fetchMock).toHaveBeenCalledTimes(2);
});
