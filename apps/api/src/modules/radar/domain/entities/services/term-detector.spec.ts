import { aggregateRadarScores, KeywordDictionaryMap } from './term-detector';
import type { RadarArea } from '@umsspira/shared-types';

describe('Term Detector', () => {
  it('aplica el tope de 3 en aggregateRadarScores', () => {
    const detected = { 'react': 5 };
    const keywordMap: KeywordDictionaryMap = { 'react': [{ area: 'software-development' as RadarArea, weight: 2 }] };
    const scores = aggregateRadarScores(detected, keywordMap);
    expect(scores['software-development']).toBe(6);
  });
});