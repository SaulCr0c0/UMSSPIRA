import { calculateAffinityVariation } from './affinity-math';

describe('Affinity Math', () => {
  it('calcula la variacion correctamente', () => {
    expect(calculateAffinityVariation(80, 70)).toBe('+10%');
  });
});