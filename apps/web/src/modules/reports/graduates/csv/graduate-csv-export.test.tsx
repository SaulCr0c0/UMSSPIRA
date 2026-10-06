import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { GraduateCsvExport } from './graduate-csv-export';

const fetchMock = jest.fn();
const createObjectUrlMock = jest.fn(() => 'blob:graduate-csv');
const revokeObjectUrlMock = jest.fn();
const anchorClickMock = jest.fn();

beforeAll(() => {
  Object.defineProperty(global, 'fetch', {
    writable: true,
    value: fetchMock,
  });
  Object.defineProperty(URL, 'createObjectURL', {
    writable: true,
    value: createObjectUrlMock,
  });
  Object.defineProperty(URL, 'revokeObjectURL', {
    writable: true,
    value: revokeObjectUrlMock,
  });
  jest
    .spyOn(HTMLAnchorElement.prototype, 'click')
    .mockImplementation(anchorClickMock);
});

beforeEach(() => {
  fetchMock.mockReset();
  createObjectUrlMock.mockClear();
  revokeObjectUrlMock.mockClear();
  anchorClickMock.mockClear();
});

afterAll(() => {
  jest.restoreAllMocks();
});

test('muestra CSV, PDF y la cantidad de titulados a exportar', () => {
  render(<GraduateCsvExport totalRecords={72} onPdfExport={jest.fn()} />);

  fireEvent.click(screen.getByRole('button', { name: /exportar/i }));

  expect(screen.getByRole('menuitem', { name: /csv/i })).toBeInTheDocument();
  expect(screen.getByRole('menuitem', { name: /pdf/i })).toBeInTheDocument();
  expect(
    screen.getByText('72 titulados verificados serán exportados.'),
  ).toBeInTheDocument();
});

test('confirma, conserva los filtros activos y descarga el CSV', async () => {
  fetchMock.mockResolvedValue({
    ok: true,
    blob: jest.fn().mockResolvedValue(new Blob(['csv'], { type: 'text/csv' })),
    headers: {
      get: jest.fn((name: string) =>
        name.toLowerCase() === 'content-disposition'
          ? 'attachment; filename="nomina-titulados-verificados-01102026.csv"'
          : null,
      ),
    },
  });

  render(
    <GraduateCsvExport
      totalRecords={72}
      filters={{ career: 'Ingeniería de Sistemas', search: 'camacho' }}
      apiBaseUrl="http://localhost:3000"
    />,
  );

  fireEvent.click(screen.getByRole('button', { name: /exportar/i }));
  fireEvent.click(screen.getByRole('menuitem', { name: /csv/i }));

  expect(screen.getByRole('dialog')).toBeInTheDocument();
  expect(
    screen.getByText(
      'Se exportarán 72 titulados verificados con los filtros activos.',
    ),
  ).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: /descargar csv/i }));

  await waitFor(() => {
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/graduates-report/csv?career=Ingenier%C3%ADa+de+Sistemas&search=camacho',
      { method: 'GET' },
    );
  });

  expect(createObjectUrlMock).toHaveBeenCalledTimes(1);
  expect(anchorClickMock).toHaveBeenCalledTimes(1);
  expect(revokeObjectUrlMock).toHaveBeenCalledWith('blob:graduate-csv');
  expect(
    await screen.findByText('La nómina CSV fue generada correctamente.'),
  ).toBeInTheDocument();
});

test('no llama al backend cuando no existen titulados verificados', () => {
  render(<GraduateCsvExport totalRecords={0} />);

  fireEvent.click(screen.getByRole('button', { name: /exportar/i }));
  fireEvent.click(screen.getByRole('menuitem', { name: /csv/i }));

  expect(screen.getByRole('alert')).toHaveTextContent(
    'No hay titulados verificados para exportar',
  );
  expect(fetchMock).not.toHaveBeenCalled();
});

test('muestra el error de generación devuelto por la API y vuelve a habilitar la interfaz', async () => {
  fetchMock.mockResolvedValue({
    ok: false,
    json: jest.fn().mockResolvedValue({
      message: 'No se pudo generar el archivo CSV. Intente nuevamente.',
    }),
    headers: { get: jest.fn(() => null) },
  });

  render(<GraduateCsvExport totalRecords={10} />);

  fireEvent.click(screen.getByRole('button', { name: /exportar/i }));
  fireEvent.click(screen.getByRole('menuitem', { name: /csv/i }));
  fireEvent.click(screen.getByRole('button', { name: /descargar csv/i }));

  expect(
    await screen.findByText(
      'No se pudo generar el archivo CSV. Intente nuevamente.',
    ),
  ).toBeInTheDocument();

  await waitFor(() => {
    expect(
      screen.getByRole('button', { name: /descargar csv/i }),
    ).not.toBeDisabled();
  });
});

test('delega la opción PDF al flujo de HU4 cuando está disponible', () => {
  const onPdfExport = jest.fn();
  render(<GraduateCsvExport totalRecords={12} onPdfExport={onPdfExport} />);

  fireEvent.click(screen.getByRole('button', { name: /exportar/i }));
  fireEvent.click(screen.getByRole('menuitem', { name: /pdf/i }));

  expect(onPdfExport).toHaveBeenCalledTimes(1);
});