import '@testing-library/jest-dom';
import { fireEvent, render, screen, within, waitFor } from '@testing-library/react';
import { MentorProfile } from './mentor-profile';
import { InactivePanel } from './inactive-panel';
import { getMentorProfile, updateMentorParticipation } from '../services/mentorias-api';

jest.mock('../services/mentorias-api');
const getProfile = jest.mocked(getMentorProfile);
const updateParticipation = jest.mocked(updateMentorParticipation);
const inactive = { isActive: false, requirements: { egresado: true, perfil: true } };

beforeEach(() => {
  jest.resetAllMocks();
  getProfile.mockResolvedValue(inactive);
});

it('activa y desactiva con los estados confirmados por la API', async () => {
  updateParticipation.mockResolvedValueOnce({ ...inactive, isActive: true }).mockResolvedValueOnce(inactive);
  render(<MentorProfile />);
  await waitFor(() => expect(screen.getByRole('button', { name: 'Activar como mentor' })).toBeEnabled());
  fireEvent.click(screen.getByRole('button', { name: 'Activar como mentor' }));
  await screen.findByText('Tu participación como mentor está activa');
  fireEvent.click(screen.getByRole('button', { name: 'Desactivar participación' }));
  fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
  expect(updateParticipation).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByRole('button', { name: 'Desactivar participación' }));
  fireEvent.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Desactivar participación' }));
  await screen.findByText('Tu participación como mentor está inactiva');
  expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
});

it('muestra error sin un perfil falso y permite reintentar la carga', async () => {
  getProfile.mockRejectedValueOnce(new Error('Backend no disponible'));
  render(<MentorProfile />);
  expect(await screen.findByRole('alert')).toHaveTextContent('Backend no disponible');
  expect(screen.getByRole('button', { name: 'Activar como mentor' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Configurar áreas' })).toBeVisible();
  expect(screen.getByRole('button', { name: 'Configurar intereses' })).toBeVisible();
  expect(screen.getByRole('button', { name: 'Configurar disponibilidad' })).toBeVisible();
  expect(screen.getByRole('button', { name: 'Agregar información' })).toBeVisible();
  expect(screen.getAllByText('Por consultar')).toHaveLength(2);
  expect(screen.queryByText('Titulado aprobado')).not.toBeInTheDocument();
  expect(screen.queryByText('Inactivo')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
  await waitFor(() => expect(screen.getByRole('button', { name: 'Activar como mentor' })).toBeEnabled());
});

it('mantiene la estructura y bloquea la activación durante la carga', () => {
  getProfile.mockReturnValue(new Promise(() => {}));
  render(<MentorProfile />);
  expect(screen.getByRole('status')).toHaveTextContent('Cargando participación');
  expect(screen.getByRole('button', { name: 'Configurar áreas' })).toBeVisible();
  expect(screen.getByRole('button', { name: 'Activar como mentor' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Activar como mentor' }));
  expect(updateParticipation).not.toHaveBeenCalled();
});

it('mantiene la confirmación abierta si falla la desactivación', async () => {
  getProfile.mockResolvedValue({ ...inactive, isActive: true });
  updateParticipation.mockRejectedValue(new Error('No se pudo guardar'));
  render(<MentorProfile />);
  fireEvent.click(await screen.findByRole('button', { name: 'Desactivar participación' }));
  const dialog = screen.getByRole('alertdialog');
  fireEvent.click(within(dialog).getByRole('button', { name: 'Desactivar participación' }));
  expect(await within(dialog).findByRole('alert')).toHaveTextContent('No se pudo guardar');
  expect(screen.getByText('Tu participación como mentor está activa')).toBeInTheDocument();
});

it.each([{ egresado: false, perfil: true }, { egresado: true, perfil: false }])('bloquea la activación con requisitos pendientes: %j', requirements => {
  const onActivate = jest.fn();
  render(<InactivePanel requirements={requirements} activating={false} onActivate={onActivate} />);
  const button = screen.getByRole('button', { name: 'Activar como mentor' });
  expect(button).toBeDisabled();
  fireEvent.click(button);
  expect(onActivate).not.toHaveBeenCalled();
});
