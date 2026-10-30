import { recognitionRules } from './recognitionRules';
import type {
  AggregatedResult,
  RecognitionMatch,
  RecognitionRule,
  RecognitionSummary,
} from './types';
const normalize = (value: string) =>
  value.toLowerCase().replace(/[ \t]+/g, ' ');
const escapeRegex = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
export function createRecognizer(rules: readonly RecognitionRule[]) {
  const lookup = new Map<string, RecognitionRule>();
  for (const rule of rules) {
    const key = normalize(rule.term);
    if (
      !key.trim() ||
      key !== key.trim() ||
      /[\r\n]/.test(key) ||
      lookup.has(key)
    ) {
      throw new Error(
        'Recognition rules must have unique, nonempty terms without surrounding whitespace or line breaks.',
      );
    }
    lookup.set(key, rule);
  }
  const alternatives = [...lookup.keys()]
    .sort((a, b) => b.length - a.length)
    .map((term) => term.split(' ').map(escapeRegex).join('[ \\t]+'));
  // Combining marks also belong to words, including decomposed Unicode text.
  const expression = new RegExp(
    `(?<![\\p{L}\\p{M}\\p{N}_])(?:${alternatives.join('|') || '(?!)'})(?![\\p{L}\\p{M}\\p{N}_])`,
    'giu',
  );
  return (text: string): RecognitionSummary => {
    const matches: RecognitionMatch[] = [];
    const counts = new Map<string, AggregatedResult>();
    for (const match of text.matchAll(expression)) {
      // /iu folds the long s and Kelvin sign into ASCII as well.
      const key = normalize(match[0]).replace(/ſ/g, 's').replace(/K/g, 'k');
      const rule = lookup.get(key);
      if (!rule)
        throw new Error('A recognized term could not be mapped to its rule.');
      matches.push({
        ...rule,
        originalText: match[0],
        start: match.index,
        end: match.index + match[0].length,
      });
      counts.set(rule.term, {
        ...rule,
        count: (counts.get(rule.term)?.count ?? 0) + 1,
      });
    }
    return {
      matches,
      results: [...counts.values()],
      totalOccurrences: matches.length,
      distinctTerms: counts.size,
    };
  };
}
export const recognizeText = createRecognizer(recognitionRules);
