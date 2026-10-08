import { PREFIJOS_EXPERIENCIA, PREFIJOS_FORMACION, erroresDelBackend } from './errores-api';

describe('erroresDelBackend', () => {
  it('pone cada mensaje del 400 junto a su campo y le agrega el punto final', () => {
    const { porCampo, generales } = erroresDelBackend(
      ['La institución no puede superar los 150 caracteres', 'El año de egreso no puede ser mayor al año actual'],
      PREFIJOS_FORMACION,
    );

    expect(porCampo).toEqual({
      institucion: 'La institución no puede superar los 150 caracteres.',
      anioEgreso: 'El año de egreso no puede ser mayor al año actual.',
    });
    expect(generales).toEqual([]);
  });

  it('distingue la fecha de inicio de la fecha de fin', () => {
    const { porCampo } = erroresDelBackend(
      ['La fecha de fin no puede ser anterior a la fecha de inicio'],
      PREFIJOS_EXPERIENCIA,
    );

    expect(porCampo).toEqual({ fechaFin: 'La fecha de fin no puede ser anterior a la fecha de inicio.' });
  });

  it('deja como error general el mensaje que no corresponde a ningun campo', () => {
    const { porCampo, generales } = erroresDelBackend(['property extra should not exist'], PREFIJOS_FORMACION);

    expect(porCampo).toEqual({});
    expect(generales).toEqual(['property extra should not exist.']);
  });
});
