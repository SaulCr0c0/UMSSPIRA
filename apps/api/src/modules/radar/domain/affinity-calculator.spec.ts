import { calculateAffinity } from './affinity-calculator';
import { RADAR_AREAS } from './affinity-config';
import type { KeywordAreaWeight } from './entities/affinity-calculation';

describe('calculateAffinity', () => {
  const weights: KeywordAreaWeight[] = [
    { term: 'typescript', area: 'software-development', weight: 5 },
    { term: 'python', area: 'software-development', weight: 3 },
    { term: 'python', area: 'data-ai', weight: 4 },
  ];

  it('devuelve los seis ejes en el orden fijo, incluso cuando el perfil está vacío', () => {
    const result = calculateAffinity([], weights);

    expect(result.map(({ area }) => area)).toEqual(RADAR_AREAS);
    expect(result.every(({ score, percentage }) => score === 0 && percentage === 0)).toBe(true);
  });

  it('multiplica el peso por la frecuencia limitada a tres', () => {
    const [software] = calculateAffinity([{ term: 'typescript', count: 20 }], weights);

    expect(software).toMatchObject({ score: 15, percentage: 15 });
  });

  it('suma keywords del área y limita el resultado a cien', () => {
    const result = calculateAffinity(
      ['typescript', 'python', 'react', 'node.js', 'javascript', 'docker', 'java', 'angular'].map(
        (term) => ({ term, count: 3 }),
      ),
      [
        ...weights,
        { term: 'react', area: 'software-development', weight: 5 },
        { term: 'node.js', area: 'software-development', weight: 5 },
        { term: 'javascript', area: 'software-development', weight: 5 },
        { term: 'docker', area: 'software-development', weight: 5 },
        { term: 'java', area: 'software-development', weight: 5 },
        { term: 'angular', area: 'software-development', weight: 5 },
      ],
    );

    expect(result.find(({ area }) => area === 'software-development')?.score).toBe(100);
  });

  it('calcula las áreas de forma independiente aunque una keyword pertenezca a varias', () => {
    const result = calculateAffinity([{ term: 'python', count: 2 }], weights);

    expect(result.find(({ area }) => area === 'software-development')?.score).toBe(6);
    expect(result.find(({ area }) => area === 'data-ai')?.score).toBe(8);
    expect(
      result
        .filter(({ area }) => area !== 'software-development' && area !== 'data-ai')
        .every(({ score }) => score === 0),
    ).toBe(true);
  });

  it('ignora frecuencias inválidas o no positivas', () => {
    const result = calculateAffinity(
      [
        { term: 'typescript', count: 0 },
        { term: 'python', count: Number.NaN },
      ],
      weights,
    );

    expect(result.every(({ score }) => score === 0)).toBe(true);
  });
});
