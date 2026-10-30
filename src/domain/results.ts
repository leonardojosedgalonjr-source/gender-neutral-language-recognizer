import { recognitionRules } from './recognitionRules';
import type { AggregatedResult, Category } from './types';
const categoryLookup = new Map<string, Category>(
  recognitionRules.map((rule) => [rule.term, rule.category]),
);
export const categoryForTerm = (term: string): Category | undefined =>
  categoryLookup.get(term);
export type ResultSort = 'occurrences' | 'term';
export function selectResults(
  results: readonly AggregatedResult[],
  query: string,
  category: Category | '',
  sort: ResultSort,
) {
  const search = query.trim().toLowerCase();
  return results
    .filter(
      (result) =>
        result.term.includes(search) &&
        (!category || categoryForTerm(result.term) === category),
    )
    .sort(
      (a, b) =>
        (sort === 'occurrences' ? b.count - a.count : 0) ||
        a.term.localeCompare(b.term, 'en'),
    );
}
export function analysisCsv(results: readonly AggregatedResult[]): string {
  const quote = (value: string | number) =>
    `"${String(value).replace(/"/g, '""')}"`;
  return (
    [
      ['Term', 'Alternative', 'Category', 'Occurrences'],
      ...results.map((result) => [
        result.term,
        result.alternative,
        categoryForTerm(result.term) ?? '',
        result.count,
      ]),
    ]
      .map((row) => row.map(quote).join(','))
      .join('\r\n') + '\r\n'
  );
}
export function downloadAnalysis(
  results: readonly AggregatedResult[],
  filename: string,
) {
  const url = URL.createObjectURL(
    new Blob(['\ufeff', analysisCsv(results)], {
      type: 'text/csv;charset=utf-8',
    }),
  );
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${filename.replace(/\.[^.]+$/, '')}-analysis.csv`;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
