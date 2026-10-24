import { fireEvent, render, screen } from '@testing-library/react';
import { MentorDirectoryFilters } from './mentor-directory-filters';
import { SPRINT1_CATALOG } from '../../model/mentor-directory';

describe('MentorDirectoryFilters - Tarea 101 (Selección de áreas técnicas)', () => {
  const onApplyMock = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('CA-01: lista todas las áreas técnicas activas del Sprint 1 por defecto', () => {
    render(
      <MentorDirectoryFilters
        catalog={[]}
        applied={{ areaIds: [], topicIds: [] }}
        interestsSupported={true}
        disabled={false}
        onApply={onApplyMock}
      />,
    );

    const expectedAreas = [
      'Desarrollo de Software',
      'Bases de Datos',
      'DevOps',
      'Ciberseguridad',
      'Desarrollo móvil',
      'Arquitectura y diseño de software',
    ];

    for (const areaName of expectedAreas) {
      const checkbox = screen.getByRole('checkbox', { name: areaName });
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).not.toBeChecked();
    }
  });

  it('CA-02: permite seleccionar un área técnica y refleja su estado visual de inmediato', () => {
    render(
      <MentorDirectoryFilters
        catalog={SPRINT1_CATALOG}
        applied={{ areaIds: [], topicIds: [] }}
        interestsSupported={true}
        disabled={false}
        onApply={onApplyMock}
      />,
    );

    const devopsCheckbox = screen.getByRole('checkbox', { name: 'DevOps' });
    const devopsLabel = devopsCheckbox.closest('label');

    expect(devopsCheckbox).not.toBeChecked();
    expect(devopsLabel).not.toHaveClass('is-selected');

    fireEvent.click(devopsCheckbox);

    expect(devopsCheckbox).toBeChecked();
    expect(devopsLabel).toHaveClass('is-selected');
  });

  it('CA-02: permite seleccionar múltiples áreas técnicas simultáneamente', () => {
    render(
      <MentorDirectoryFilters
        catalog={SPRINT1_CATALOG}
        applied={{ areaIds: [], topicIds: [] }}
        interestsSupported={true}
        disabled={false}
        onApply={onApplyMock}
      />,
    );

    const softwareCheckbox = screen.getByRole('checkbox', { name: 'Desarrollo de Software' });
    const securityCheckbox = screen.getByRole('checkbox', { name: 'Ciberseguridad' });
    const mobileCheckbox = screen.getByRole('checkbox', { name: 'Desarrollo móvil' });

    fireEvent.click(softwareCheckbox);
    fireEvent.click(securityCheckbox);
    fireEvent.click(mobileCheckbox);

    expect(softwareCheckbox).toBeChecked();
    expect(softwareCheckbox.closest('label')).toHaveClass('is-selected');

    expect(securityCheckbox).toBeChecked();
    expect(securityCheckbox.closest('label')).toHaveClass('is-selected');

    expect(mobileCheckbox).toBeChecked();
    expect(mobileCheckbox.closest('label')).toHaveClass('is-selected');

    // Otras áreas permanecen desmarcadas
    const dataCheckbox = screen.getByRole('checkbox', { name: 'Bases de Datos' });
    expect(dataCheckbox).not.toBeChecked();
    expect(dataCheckbox.closest('label')).not.toHaveClass('is-selected');
  });

  it('permite deseleccionar un área previamente seleccionada', () => {
    render(
      <MentorDirectoryFilters
        catalog={SPRINT1_CATALOG}
        applied={{ areaIds: ['devops', 'software'], topicIds: [] }}
        interestsSupported={true}
        disabled={false}
        onApply={onApplyMock}
      />,
    );

    const devopsCheckbox = screen.getByRole('checkbox', { name: 'DevOps' });
    const devopsLabel = devopsCheckbox.closest('label');
    expect(devopsCheckbox).toBeChecked();
    expect(devopsLabel).toHaveClass('is-selected');

    // Desmarcar DevOps
    fireEvent.click(devopsCheckbox);

    expect(devopsCheckbox).not.toBeChecked();
    expect(devopsLabel).not.toHaveClass('is-selected');

    // Desarrollo de Software permanece seleccionada
    const softwareCheckbox = screen.getByRole('checkbox', { name: 'Desarrollo de Software' });
    expect(softwareCheckbox).toBeChecked();
  });
});
