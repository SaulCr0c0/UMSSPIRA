import { calculateAffinityVariation, sortAreasByAffinityDesc } from './affinity-math';

describe('Affinity Math', () => {
  it('calcula la variacion correctamente', () => {
    expect(calculateAffinityVariation(80, 70)).toBe('+10%');
  });
});

describe('sortAreasByAffinityDesc', () => {
    it('ordena las áreas de mayor a menor afinidad', () => {
      const areas = [
        { area: 'software-development', affinity: 50 },
        { area: 'data-ai', affinity: 80 },
        { area: 'cloud-devops', affinity: 20 }
      ] as any; // Ajusta el tipo si tu interfaz lo requiere
      const sorted = sortAreasByAffinityDesc(areas);
      expect(sorted[0].area).toBe('data-ai');
      expect(sorted[2].area).toBe('cloud-devops');
    });
  });

 describe('calculateAffinityVariation', () => {
    it('retorna undefined si no hay valor previo (undefined)', () => {
      const variation = calculateAffinityVariation(50, undefined);
      expect(variation).toBeUndefined();
    });

    it('retorna undefined si la diferencia entre ambos valores es nula', () => {
      const variation = calculateAffinityVariation(50, 50);
      expect(variation).toBeUndefined();
    });
  });

  it('prevalece la frase más larga y descarta términos más cortos incluidos (HU6-C2)', () => {
    const dictionary = [
      { canonical: 'machine learning', alias: 'machine learning', wordCount: 2 },
      { canonical: 'machine', alias: 'machine', wordCount: 1 }
    ];
    const text = 'machine learning';
    const detected = detectTerms(text, dictionary);
    expect(detected['machine learning']).toBe(1);
    expect(detected['machine']).toBeUndefined();
  });

  it('suma puntaje a múltiples áreas mapeadas para una misma keyword sin dividirlo (HU6-C9)', () => {
    const detected = { 'python': 1 };
    const keywordMap = {
      'python': [
        { area: 'data-ai', weight: 3 },
        { area: 'software-development', weight: 2 }
      ]
    };
    const scores = aggregateRadarScores(detected, keywordMap);
    expect(scores['data-ai']).toBe(3);
    expect(scores['software-development']).toBe(2);
  });