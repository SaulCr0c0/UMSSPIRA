'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';

import { CURRENT_GRADUATE_ID, PROFILE_RECORDS_MOCK } from '@/modules/profile/data/profile-records-data';
import type {
  CertificationRecord,
  EducationRecord,
  ExperienceRecord,
  ProfileRecord,
  ProfileRecords,
  RecordSection,
} from '@/modules/profile/types/profile-record';

type NewRecord<T> = Omit<T, 'id' | 'ownerId'>;

type ProfileStore = {
  records: ProfileRecords;
  addEducation: (record: NewRecord<EducationRecord>) => void;
  addExperience: (record: NewRecord<ExperienceRecord>) => void;
  addCertification: (record: NewRecord<CertificationRecord>) => void;
  updateRecord: (section: RecordSection, record: ProfileRecord) => void;
  removeRecord: (section: RecordSection, recordId: string) => void;
};

const ProfileStoreContext = createContext<ProfileStore | null>(null);

let nextId = 0;
function createId(section: RecordSection): string {
  nextId += 1;
  return `${section}-nuevo-${nextId}`;
}

/**
 * Estado compartido del perfil para todas sus pantallas (resumen, completar, mis registros y edición).
 * Mientras no exista el backend, vive en memoria: se conserva al navegar y vuelve a los datos
 * de prueba al recargar la página.
 */
export function ProfileStoreProvider({
  children,
  initialRecords = PROFILE_RECORDS_MOCK,
}: {
  children: React.ReactNode;
  initialRecords?: ProfileRecords;
}) {
  const [records, setRecords] = useState<ProfileRecords>(initialRecords);

  const addRecord = useCallback((section: RecordSection, record: Omit<ProfileRecord, 'id' | 'ownerId'>) => {
    const created = { ...record, id: createId(section), ownerId: CURRENT_GRADUATE_ID } as ProfileRecord;
    setRecords((current) => ({ ...current, [section]: [...current[section], created] }));
  }, []);

  const updateRecord = useCallback((section: RecordSection, record: ProfileRecord) => {
    setRecords((current) => ({
      ...current,
      [section]: current[section].map((item) => (item.id === record.id ? record : item)),
    }));
  }, []);

  const removeRecord = useCallback((section: RecordSection, recordId: string) => {
    setRecords((current) => ({
      ...current,
      [section]: current[section].filter((item) => item.id !== recordId),
    }));
  }, []);

  const value = useMemo<ProfileStore>(
    () => ({
      records,
      addEducation: (record) => addRecord('education', record),
      addExperience: (record) => addRecord('experience', record),
      addCertification: (record) => addRecord('certification', record),
      updateRecord,
      removeRecord,
    }),
    [records, addRecord, updateRecord, removeRecord],
  );

  return <ProfileStoreContext.Provider value={value}>{children}</ProfileStoreContext.Provider>;
}

/** Devuelve el estado del perfil, o null si el componente se usa fuera del proveedor (por ejemplo en pruebas). */
export function useOptionalProfileStore(): ProfileStore | null {
  return useContext(ProfileStoreContext);
}

export function useProfileStore(): ProfileStore {
  const store = useOptionalProfileStore();
  if (!store) throw new Error('useProfileStore debe usarse dentro de ProfileStoreProvider');
  return store;
}
