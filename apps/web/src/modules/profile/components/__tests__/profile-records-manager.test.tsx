import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';

import { ProfileRecordsManager } from '@/modules/profile/components/profile-records-manager';
import { PROFILE_RECORDS_MOCK } from '@/modules/profile/data/profile-records-data';
import { clearAccessToken, setAccessToken } from '@/shared/services/auth-session';

// jsdom no trae fetch: se simula la respuesta del DELETE real
const fetchMock = jest.fn();

function responder(status: number, cuerpo: unknown = null) {
  fetchMock.mockResolvedValue({ ok: status >= 200 && status < 300, status, json: async () => cuerpo });
}

function getDesktopRows() {
  return within(screen.getByRole('table')).getAllByRole('row').slice(1);
}

describe('ProfileRecordsManager', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock;
    setAccessToken('test-token');
  });

  afterEach(() => {
    // @ts-expect-error se vuelve al entorno de jsdom, que no tiene fetch
    delete global.fetch;
    clearAccessToken();
  });

  it('muestra iconos de editar y eliminar en cada registro', () => {
    render(<ProfileRecordsManager />);
    const rows = getDesktopRows();
    rows.forEach((row) => {
      // Editar ahora es un enlace a la pantalla de edición de la sección
      expect(within(row).getByRole('link', { name: 'Editar registro' })).toHaveAttribute('href', expect.stringMatching(/^\/profile\/education\/.+\/edit$/));
      expect(within(row).getByRole('button', { name: 'Eliminar registro' })).toBeInTheDocument();
    });
  });

  it('abre la pestaña indicada al volver de editar (BUG-HU04-003)', () => {
    render(<ProfileRecordsManager initialSection="experience" />);

    expect(within(getDesktopRows()[0]).getByText('NTT DATA')).toBeInTheDocument();
    expect(getDesktopRows()).toHaveLength(PROFILE_RECORDS_MOCK.experience.length);
  });

  it('pide confirmación, llama al DELETE real y quita solo ese registro sin recargar', async () => {
    responder(204);
    render(<ProfileRecordsManager />);
    const [, secondRow] = getDesktopRows();
    fireEvent.click(within(secondRow).getByRole('button', { name: 'Eliminar registro' }));

    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('¿Estás seguro de que deseas eliminar este registro?')).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole('button', { name: 'Confirmar' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    const [url, opciones] = fetchMock.mock.calls[0];
    expect(url).toMatch(new RegExp(`/api/v1/perfil/formacion-academica/${PROFILE_RECORDS_MOCK.education[1].id}$`));
    expect(opciones.method).toBe('DELETE');
    expect(getDesktopRows()).toHaveLength(PROFILE_RECORDS_MOCK.education.length - 1);
    expect(screen.queryByText('Universidad Católica Boliviana')).not.toBeInTheDocument();
    expect(screen.getAllByText('Universidad Mayor de San Simón').length).toBeGreaterThan(0);
    expect(screen.getByRole('status')).toHaveTextContent('Registro eliminado');
  });

  it('muestra error de conexión con opción de reintentar sin borrar el registro', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));
    render(<ProfileRecordsManager />);
    fireEvent.click(within(getDesktopRows()[0]).getByRole('button', { name: 'Eliminar registro' }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }));

    expect(await screen.findByText('No se pudo eliminar el registro')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument();
    expect(getDesktopRows()).toHaveLength(PROFILE_RECORDS_MOCK.education.length);
  });

  it('rechaza eliminar un registro de otro egresado (403) sin modificar la lista', async () => {
    responder(403, { error: { message: 'No tienes permiso' } });
    const records = { ...PROFILE_RECORDS_MOCK, education: [PROFILE_RECORDS_MOCK.education[0]] };
    render(<ProfileRecordsManager initialRecords={records} />);
    fireEvent.click(within(getDesktopRows()[0]).getByRole('button', { name: 'Eliminar registro' }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }));

    expect(await screen.findByText('No tienes permiso para eliminar este registro')).toBeInTheDocument();
    expect(getDesktopRows()).toHaveLength(1);
  });
});
