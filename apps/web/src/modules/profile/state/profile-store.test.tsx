import '@testing-library/jest-dom';
import { fireEvent, render, screen, within } from '@testing-library/react';

import { ProfileRecordsManager } from '@/modules/profile/components/profile-records-manager';
import { PROFILE_RECORDS_MOCK } from '@/modules/profile/data/profile-records-data';
import ProfileSummary from '@/modules/profile/ver/profile-summary';

import { ProfileStoreProvider, useProfileStore } from './profile-store';

function AddEducationButton() {
  const { addEducation } = useProfileStore();
  return (
    <button
      type="button"
      onClick={() =>
        addEducation({ institution: 'Universidad Privada del Valle', title: 'Diplomado en Datos', graduationYear: '2024', degree: 'Diplomado' })
      }
    >
      agregar
    </button>
  );
}

describe('ProfileStoreProvider', () => {
  it('lo agregado en el estado compartido aparece en el resumen del perfil', () => {
    render(
      <ProfileStoreProvider>
        <AddEducationButton />
        <ProfileSummary />
      </ProfileStoreProvider>,
    );

    expect(screen.queryByText('Universidad Privada del Valle')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'agregar' }));
    expect(screen.getByText('Universidad Privada del Valle')).toBeInTheDocument();
  });

  it('"Mis registros" y el resumen muestran los mismos datos de prueba', () => {
    render(
      <ProfileStoreProvider>
        <ProfileRecordsManager />
      </ProfileStoreProvider>,
    );

    const rows = within(screen.getByRole('table')).getAllByRole('row').slice(1);
    expect(rows).toHaveLength(PROFILE_RECORDS_MOCK.education.length);
    expect(within(rows[0]).getByText('Universidad Mayor de San Simón')).toBeInTheDocument();
  });
});
