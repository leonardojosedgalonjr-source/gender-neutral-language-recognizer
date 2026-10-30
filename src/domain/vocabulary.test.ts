import { expect, it } from 'vitest';
import { recognitionRules } from './recognitionRules';
import { recognizeText } from './recognizer';
import original from '../test/fixtures/original-rules.json';
it('preserves the original 20 mappings and adds exactly 100 unique canonical rules', () => {
  expect(recognitionRules).toHaveLength(120);
  expect(
    recognitionRules
      .slice(0, 20)
      .map(({ term, alternative }) => ({ term, alternative })),
  ).toEqual(original);
  expect(recognitionRules.slice(20)).toHaveLength(100);
  expect(new Set(recognitionRules.map((rule) => rule.term)).size).toBe(120);
  for (const rule of recognitionRules) {
    expect(rule.alternative.trim().length).toBeGreaterThan(0);
    expect(rule.category).toBeTruthy();
    expect(rule.term).toBe(rule.term.toLowerCase().trim());
  }
});
it.each(recognitionRules.slice(20))(
  'recognizes and counts $term without embedded-word false positives',
  (rule) => {
    const text = `${rule.term}, ${rule.term.toUpperCase()}; x${rule.term}x`;
    const matches = recognizeText(text).matches.filter(
      (match) => match.term === rule.term,
    );
    expect(matches).toHaveLength(2);
    expect(
      recognizeText(text).results.find((result) => result.term === rule.term)
        ?.count,
    ).toBe(2);
    expect(
      matches.every((match) => match.alternative === rule.alternative),
    ).toBe(true);
  },
);
it('handles plural prefix candidates and multiword variants without duplicate overlaps', () => {
  expect(
    recognizeText(
      'Waitress waitresses; business\t ladies; working men.',
    ).matches.map((match) => match.term),
  ).toEqual(['waitress', 'waitresses', 'business ladies', 'working men']);
  expect(recognizeText('business\nladies').matches).toHaveLength(0);
});
