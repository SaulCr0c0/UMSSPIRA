import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';

import { obtenerEnlaceRespaldo } from '@/modules/profile/services/perfil-api';

import { BackupViewerModal } from './backup-viewer-modal';

jest.mock('@/modules/profile/services/perfil-api', () => ({
  ...jest.requireActual('@/modules/profile/services/perfil-api'),
  obtenerEnlaceRespaldo: jest.fn(),
}));

const obtenerEnlaceMock = obtenerEnlaceRespaldo as jest.MockedFunction<typeof obtenerEnlaceRespaldo>;
const ENLACE = '/api/v1/perfil/respaldos/cert-1/archivo?expira=1700000300&firma=abc';

describe('BackupViewerModal', () => {
  beforeEach(() => {
    obtenerEnlaceMock.mockReset();
    obtenerEnlaceMock.mockResolvedValue({ url: ENLACE, expiraEn: '2026-10-23T23:05:00.000Z' });
  });

  it('muestra la foto real con el nombre de la certificación como título', async () => {
    render(<BackupViewerModal certificationId="cert-1" certificationName="AWS Solutions Architect" onClose={jest.fn()} />);

    expect(screen.getByRole('dialog', { name: 'AWS Solutions Architect' })).toBeInTheDocument();
    expect(await screen.findByRole('img', { name: 'Respaldo de AWS Solutions Architect' })).toHaveAttribute('src', ENLACE);
    expect(obtenerEnlaceMock).toHaveBeenCalledWith('cert-1');
  });

  it('pide un enlace nuevo cada vez que se abre', async () => {
    const { unmount } = render(<BackupViewerModal certificationId="cert-1" certificationName="AWS" onClose={jest.fn()} />);
    await screen.findByRole('img');
    unmount();

    render(<BackupViewerModal certificationId="cert-1" certificationName="AWS" onClose={jest.fn()} />);
    await screen.findByRole('img');
    expect(obtenerEnlaceMock).toHaveBeenCalledTimes(2);
  });

  it('«Cerrar» avisa para cerrar el visor', async () => {
    const onClose = jest.fn();
    render(<BackupViewerModal certificationId="cert-1" certificationName="AWS" onClose={onClose} />);
    await screen.findByRole('img');

    fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
