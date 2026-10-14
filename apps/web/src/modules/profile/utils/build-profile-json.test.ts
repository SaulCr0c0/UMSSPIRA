import { profileHeader } from '@/modules/profile/data/profile-data';
import { PROFILE_RECORDS_MOCK } from '@/modules/profile/data/profile-records-data';
import type { ProfileRecords } from '@/modules/profile/types/profile-record';

import { buildProfileJson, hasProfileBlocks } from './build-profile-json';

describe('build-profile-json', () => {
  const date = new Date(2026, 9, 2);

  it('arma el JSON con los campos del perfil', () => {
    const json = buildProfileJson(profileHeader, PROFILE_RECORDS_MOCK, date);

    expect(json).toMatchObject({
      idEgresado: '000452',
      fechaDescarga: '2026-10-02',
      nombre: 'Carlos Mendoza Ríos',
      carrera: 'Ingeniería de Sistemas',
      promocion: 2018,
    });
    expect(json.educacion[0]).toEqual({
      institucion: 'Universidad Mayor de San Simón',
      titulo: 'Licenciatura en Ingeniería de Sistemas',
      grado: 'Licenciatura',
      anio: 2018,
    });
    expect(json.experienciaLaboral).toHaveLength(3);
    expect(json.experienciaLaboral[0]).toEqual({
      empresa: 'NTT DATA',
      cargo: 'Tech Lead',
      periodo: 'Jul 2023 – Presente',
    });
    expect(json.certificaciones[0]).toEqual({
      nombre: 'AWS Solutions Architect',
      entidad: 'Amazon Web Services',
      anio: 2022,
      grado: 'Profesional',
    });
  });

  const empty: ProfileRecords = { education: [], experience: [], certification: [] };

  it('devuelve listas vacías cuando las secciones no tienen registros', () => {
    const json = buildProfileJson(profileHeader, empty, date);

    expect(json.educacion).toEqual([]);
    expect(json.experienciaLaboral).toEqual([]);
    expect(json.certificaciones).toEqual([]);
  });

  it('detecta si el perfil tiene al menos un bloque con registros', () => {
    expect(hasProfileBlocks(PROFILE_RECORDS_MOCK)).toBe(true);
    expect(hasProfileBlocks(empty)).toBe(false);
  });
});
