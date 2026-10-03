import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { GraduateAffinityView } from './graduate-affinity-view';
import * as affinityService from '../services/affinity-service';

jest.mock('../services/affinity-service');

const EXPECTED_LABELS = [
  'Desarrollo de Software',
  'Cloud/DevOps e Infraestructura',
  'Ciencia de Datos/IA',
  'Aseguramiento de Calidad (QA)',
  'Ciberseguridad y Redes',
  'Gestión de TI',
];

describe('GraduateAffinityView', () => {
  const mockGetAffinityConfig = affinityService.getAffinityConfig as jest.Mock;
  const mockRecalculateAffinity = affinityService.recalculateAffinity as jest.Mock;
  const mockGetAffinityVector = affinityService.getAffinityVector as jest.Mock;

  const recalculatedAreas = [
    { area: 'software-development', affinity: 85 },
    { area: 'cloud-devops', affinity: 64 },
    { area: 'data-ai', affinity: 71 },
    { area: 'quality-assurance', affinity: 58 },
    { area: 'cybersecurity-networks', affinity: 42 },
    { area: 'it-management', affinity: 50 },
  ];

  const simulateProfileChange = () => {
    fireEvent.click(screen.getByRole('button', { name: /simular cambio en el perfil/i }));
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockGetAffinityVector.mockResolvedValue({
      graduateId: 'id-1',
      calculatedAt: '2026-09-30T12:00:00.000Z',
      areas: recalculatedAreas,
    });

    mockGetAffinityConfig.mockResolvedValue({
      axes: [
        { area: 'software-development', weight: 4 },
        { area: 'cloud-devops', weight: 3 },
        { area: 'data-ai', weight: 3 },
        { area: 'quality-assurance', weight: 2 },
        { area: 'cybersecurity-networks', weight: 3 },
        { area: 'it-management', weight: 2 },
      ],
    });
    mockRecalculateAffinity.mockResolvedValue({
      graduateId: 'id-1',
      calculatedAt: '2026-09-30T12:00:00.000Z',
      areas: recalculatedAreas,
    });
  });

  it('deshabilita Recalcular y lo habilita al detectar un cambio nuevo', async () => {
    render(<GraduateAffinityView />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Recalcular' })).toBeDisabled();
    });

    simulateProfileChange();

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Se detectaron modificaciones')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Ahora no' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Recalcular' })).toBeEnabled();

    // El aviso no vuelve a abrirse por sí solo mientras siga el mismo cambio pendiente
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('recalcula desde el diálogo y muestra el toast de éxito', async () => {
    render(<GraduateAffinityView />);

    simulateProfileChange();
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Recalcular' }));

    await waitFor(() => {
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    expect(mockRecalculateAffinity).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Radar actualizado')).toBeInTheDocument();
    expect(screen.getAllByText('85%').length).toBeGreaterThan(0);
    expect(screen.queryByText('95%')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Recalcular' })).toBeDisabled();
  });

  it('muestra el error con el mensaje exacto, conserva el radar anterior y permite reintentar', async () => {
    render(<GraduateAffinityView />);

    // El primer recálculo deja un radar válido en pantalla
    simulateProfileChange();
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Recalcular' }));
    await waitFor(() => {
      expect(screen.getByRole('status')).toBeInTheDocument();
    });
    expect(mockRecalculateAffinity).toHaveBeenCalledTimes(1);

    mockRecalculateAffinity.mockRejectedValueOnce(new Error('Network error'));
    simulateProfileChange();
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Recalcular' }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('No se pudo actualizar tu radar')).toBeInTheDocument();

    // El radar anterior se conserva con sus valores originales
    expect(screen.getAllByText('85%').length).toBeGreaterThan(0);

    // El botón de la tarjeta sigue habilitado y los cambios pendientes se conservan
    expect(screen.getByRole('button', { name: 'Recalcular' })).toBeEnabled();
    expect(screen.queryByText('Recalculando...')).not.toBeInTheDocument();

    // Reintentar repite el recálculo y esta vez termina bien
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));

    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getAllByText('85%').length).toBeGreaterThan(0);
    expect(mockRecalculateAffinity).toHaveBeenCalledTimes(3);
    expect(screen.getByRole('button', { name: 'Recalcular' })).toBeDisabled();
  });

  it('conserva el radar anterior atenuado cuando el recálculo falla', async () => {
    mockRecalculateAffinity
      .mockResolvedValueOnce({
        graduateId: 'id-1',
        calculatedAt: '2026-09-30T12:00:00.000Z',
        areas: recalculatedAreas,
      })
      .mockRejectedValueOnce(new Error('Network error'));
    render(<GraduateAffinityView />);

    simulateProfileChange();
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Recalcular' }));
    await waitFor(() => {
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    simulateProfileChange();
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Recalcular' }));
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    // El radar válido queda debajo con sus valores originales y sin etiquetas --%
    expect(document.querySelector('.opacity-40')).not.toBeNull();
    expect(screen.getAllByText('85%').length).toBeGreaterThan(0);
    expect(screen.queryByText('--%')).not.toBeInTheDocument();
  });

  it('muestra Personalizar en solo lectura con las ponderaciones del sistema', async () => {
    render(<GraduateAffinityView />);

    fireEvent.click(screen.getByRole('tab', { name: /personalizar/i }));

    await waitFor(() => {
      expect(screen.getAllByText(/^Ponderación: /)).toHaveLength(6);
    });
    expect(screen.getByText('Ponderación: 4')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Las ponderaciones las define el sistema a partir de las palabras clave de tu perfil.'
      )
    ).toBeInTheDocument();
    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Añadir' })).not.toBeInTheDocument();
    expect(mockGetAffinityConfig).toHaveBeenCalledTimes(1);
  });

  it('muestra las 6 etiquetas visibles en orden fijo con "Ciencia de Datos/IA"', () => {
    render(<GraduateAffinityView />);

    // Se acota al resumen: el radar usa nombres abreviados y repetiría "Gestión de TI"
    const summarySection = screen.getByText('Resumen de tu afinidad').parentElement?.parentElement;
    expect(summarySection).not.toBeNull();

    const labels = EXPECTED_LABELS.map((label) =>
      within(summarySection as HTMLElement).getByText(label),
    );

    labels.forEach((label, index) => {
      expect(label).toBeInTheDocument();
      if (index === 0) return;
      const previous = labels[index - 1];
      expect(previous.compareDocumentPosition(label) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });
  });
});
