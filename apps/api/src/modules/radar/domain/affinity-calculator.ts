import type { ExtractedKeyword } from '../../nlp/domain/entities/extracted-keyword';
import {
  MAX_AFFINITY_SCORE,
  MAX_KEYWORD_FREQUENCY,
  RADAR_AREAS,
  TOP_KEYWORDS_LIMIT,
} from './affinity-config';
import type { KeywordAreaWeight, RadarAreaAffinity } from './entities/affinity-calculation';

/** Calcula cada eje de manera independiente a partir de frecuencias y pesos del diccionario. */
export function calculateAffinity(
  keywords: readonly ExtractedKeyword[],
  areaWeights: readonly KeywordAreaWeight[],
): RadarAreaAffinity[] {
  const frequencyByTerm = new Map<string, number>();
  for (const keyword of keywords) {
    if (!Number.isFinite(keyword.count) || keyword.count <= 0) {
      continue;
    }
    frequencyByTerm.set(keyword.term, Math.min(keyword.count, MAX_KEYWORD_FREQUENCY));
  }

  return RADAR_AREAS.map((area) => {
    const contributions = areaWeights
      .filter((mapping) => mapping.area === area)
      .map((mapping) => ({
        term: mapping.term,
        contribution: (frequencyByTerm.get(mapping.term) ?? 0) * mapping.weight,
      }))
      .filter(({ contribution }) => contribution > 0)
      .sort((a, b) => b.contribution - a.contribution || a.term.localeCompare(b.term));
    const score = Math.min(
      MAX_AFFINITY_SCORE,
      contributions.reduce((sum, item) => sum + item.contribution, 0),
    );

    return {
      area,
      score,
      percentage: score,
      topKeywords: contributions.slice(0, TOP_KEYWORDS_LIMIT),
    };
  });
}
