import { describe, expect, it } from 'vitest';
import { createRecognizer, recognizeText } from './recognizer';
import { recognitionRules } from './recognitionRules';
describe('recognition', () => {
  it('TEST 1 recognizes every configured term and its suggestion', () => {
    const result = recognizeText(
      recognitionRules.map((rule) => rule.term).join(', '),
    );
    expect(result.totalOccurrences).toBe(120);
    expect(result.results).toEqual(
      recognitionRules.map((rule) => ({ ...rule, count: 1 })),
    );
  });
  it('TEST 2 aggregates mixed capitalization', () => {
    expect(recognizeText('chairman Chairman CHAIRMAN').results).toEqual([
      {
        term: 'chairman',
        alternative: 'chairperson',
        category: 'Leadership',
        count: 3,
      },
    ]);
  });
  it('TEST 3 avoids he inside the and shelter', () => {
    expect(recognizeText('The team reached the shelter.').matches).toEqual([]);
  });
  it('TEST 6 handles punctuation and adjacent matches', () => {
    expect(
      recognizeText('“He,” (she); chairman/he!').matches.map(
        (match) => match.originalText,
      ),
    ).toEqual(['He', 'she', 'chairman', 'he']);
  });
  it('TEST 7 rejects embedded terms with Unicode letters, marks, numbers and underscores', () => {
    expect(
      recognizeText('shelter chairmanlike éhe he中 2he he2 _he he_ he\u0301')
        .matches,
    ).toEqual([]);
  });
  it('TEST 8 matches horizontal phrase spacing, never paragraphs', () => {
    expect(
      recognizeText(
        'LADIES\t and  GENTLEMEN; ladies\nand gentlemen; ladies and\r\ngentlemen',
      ).results,
    ).toEqual([
      {
        term: 'ladies and gentlemen',
        alternative: 'everyone',
        category: 'General language',
        count: 1,
      },
    ]);
  });
  it('TEST 9 counts several terms accurately', () => {
    const summary = recognizeText(
      'He met the chairman. SHE thanked he and the Chairman.',
    );
    expect(summary.results.map(({ term, count }) => [term, count])).toEqual([
      ['he', 2],
      ['chairman', 2],
      ['she', 1],
    ]);
    expect(summary.totalOccurrences).toBe(5);
    expect(summary.distinctTerms).toBe(3);
  });
  it('preserves UTF-16 offsets after emoji and original spelling', () => {
    const text = '😀 He\tmet SHE.';
    const matches = recognizeText(text).matches;
    expect(matches.map(({ start, end }) => [start, end])).toEqual([
      [3, 5],
      [10, 13],
    ]);
    for (const match of matches)
      expect(text.slice(match.start, match.end)).toBe(match.originalText);
  });
  it('escapes metacharacters and chooses the longest nonoverlapping alternative', () => {
    const recognize = createRecognizer([
      { term: 'a+b', alternative: 'sum' },
      { term: 'a', alternative: 'letter' },
    ]);
    expect(
      recognize('a+b a axb').matches.map((match) => match.originalText),
    ).toEqual(['a+b', 'a']);
  });
  it('is deterministic across repeated calls', () => {
    expect(recognizeText('He he')).toEqual(recognizeText('He he'));
    expect(recognizeText('nothing').totalOccurrences).toBe(0);
  });
  it('handles Unicode simple case folding', () => {
    expect(
      recognizeText('ſhe manKind').matches.map((match) => match.term),
    ).toEqual(['she', 'mankind']);
  });
  it('supports an empty rule set and rejects ambiguous rules', () => {
    expect(createRecognizer([])('He').matches).toEqual([]);
    expect(() =>
      createRecognizer([
        { term: 'he', alternative: 'they' },
        { term: 'HE', alternative: 'they' },
      ]),
    ).toThrow();
  });
});
