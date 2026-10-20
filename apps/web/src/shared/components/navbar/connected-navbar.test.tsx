import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ConnectedNavbar } from './connected-navbar';
import { clearSession } from '@/modules/auth/frontend/services/session';
import { authenticatedFetch, revokeCurrentSession, SessionError } from '@/shared/services/auth-session';
import { authStore } from '@/modules/auth/frontend/store';
import type { NavbarProps } from './types';

const push = jest.fn();
const refresh = jest.fn();
jest.mock('next/navigation', () => ({ usePathname: () => '/portal/institucional', useRouter: () => ({ push, refresh }) }));
jest.mock('@/modules/auth/frontend/services/session', () => ({ getSessionToken: jest.fn(), clearSession: jest.fn() }));
jest.mock('@/shared/services/auth-session', () => ({
  ...jest.requireActual('@/shared/services/auth-session'),
  authenticatedFetch: jest.fn(),
  revokeCurrentSession: jest.fn(),
}));
jest.mock('@/shared/services/api-client', () => ({ getToken: jest.fn(), clearToken: jest.fn() }));
jest.mock('@/modules/auth/frontend/store', () => ({ useAuthStore: () => ({ accessToken: null }), authStore: { reset: jest.fn() } }));
jest.mock('./navbar', () => ({ Navbar: ({ session, onLogout }: NavbarProps) => <header><span>{session ? `${session.name}: ${session.role}` : 'Visitante'}</span><button onClick={onLogout}>Cerrar sesión</button></header> }));

const fetchMock = jest.mocked(authenticatedFetch);

beforeEach(() => {
  jest.clearAllMocks();
  fetchMock.mockReset();
  fetchMock.mockRejectedValue(new SessionError(401, 'Inicia sesión'));
  jest.mocked(revokeCurrentSession).mockResolvedValue(undefined);
});

it('permanece como visitante sin una sesión real e ignora el rol del laboratorio', async () => {
  sessionStorage.setItem('umsspira.navbar-laboratorio.rol', 'administrador');
  render(<ConnectedNavbar />);
  expect(screen.getByText('Visitante')).toBeInTheDocument();
  await waitFor(() => expect(fetchMock).toHaveBeenCalled());
  sessionStorage.clear();
});

it('restaura el rol de empresa validado mediante el cliente autenticado', async () => {
  fetchMock.mockResolvedValue({ ok: true, json: async () => ({ data: { email: 'talento@ejemplo.com', role: 'empresa' } }) } as Response);
  render(<ConnectedNavbar />);
  expect(await screen.findByText('talento: empresa')).toBeInTheDocument();
  expect(fetchMock).toHaveBeenCalledWith('/api/v1/auth/me', expect.objectContaining({ cache: 'no-store' }));
});

it('permanece como visitante si la API rechaza el token', async () => {
  fetchMock.mockResolvedValue({ ok: false } as Response);
  render(<ConnectedNavbar />);
  await waitFor(() => expect(fetchMock).toHaveBeenCalled());
  expect(screen.getByText('Visitante')).toBeInTheDocument();
});

it('no presenta como autenticado un rol desconocido devuelto por la API', async () => {
  fetchMock.mockResolvedValue({ ok: true, json: async () => ({ data: { email: 'otra@ejemplo.com', role: 'desconocido' } }) } as Response);
  render(<ConnectedNavbar />);
  await waitFor(() => expect(fetchMock).toHaveBeenCalled());
  expect(screen.getByText('Visitante')).toBeInTheDocument();
});

it('revoca la sesión y limpia el estado antes de regresar al login', async () => {
  render(<ConnectedNavbar />);
  fireEvent.click(screen.getByRole('button', { name: 'Cerrar sesión' }));
  expect(revokeCurrentSession).toHaveBeenCalledTimes(1);
  await waitFor(() => expect(clearSession).toHaveBeenCalled());
  expect(authStore.reset).toHaveBeenCalled();
  expect(push).toHaveBeenCalledWith('/login');
  expect(refresh).toHaveBeenCalled();
});
