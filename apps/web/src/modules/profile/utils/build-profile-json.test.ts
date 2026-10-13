import { profileHeader, profileTimeline } from '@/modules/profile/data/profile-data';
import type { TimelineSection } from '@/modules/profile/data/profile-data';

import { buildProfileJson, hasProfileBlocks } from './build-profile-json';

describe('build-profile-json', () => {
  const date = new Date(2026, 9, 2);

  it('arma el JSON con los campos del perfil', () => {
    const json = buildProfileJson(profileHeader, profileTimeline, date);

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

  it('devuelve listas vacías cuando falta una sección', () => {
    const json = buildProfileJson(profileHeader, [], date);

    expect(json.educacion).toEqual([]);
    expect(json.experienciaLaboral).toEqual([]);
    expect(json.certificaciones).toEqual([]);
  });

  it('detecta si el perfil tiene al menos un bloque con registros', () => {
    const empty: TimelineSection[] = [
      { title: 'EDUCACIÓN', items: [] },
      { title: 'EXPERIENCIA LABORAL', items: [] },
      { title: 'CERTIFICACIONES', items: [] },
    ];

    expect(hasProfileBlocks(profileTimeline)).toBe(true);
    expect(hasProfileBlocks(empty)).toBe(false);
  });
});
