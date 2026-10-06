import '@testing-library/jest-dom';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { MentorAreasPage } from './mentor-areas-page';
import { getMentorAreas, updateMentorAreas, type MentorArea } from '../services/mentor-areas-api';
import { clearAccessToken } from '@/shared/services/auth-session';

jest.mock('../services/mentor-areas-api');
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

const getAreas = jest.mocked(getMentorAreas);
const updateAreas = jest.mocked(updateMentorAreas);
const areas: MentorArea[] = [
  { id: '10000000-0000-4000-8000-000000000001', nombre: 'DevOps', descripcion: 'CI/CD y Docker.' },
  { id: '10000000-0000-4000-8000-000000000002', nombre: 'Bases de datos', descripcion: 'SQL y NoSQL.' },
  { id: '10000000-0000-4000-8000-000000000003', nombre: 'Ciberseguridad', descripcion: null },
  { id: '10000000-0000-4000-8000-000000000004', nombre: 'Arquitectura y diseño de software', descripcion: 'Patrones y microservicios.' },
  { id: '10000000-0000-4000-8000-000000000005', nombre: 'Desarrollo web', descripcion: 'Frontend y backend.' },
  { id: '10000000-0000-4000-8000-000000000006', nombre: 'Desarrollo móvil', descripcion: 'Android e iOS.' },
];

beforeEach(() => {
  jest.resetAllMocks();
  clearAccessToken();
  getAreas.mockResolvedValue({ areas, selectedIds: [] });
  updateAreas.mockImplementation(async selectedIds => ({ areas, selectedIds }));
});

it('muestra el catálogo ordenado alfabéticamente en la pantalla dedicada', async () => {
  render(<MentorAreasPage />);
  const list = await screen.findByRole('list', { name: 'Catálogo de áreas técnicas' });
  expect(within(list).getAllByRole('listitem').map(item => item.textContent)).toEqual([
    'Arquitectura y diseño de softwarePatrones y microservicios. Agregar',
    'Bases de datosSQL y NoSQL. Agregar',
    'Ciberseguridad Agregar',
    'Desarrollo móvilAndroid e iOS. Agregar',
    'Desarrollo webFrontend y backend. Agregar',
    'DevOpsCI/CD y Docker. Agregar',
  ]);
  expect(screen.getByRole('heading', { name: 'Áreas técnicas de especialidad' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /Volver a Mi perfil/ })).toHaveAttribute('href', '/mentorias/perfil');
});

it('selecciona y deselecciona cada área sin duplicarla', async () => {
  render(<MentorAreasPage />);
  const databases = await screen.findByRole('button', { name: /Bases de datos/ });

  fireEvent.click(databases);
  expect(databases).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByText('1 de 5 áreas seleccionadas')).toBeInTheDocument();
  fireEvent.click(databases);
  expect(databases).toHaveAttribute('aria-pressed', 'false');
  expect(screen.getByText('0 de 5 áreas seleccionadas')).toBeInTheDocument();
});

it('limita la selección a cinco áreas y permite descartar cambios', async () => {
  render(<MentorAreasPage />);
  await screen.findByRole('list', { name: 'Catálogo de áreas técnicas' });
  const options = screen.getAllByRole('button').filter(button => button.classList.contains('mentor-area-option'));
  options.slice(0, 5).forEach(option => fireEvent.click(option));
  expect(screen.getByText('5 de 5 áreas seleccionadas')).toBeInTheDocument();
  expect(options[5]).toBeDisabled();

  fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
  expect(screen.getByRole('link', { name: /Volver a Mi perfil/ })).toBeInTheDocument();
  expect(updateAreas).not.toHaveBeenCalled();
});

it('guarda las áreas elegidas y confirma el guardado', async () => {
  render(<MentorAreasPage />);
  const devops = await screen.findByRole('button', { name: /DevOps/ });
  fireEvent.click(devops);
  fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));

  expect(updateAreas).toHaveBeenCalledWith([areas[0].id]);
  expect(await screen.findByRole('status')).toHaveTextContent('Especialidades guardadas correctamente');
});

it('permite iniciar sesión de prueba desde la pantalla dedicada', async () => {
  getAreas.mockRejectedValueOnce(new Error('Inicia sesión para configurar tus áreas técnicas.'))
    .mockResolvedValueOnce({ areas, selectedIds: [] });
  render(<MentorAreasPage />);
  fireEvent.click(await screen.findByRole('button', { name: 'Entrar como mentor de prueba' }));
  expect(await screen.findByRole('list', { name: 'Catálogo de áreas técnicas' })).toBeInTheDocument();
  expect(getAreas).toHaveBeenCalledTimes(2);
});

it('muestra las once áreas predeterminadas si la API está caída y evita simular un guardado', async () => {
  getAreas.mockRejectedValue(new Error('No se pudieron guardar las áreas (HTTP 500).'));
  render(<MentorAreasPage />);

  const list = await screen.findByRole('list', { name: 'Catálogo de áreas técnicas' });
  expect(within(list).getAllByRole('listitem')).toHaveLength(11);
  expect(within(list).getByText('Desarrollo web')).toBeInTheDocument();
  expect(within(list).getByText('Frontend, backend, UX/UI.')).toBeInTheDocument();
  expect(within(list).getByText('Gestión de proyectos TI y desarrollo profesional')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Guardar' })).toBeDisabled();
  expect(screen.getByRole('alert')).toHaveTextContent('Mostrando el catálogo predeterminado');
});
