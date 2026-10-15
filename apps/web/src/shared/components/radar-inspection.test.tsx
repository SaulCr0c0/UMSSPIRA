
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import RadarInspection from './radar-inspection';

describe('RadarInspection Component', () => {
  const mockOnSelectArea = jest.fn();

  const mockAreas = [
    {
      area: 'software-development',
      affinity: 85.6,
      evidence: [
        { type: 'certification' as const, title: 'Certificado React Avanzado' },
        { type: 'project' as const, title: 'Sistema de Gestión' },
      ],
    },
    {
      area: 'cloud-devops',
      affinity: 70,
      evidence: [],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('C2: Renderiza el estado vacío cuando no hay áreas', () => {
    render(
      <RadarInspection
        selectedAreaId={null}
        onSelectArea={mockOnSelectArea}
        areas={[]}
      />
    );

    expect(
      screen.getByText(/Sin datos de historial laboral/i)
    ).toBeInTheDocument();

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  test('C4, C6 y C3: Muestra las áreas, porcentajes y permite seleccionar un área', () => {
    render(
      <RadarInspection
        selectedAreaId={null}
        onSelectArea={mockOnSelectArea}
        areas={mockAreas}
      />
    );

    expect(
      screen.getByText('Haz clic en un área para inspeccionar sus respaldos')
    ).toBeInTheDocument();

    expect(screen.getByText('Desarrollo de Software')).toBeInTheDocument();
    expect(screen.getByText('Cloud/DevOps')).toBeInTheDocument();
    expect(screen.getByText(/86%/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText('Desarrollo de Software'));

    expect(mockOnSelectArea).toHaveBeenCalledWith('software-development');
  });

  test('BUG-HU2-03: Muestra Sin dato para afinidades inválidas', () => {
    const invalidAreas = [
      { area: 'software-development', affinity: null },
      { area: 'cloud-devops', affinity: '' },
      { area: 'data-ai', affinity: 'abc' },
    ] as any[];

    render(
      <RadarInspection
        selectedAreaId={null}
        onSelectArea={mockOnSelectArea}
        areas={invalidAreas}
      />
    );

    expect(screen.getAllByText('Sin dato')).toHaveLength(3);
    const bars = document.querySelectorAll('[style*="width"]');

expect(bars).toHaveLength(3);

bars.forEach((bar) => {
  expect((bar as HTMLElement).style.width).toBe('0%');
});
  });


  test('C4: Muestra únicamente los respaldos del área seleccionada', () => {
    render(
      <RadarInspection
        selectedAreaId="software-development"
        onSelectArea={mockOnSelectArea}
        areas={mockAreas}
      />
    );

    expect(screen.getByText('Certificado React Avanzado')).toBeInTheDocument();
    expect(screen.getByText('Sistema de Gestión')).toBeInTheDocument();
  });

  test('C5: Permite volver al resumen y cambiar el área seleccionada', () => {
    const { rerender } = render(
      <RadarInspection
        selectedAreaId="software-development"
        onSelectArea={mockOnSelectArea}
        areas={mockAreas}
      />
    );

    fireEvent.click(screen.getByText(/Volver al resumen/i));

    expect(mockOnSelectArea).toHaveBeenCalledWith(null);

    rerender(
      <RadarInspection
        selectedAreaId="cloud-devops"
        onSelectArea={mockOnSelectArea}
        areas={mockAreas}
      />
    );

    expect(screen.getByText('Área: Cloud/DevOps')).toBeInTheDocument();
  });

  test('C9: Muestra el mensaje adecuado cuando el área no tiene respaldos', () => {
    render(
      <RadarInspection
        selectedAreaId="cloud-devops"
        onSelectArea={mockOnSelectArea}
        areas={mockAreas}
      />
    );

    expect(
      screen.getAllByText(/No hay certificaciones registradas para esta área/i).length
    ).toBeGreaterThan(0);

    expect(
      screen.getByText(/Esta área no tiene respaldos asociados/i)
    ).toBeInTheDocument();
  });
});