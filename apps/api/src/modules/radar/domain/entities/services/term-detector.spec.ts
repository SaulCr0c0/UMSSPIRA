import { aggregateRadarScores, KeywordDictionaryMap } from './term-detector';

describe('Term Detector', () => {
  it('aplica el tope de 3 en aggregateRadarScores', () => {
    const detected = { 'react': 5 };
    // Usamos 'as unknown as KeywordDictionaryMap' para no depender de @umsspira/shared-types en Jest
    const keywordMap = { 'react': [{ area: 'software-development', weight: 2 }] } as unknown as KeywordDictionaryMap;
    const scores = aggregateRadarScores(detected, keywordMap);
    expect(scores['software-development']).toBe(6);
  });
});