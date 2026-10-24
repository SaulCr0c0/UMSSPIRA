import { PROFILE_RECORDS_MOCK } from '@/modules/profile/data/profile-records-data';
import type { ProfileRecords } from '@/modules/profile/types/profile-record';

import { profileCompleteness } from './profile-completeness';

const VACIO: ProfileRecords = { education: [], experience: [], certification: [] };

describe('profileCompleteness (T6.5)', () => {
  it('un perfil vacío está al 0% y le faltan las 4 secciones', () => {
    const completitud = profileCompleteness(VACIO, '');

    expect(completitud.percentage).toBe(0);
    expect(completitud.missing.map((seccion) => seccion.label)).toEqual([
      'Formación',
      'Experiencia',
      'Certificaciones',
      'Descripción',
    ]);
  });

  it('cada sección vale 25% y la descripción solo cuenta con texto', () => {
    const conFormacion = { ...VACIO, education: PROFILE_RECORDS_MOCK.education };

    expect(profileCompleteness(conFormacion, '   ').percentage).toBe(25);
    expect(profileCompleteness(conFormacion, 'Analista').percentage).toBe(50);
  });

  it('con registros en las 3 secciones y descripción está al 100% sin faltantes', () => {
    const completitud = profileCompleteness(PROFILE_RECORDS_MOCK, 'Ingeniero de sistemas');

    expect(completitud.percentage).toBe(100);
    expect(completitud.missing).toEqual([]);
  });
});
