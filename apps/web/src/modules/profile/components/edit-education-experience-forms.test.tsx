import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';

import { ProfileStoreProvider, useProfileStore } from '@/modules/profile/state/profile-store';
import type { EducationRecord, ExperienceRecord } from '@/modules/profile/types/profile-record';

import { EditEducationForm } from './edit-education-form';
import { EditExperienceForm } from './edit-experience-form';

const push = jest.fn();
let routeId = '';

jest.mock('next/navigation', () => ({
  useParams: () => ({ id: routeId }),
  useRouter: () => ({ push }),
}));

function StoredValues() {
  const { records } = useProfileStore();
  const education = (records.education as EducationRecord[]).find((record) => record.id === routeId);
  const experience = (records.experience as ExperienceRecord[]).find((record) => record.id === routeId);
  return (
    <p data-testid="guardado">
      {education ? `${education.institution}|${education.graduationYear}` : ''}
      {experience ? `${experience.company}|${experience.endDate || 'actual'}` : ''}
    </p>
  );
}

function renderWith(form: React.ReactNode) {
  render(
    <ProfileStoreProvider>
      {form}
      <StoredValues />
    </ProfileStoreProvider>,
  );
}

describe('EditEducationForm', () => {
  beforeEach(() => {
    routeId = 'edu-1';
    push.mockClear();
  });

  it('carga la formación elegida y guarda los cambios en el estado compartido', () => {
    renderWith(<EditEducationForm />);
    expect(screen.getByLabelText('Institución')).toHaveValue('Universidad Mayor de San Simón');
    expect(screen.getByLabelText('Año de egreso')).toHaveValue('2018');

    fireEvent.change(screen.getByLabelText('Institución'), { target: { value: 'UMSS' } });
    fireEvent.change(screen.getByLabelText('Año de egreso'), { target: { value: '20a19' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    expect(screen.getByRole('status')).toHaveTextContent('Guardado');
    expect(screen.getByTestId('guardado')).toHaveTextContent('UMSS|2019');
  });

  it('avisa si la formación no existe', () => {
    routeId = 'no-existe';
    renderWith(<EditEducationForm />);
    expect(screen.getByText('No encontramos esta formación académica')).toBeInTheDocument();
  });
});

describe('EditExperienceForm', () => {
  beforeEach(() => {
    routeId = 'exp-2';
    push.mockClear();
  });

  it('carga la experiencia elegida con sus fechas', () => {
    renderWith(<EditExperienceForm />);
    expect(screen.getByLabelText('Empresa')).toHaveValue('Jalasoft');
    expect(screen.getByLabelText('Fecha inicio')).toHaveValue('2021-01-04');
    expect(screen.getByLabelText('Fecha fin')).toHaveValue('2023-06-30');
    expect(screen.getByLabelText('Actualmente trabajo aquí')).not.toBeChecked();
  });

  it('al marcar "Actualmente trabajo aquí" deshabilita la fecha fin y guarda como trabajo actual', () => {
    renderWith(<EditExperienceForm />);
    fireEvent.click(screen.getByLabelText('Actualmente trabajo aquí'));
    expect(screen.getByLabelText('Fecha fin')).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));
    expect(screen.getByTestId('guardado')).toHaveTextContent('Jalasoft|actual');
  });

  it('Cancelar vuelve a Gestionar registros', () => {
    renderWith(<EditExperienceForm />);
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(push).toHaveBeenCalledWith('/profile/records');
  });
});
