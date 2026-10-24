import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';

import { actualizarCertificacion, obtenerCertificacion } from '@/modules/profile/services/perfil-api';

import { ProfileStoreProvider, useProfileStore } from '@/modules/profile/state/profile-store';
import type { CertificationRecord } from '@/modules/profile/types/profile-record';
import { ApiError } from '@/shared/services/api-client';

import { EditCertificationForm } from './edit-certification-form';

const push = jest.fn();
let routeId = 'cert-1';

jest.mock('next/navigation', () => ({
  useParams: () => ({ id: routeId }),
  useRouter: () => ({ push }),
}));

// La certificación llega del backend: se simula el servicio para no llamar a la API real
jest.mock('@/modules/profile/services/perfil-api', () => ({
  obtenerCertificacion: jest.fn(),
  actualizarCertificacion: jest.fn(),
  obtenerPerfil: jest.fn(() => new Promise(() => {})),
}));
const obtenerCertificacionMock = obtenerCertificacion as jest.MockedFunction<typeof obtenerCertificacion>;
const actualizarCertificacionMock = actualizarCertificacion as jest.MockedFunction<typeof actualizarCertificacion>;

const GUARDADA: CertificationRecord = {
  id: 'cert-1',
  ownerId: 'egresado-1',
  name: 'AWS Solutions Architect',
  issuer: 'Amazon Web Services',
  degree: 'Profesional',
  issueYear: '2022',
  backupFile: 'respaldo.jpg',
  backupVerified: false,
};

function CertificationName({ id }: { id: string }) {
  const { records } = useProfileStore();
  const certification = (records.certification as CertificationRecord[]).find((record) => record.id === id);
  return <p data-testid="nombre-guardado">{certification?.name}</p>;
}

function renderForm() {
  render(
    <ProfileStoreProvider>
      <EditCertificationForm />
      <CertificationName id={routeId} />
    </ProfileStoreProvider>,
  );
}

describe('EditCertificationForm', () => {
  beforeEach(() => {
    routeId = 'cert-1';
    push.mockClear();
    obtenerCertificacionMock.mockReset();
    obtenerCertificacionMock.mockResolvedValue(GUARDADA);
    actualizarCertificacionMock.mockReset();
  });

  it('pide la certificación al backend y precarga sus datos y su respaldo', async () => {
    renderForm();
    expect(screen.getByText('Cargando certificación…')).toBeInTheDocument();

    expect(await screen.findByLabelText('Nombre de la certificación')).toHaveValue('AWS Solutions Architect');
    expect(obtenerCertificacionMock).toHaveBeenCalledWith('cert-1');
    expect(screen.getByLabelText('Entidad emisora')).toHaveValue('Amazon Web Services');
    expect(screen.getByLabelText('Año')).toHaveValue('2022');
    expect(screen.getByLabelText('Grado')).toHaveValue('Profesional');
    expect(screen.getByText('respaldo.jpg')).toBeInTheDocument();
  });

  it('si falla la conexión muestra el error y "Reintentar" vuelve a pedirla', async () => {
    obtenerCertificacionMock.mockRejectedValueOnce(new ApiError(0, 'No fue posible conectar con el servidor'));
    renderForm();

    fireEvent.click(await screen.findByRole('button', { name: 'Reintentar' }));

    expect(await screen.findByLabelText('Nombre de la certificación')).toHaveValue('AWS Solutions Architect');
    expect(obtenerCertificacionMock).toHaveBeenCalledTimes(2);
  });

  it('envía el PUT del mismo registro, actualiza la lista y muestra "Registro actualizado"', async () => {
    actualizarCertificacionMock.mockResolvedValue({ ...GUARDADA, name: 'AWS Solutions Architect Pro' });
    renderForm();
    fireEvent.change(await screen.findByLabelText('Nombre de la certificación'), { target: { value: 'AWS Solutions Architect Pro' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    expect(await screen.findByRole('status')).toHaveTextContent('Registro actualizado');
    expect(actualizarCertificacionMock).toHaveBeenCalledWith('cert-1', {
      nombre: 'AWS Solutions Architect Pro',
      entidadEmisora: 'Amazon Web Services',
      grado: 'Profesional',
      anioEmision: '2022',
    });
    expect(screen.getByTestId('nombre-guardado')).toHaveTextContent('AWS Solutions Architect Pro');
  });

  it('si el guardado falla muestra el error y no cambia el registro guardado', async () => {
    actualizarCertificacionMock.mockRejectedValue(new ApiError(0, 'No fue posible conectar con el servidor'));
    renderForm();
    fireEvent.change(await screen.findByLabelText('Nombre de la certificación'), { target: { value: 'Otro nombre' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    expect(await screen.findByText('No fue posible conectar con el servidor')).toBeInTheDocument();
    expect(screen.queryByText('Registro actualizado')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Nombre de la certificación')).toHaveValue('Otro nombre');
    expect(screen.getByTestId('nombre-guardado')).toHaveTextContent('AWS Solutions Architect');
  });

  it('Cancelar vuelve a Gestionar registros sin guardar nada', async () => {
    renderForm();
    fireEvent.click(await screen.findByRole('button', { name: 'Cancelar' }));
    expect(push).toHaveBeenCalledWith('/profile/records?seccion=certification');
    expect(actualizarCertificacionMock).not.toHaveBeenCalled();
  });

  it('avisa si la certificación no existe (404)', async () => {
    routeId = 'no-existe';
    obtenerCertificacionMock.mockRejectedValue(new ApiError(404, 'No encontrado'));
    renderForm();
    expect(await screen.findByText('No encontramos esta certificación')).toBeInTheDocument();
  });
});
