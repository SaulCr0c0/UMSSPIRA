import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { MentorAreasPage } from './mentor-areas-page';
import { clearAccessToken, setAccessToken } from '@/shared/services/auth-session';

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));
const router = { push: jest.fn(), replace: jest.fn() };
jest.mock('next/navigation', () => ({ useRouter: () => router }));

const originalFetch = global.fetch;
const detail = 'SELECT * FROM mentor_area; /srv/api/private.ts:42; postgres.internal:5432';
const areas = [
  { id: '1', nombre: 'DevOps', descripcion: null },
  { id: '2', nombre: 'Bases de datos', descripcion: null },
];
let getStatus: number;
let patchStatus: number;
let validationCode: string;
let selectedIds: string[];

beforeEach(() => {
  setAccessToken('token-de-prueba');
  getStatus = 200;
  patchStatus = 200;
  validationCode = '';
  selectedIds = ['1'];
  global.fetch = jest.fn(async (input, options) => {
    const url = String(input);
    if (url.endsWith('/areas')) {
      const status = options?.method === 'PATCH' ? patchStatus : getStatus;
      if (status >= 400) return {
        ok: false, status,
        text: async () => JSON.stringify({ code: validationCode, message: detail }),
        json: async () => ({ code: validationCode, message: detail }),
      } as Response;
      if (options?.method === 'PATCH') selectedIds = JSON.parse(String(options.body)).areaIds;
      return { ok: true, json: async () => ({ areas, selectedIds, intereses: [] }) } as Response;
    }
    return { ok: true, json: async () => url.endsWith('/eligibility') ? { eligible: true } : { esta_activo: true } } as Response;
  });
});

afterEach(() => {
  global.fetch = originalFetch;
  clearAccessToken();
});

it('muestra un aviso seguro con HTTP 500 al consultar y permite reintentar', async () => {
  getStatus = 500;
  render(<MentorAreasPage />);

  expect(await screen.findByRole('alert')).toHaveTextContent('No pudimos cargar las áreas técnicas. Intenta nuevamente en unos momentos.');
  expect(screen.queryByText(/SELECT|private\.ts|postgres\.internal/)).not.toBeInTheDocument();
  expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  getStatus = 200;
  fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
  expect(await screen.findByRole('checkbox', { name: 'DevOps' })).toBeChecked();
});

it('muestra un aviso seguro con HTTP 500 al guardar y conserva los cambios para reintentar', async () => {
  patchStatus = 500;
  render(<MentorAreasPage />);
  fireEvent.click(await screen.findByRole('checkbox', { name: 'Bases de datos' }));
  fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));

  expect(await screen.findByRole('alert')).toHaveTextContent('No pudimos guardar tus áreas técnicas. Intenta nuevamente en unos momentos.');
  expect(screen.queryByText(/SELECT|private\.ts|postgres\.internal/)).not.toBeInTheDocument();
  expect(screen.getByRole('checkbox', { name: 'DevOps' })).toBeChecked();
  expect(screen.getByRole('checkbox', { name: 'Bases de datos' })).toBeChecked();
  expect(screen.getByRole('button', { name: 'Guardar' })).toBeEnabled();

  patchStatus = 200;
  fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));
  expect(await screen.findByRole('status')).toHaveTextContent('Áreas técnicas actualizadas correctamente');
  expect(selectedIds).toEqual(['1', '2']);
  expect(screen.getByRole('button', { name: 'Guardar' })).toBeDisabled();
});

it('muestra una validación útil y segura cuando guardar devuelve 422', async () => {
  patchStatus = 422;
  validationCode = 'AREA_INACTIVA';
  render(<MentorAreasPage />);
  fireEvent.click(await screen.findByRole('checkbox', { name: 'Bases de datos' }));
  fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));

  expect(await screen.findByRole('alert')).toHaveTextContent('Una o más áreas seleccionadas están inactivas. Revisa tu selección.');
  expect(screen.queryByText(/SELECT|private\.ts|postgres\.internal/)).not.toBeInTheDocument();
  expect(screen.getByRole('checkbox', { name: 'Bases de datos' })).toBeChecked();
});

it('ante un 401 al consultar solicita login sin ofrecer reintentos ni repetir peticiones', async () => {
  getStatus = 401;
  render(<MentorAreasPage />);

  expect(await screen.findByRole('alert')).toHaveTextContent('Inicia sesión para configurar tus áreas técnicas.');
  expect(screen.getByRole('link', { name: 'Iniciar sesión' })).toHaveAttribute('href', '/login');
  expect(screen.queryByRole('button', { name: 'Reintentar' })).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Guardar' })).toBeDisabled();
  const requests = jest.mocked(global.fetch).mock.calls.filter(([url]) => String(url).endsWith('/areas'));
  expect(requests).toHaveLength(1);
});

it('sin token solicita login sin intentar una petición de áreas', async () => {
  clearAccessToken();
  render(<MentorAreasPage />);

  expect(await screen.findByRole('link', { name: 'Iniciar sesión' })).toHaveAttribute('href', '/login');
  expect(screen.queryByRole('button', { name: 'Reintentar' })).not.toBeInTheDocument();
  expect(global.fetch).not.toHaveBeenCalled();
});

it('ante un 401 al guardar bloquea nuevos intentos con la sesión inválida', async () => {
  patchStatus = 401;
  render(<MentorAreasPage />);
  fireEvent.click(await screen.findByRole('checkbox', { name: 'Bases de datos' }));
  fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));

  expect(await screen.findByRole('link', { name: 'Iniciar sesión' })).toHaveAttribute('href', '/login');
  expect(screen.queryByRole('button', { name: 'Reintentar' })).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Guardar' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));
  const writes = jest.mocked(global.fetch).mock.calls.filter(([, options]) => options?.method === 'PATCH');
  expect(writes).toHaveLength(1);
});
