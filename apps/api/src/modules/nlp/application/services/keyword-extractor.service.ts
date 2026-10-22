import type { DictionaryEntry } from '../../domain/entities/dictionary-entry';
import type { ExtractedKeyword, ExtractionResult } from '../../domain/entities/extracted-keyword';
import { STOPWORDS } from '../../domain/policies/stopwords';
import {
  normalizePhrase,
  normalizeText,
  splitSegments,
} from '../../domain/policies/text-normalizer';

export const MAX_NGRAM = 3;
export const MAX_UNMAPPED = 50;
export const MIN_UNMAPPED_LENGTH = 3;

const NUMERIC_TOKEN = /^[\d._+#]+$/;

export type IgnoredDictionaryKeyReason =
  'vacio' | 'sin-normalizar' | 'mas-de-3-palabras' | 'conflicto';

export interface IgnoredDictionaryKey {
  key: string;
  reason: IgnoredDictionaryKeyReason;
}

export interface DictionaryLoadReport {
  loaded: number;
  ignored: IgnoredDictionaryKey[];
}

export class KeywordExtractorService {
  private dictionary = new Map<string, string>();
  private maxWords = 0;

  loadDictionary(entries: DictionaryEntry[]): DictionaryLoadReport {
    this.dictionary = new Map<string, string>();
    this.maxWords = 0;

    const ignored: IgnoredDictionaryKey[] = [];
    for (const entry of entries) {
      this.registerKey(entry.canonical, entry.canonical, ignored);
      for (const alias of entry.aliases) {
        this.registerKey(alias, entry.canonical, ignored);
      }
    }

    return { loaded: this.dictionary.size, ignored };
  }

  extract(text: string): ExtractionResult {
    const keywordCounts = new Map<string, number>();
    const unmappedCounts = new Map<string, number>();

    for (const segment of splitSegments(text)) {
      const tokens = normalizeText(segment);
      let index = 0;

      // Recorrido voraz: en cada posición gana la frase más larga que empieza ahí.
      while (index < tokens.length) {
        const maxLength = Math.min(MAX_NGRAM, this.maxWords, tokens.length - index);
        let matchedLength = 0;

        for (let length = maxLength; length >= 1; length -= 1) {
          const phrase = tokens.slice(index, index + length).join(' ');
          const canonical = this.dictionary.get(phrase);
          if (canonical !== undefined) {
            keywordCounts.set(canonical, (keywordCounts.get(canonical) ?? 0) + 1);
            matchedLength = length;
            break;
          }
        }

        if (matchedLength > 0) {
          index += matchedLength;
          continue;
        }

        const token = tokens[index];
        if (token !== undefined && isValidUnmappedToken(token)) {
          unmappedCounts.set(token, (unmappedCounts.get(token) ?? 0) + 1);
        }
        index += 1;
      }
    }

    return {
      keywords: sortKeywords(keywordCounts),
      unmapped: sortKeywords(unmappedCounts).slice(0, MAX_UNMAPPED),
    };
  }

  private registerKey(key: string, canonical: string, ignored: IgnoredDictionaryKey[]): void {
    if (key.trim().length === 0) {
      ignored.push({ key, reason: 'vacio' });
      return;
    }

    if (normalizePhrase(key) !== key) {
      ignored.push({ key, reason: 'sin-normalizar' });
      return;
    }

    const words = key.split(' ').length;
    if (words > MAX_NGRAM) {
      ignored.push({ key, reason: 'mas-de-3-palabras' });
      return;
    }

    const existing = this.dictionary.get(key);
    if (existing !== undefined) {
      if (existing !== canonical) {
        ignored.push({ key, reason: 'conflicto' });
      }
      return;
    }

    this.dictionary.set(key, canonical);
    if (words > this.maxWords) {
      this.maxWords = words;
    }
  }
}

function isValidUnmappedToken(token: string): boolean {
  return token.length >= MIN_UNMAPPED_LENGTH && !STOPWORDS.has(token) && !NUMERIC_TOKEN.test(token);
}

function sortKeywords(counts: Map<string, number>): ExtractedKeyword[] {
  return [...counts.entries()]
    .map(([term, count]) => ({ term, count }))
    .sort((left, right) => {
      if (left.count !== right.count) {
        return right.count - left.count;
      }
      if (left.term < right.term) {
        return -1;
      }
      if (left.term > right.term) {
        return 1;
      }
      return 0;
    });
}
