import { fireEvent, render, screen } from '@testing-library/react';
import { MentorDirectoryFilters } from './mentor-directory-filters';
import { SPRINT1_CATALOG } from '../../model/mentor-directory';

describe('MentorDirectoryFilters - Tareas 101 y 102', () => {
  const onApplyMock = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('Tarea 101: Selección de áreas técnicas (CA-01, CA-02)', () => {
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

      fireEvent.click(devopsCheckbox);

      expect(devopsCheckbox).not.toBeChecked();
      expect(devopsLabel).not.toHaveClass('is-selected');

      const softwareCheckbox = screen.getByRole('checkbox', { name: 'Desarrollo de Software' });
      expect(softwareCheckbox).toBeChecked();
    });
  });

  describe('Tarea 102: Mostrar intereses correspondientes a las áreas técnicas seleccionadas (CA-03, CA-04, CA-05)', () => {
    it('CA-04: muestra mensaje contextual indicando seleccionar al menos un área cuando no hay áreas seleccionadas', () => {
      render(
        <MentorDirectoryFilters
          catalog={SPRINT1_CATALOG}
          applied={{ areaIds: [], topicIds: [] }}
          interestsSupported={true}
          disabled={false}
          onApply={onApplyMock}
        />,
      );

      expect(
        screen.getByText('Selecciona al menos un área técnica para ver sus intereses correspondientes.'),
      ).toBeInTheDocument();
    });

    it('CA-03: al seleccionar un área, muestra únicamente los intereses correspondientes a esa área', () => {
      render(
        <MentorDirectoryFilters
          catalog={SPRINT1_CATALOG}
          applied={{ areaIds: [], topicIds: [] }}
          interestsSupported={true}
          disabled={false}
          onApply={onApplyMock}
        />,
      );

      // Al inicio sin áreas seleccionadas
      expect(screen.queryByText('Intereses correspondientes a las áreas seleccionadas.')).not.toBeInTheDocument();

      // Seleccionar DevOps
      const devopsCheckbox = screen.getByRole('checkbox', { name: 'DevOps' });
      fireEvent.click(devopsCheckbox);

      // Mensaje contextual cambia para confirmar que muestra intereses correspondientes
      expect(screen.getByText('Intereses correspondientes a las áreas seleccionadas.')).toBeInTheDocument();

      // Muestra intereses de DevOps
      expect(screen.getByRole('checkbox', { name: 'Docker y Contenedores' })).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: 'CI/CD Pipelines' })).toBeInTheDocument();

      // NO debe mostrar intereses de otras áreas (ej. PostgreSQL de Bases de Datos o Flutter de Desarrollo móvil)
      expect(screen.queryByRole('checkbox', { name: 'PostgreSQL y SQL' })).not.toBeInTheDocument();
      expect(screen.queryByRole('checkbox', { name: 'Flutter' })).not.toBeInTheDocument();
    });

    it('CA-03: al seleccionar múltiples áreas, muestra los grupos de intereses de todas las áreas seleccionadas', () => {
      render(
        <MentorDirectoryFilters
          catalog={SPRINT1_CATALOG}
          applied={{ areaIds: [], topicIds: [] }}
          interestsSupported={true}
          disabled={false}
          onApply={onApplyMock}
        />,
      );

      // Seleccionar DevOps y Desarrollo móvil
      fireEvent.click(screen.getByRole('checkbox', { name: 'DevOps' }));
      fireEvent.click(screen.getByRole('checkbox', { name: 'Desarrollo móvil' }));

      // Se muestran los intereses de DevOps
      expect(screen.getByRole('checkbox', { name: 'Docker y Contenedores' })).toBeInTheDocument();

      // Se muestran los intereses de Desarrollo móvil
      expect(screen.getByRole('checkbox', { name: 'Flutter' })).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: 'React Native' })).toBeInTheDocument();

      // NO se muestran los de Ciberseguridad ni Bases de Datos
      expect(screen.queryByRole('checkbox', { name: 'Criptografía' })).not.toBeInTheDocument();
      expect(screen.queryByRole('checkbox', { name: 'PostgreSQL y SQL' })).not.toBeInTheDocument();
    });

    it('CA-05: si se deselecciona un área técnica, sus intereses asociados seleccionados se desmarcan y desaparecen de las opciones', () => {
      render(
        <MentorDirectoryFilters
          catalog={SPRINT1_CATALOG}
          applied={{ areaIds: [], topicIds: [] }}
          interestsSupported={true}
          disabled={false}
          onApply={onApplyMock}
        />,
      );

      // Seleccionar DevOps y Ciberseguridad
      fireEvent.click(screen.getByRole('checkbox', { name: 'DevOps' }));
      fireEvent.click(screen.getByRole('checkbox', { name: 'Ciberseguridad' }));

      // Seleccionar un tópico de cada una
      const dockerTopic = screen.getByRole('checkbox', { name: 'Docker y Contenedores' });
      const cryptoTopic = screen.getByRole('checkbox', { name: 'Criptografía' });
      fireEvent.click(dockerTopic);
      fireEvent.click(cryptoTopic);

      expect(dockerTopic).toBeChecked();
      expect(cryptoTopic).toBeChecked();

      // Deseleccionar DevOps
      fireEvent.click(screen.getByRole('checkbox', { name: 'DevOps' }));

      // El grupo e intereses de DevOps desaparecen de la lista de opciones
      expect(screen.queryByRole('checkbox', { name: 'Docker y Contenedores' })).not.toBeInTheDocument();

      // El interés de Ciberseguridad permanece visible y seleccionado
      const cryptoStillThere = screen.getByRole('checkbox', { name: 'Criptografía' });
      expect(cryptoStillThere).toBeInTheDocument();
      expect(cryptoStillThere).toBeChecked();

      // Al aplicar filtros, el tópico desmarcado de DevOps no se envía en el draft
      fireEvent.click(screen.getByRole('button', { name: 'Aplicar filtros' }));
      expect(onApplyMock).toHaveBeenCalledWith({
        areaIds: ['security'],
        topicIds: ['crypto'],
      });
    });
  });
});
