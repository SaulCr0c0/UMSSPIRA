import { getActivationEligibility } from './activation-conditions';

describe('activación de mentor', () => {
  it.each([
    [true, true, 2, true],
    [true, false, 1, false],
    [false, true, 1, false],
    [false, false, 0, false],
  ])('titulado=%s, perfil=%s', (egresado, perfil, metCount, eligible) => {
    expect(getActivationEligibility({ egresado, perfil })).toMatchObject({ total: 2, metCount, eligible });
  });
});
