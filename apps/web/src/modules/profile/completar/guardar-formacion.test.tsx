import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';

import { ProfileStoreProvider } from '@/modules/profile/state/profile-store';
import { AcordeonPerfil } from './acordeon-perfil';

jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn() }) }));

// Sin backend real: fetch devuelve la respuesta de NestJS que necesita cada caso
const fetchMock = jest.fn();

function respuesta(status: number, cuerpo: unknown) {
  return { ok: status >= 200 && status < 300, status, json: () => Promise.resolve(cuerpo) };
}

beforeEach(() => {
  fetchMock.mockReset();
  global.fetch = fetchMock as unknown as typeof fetch;
});

function abrirFormacion() {
  render(
    <ProfileStoreProvider>
      <AcordeonPerfil />
    </ProfileStoreProvider>,
  );
  const cabecera = screen.getByRole('button', { name: /formación académica/i });
  fireEvent.click(cabecera);
  return cabecera.closest('section') as HTMLElement;
}

function llenarYAgregar(seccion: HTMLElement) {
  fireEvent.change(within(seccion).getByLabelText('Institución'), { target: { value: 'UMSS' } });
  fireEvent.change(within(seccion).getByLabelText('Título'), { target: { value: 'Ingeniería Química' } });
  fireEvent.change(within(seccion).getByLabelText('Año de egreso'), { target: { value: '2021' } });
  fireEvent.change(within(seccion).getByLabelText('Grado'), { target: { value: 'Licenciatura' } });
  fireEvent.click(within(seccion).getByRole('button', { name: /agregar formación/i }));
}

describe('Guardar formación académica en la API', () => {
  it('201: limpia el formulario y muestra la formación registrada', async () => {
    fetchMock.mockResolvedValue(
      respuesta(201, {
        id: '6f1c7a52-0000-4000-8000-000000000001',
        idTitulado: 'titulado-1',
        fechaCreacion: '2026-10-08',
        institucion: 'UMSS',
        titulo: 'Ingeniería Química',
        grado: 'Licenciatura',
        anioEgreso: 2021,
      }),
    );
    const seccion = abrirFormacion();

    llenarYAgregar(seccion);

    expect(await within(seccion).findByText('Ingeniería Química')).toBeInTheDocument();
    expect(within(seccion).getByLabelText('Institución')).toHaveValue('');
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({ anioEgreso: 2021 });
  });

  it('409: muestra que ya está registrada y conserva los datos', async () => {
    fetchMock.mockResolvedValue(
      respuesta(409, {
        statusCode: 409,
        message: 'La formación académica ya se encuentra registrada.',
        error: 'Conflict',
      }),
    );
    const seccion = abrirFormacion();

    llenarYAgregar(seccion);

    expect(await within(seccion).findByText('La formación académica ya se encuentra registrada.')).toBeInTheDocument();
    expect(within(seccion).getByLabelText('Institución')).toHaveValue('UMSS');
    expect(within(seccion).getByLabelText('Título')).toHaveValue('Ingeniería Química');
    expect(within(seccion).queryByText('Ingeniería Química', { selector: 'span' })).not.toBeInTheDocument();
  });

  it('400: muestra el mensaje del backend junto al campo y conserva los datos', async () => {
    fetchMock.mockResolvedValue(
      respuesta(400, {
        statusCode: 400,
        message: ['La institución no puede superar los 150 caracteres'],
        error: 'Bad Request',
      }),
    );
    const seccion = abrirFormacion();

    llenarYAgregar(seccion);

    const mensaje = await within(seccion).findByText('La institución no puede superar los 150 caracteres.');
    expect(mensaje).toHaveAttribute('id', 'error-institucion');
    expect(within(seccion).getByLabelText('Institución')).toHaveAttribute('aria-invalid', 'true');
    expect(within(seccion).getByLabelText('Institución')).toHaveValue('UMSS');
  });

  it('deshabilita el botón mientras se guarda', async () => {
    let responder: (valor: unknown) => void = () => {};
    fetchMock.mockReturnValue(new Promise((resolver) => (responder = resolver)));
    const seccion = abrirFormacion();

    llenarYAgregar(seccion);

    expect(within(seccion).getByRole('button', { name: 'Guardando…' })).toBeDisabled();
    responder(respuesta(409, { statusCode: 409, message: 'La formación académica ya se encuentra registrada.' }));
    await waitFor(() => expect(within(seccion).getByRole('button', { name: /agregar formación/i })).toBeEnabled());
  });
});
