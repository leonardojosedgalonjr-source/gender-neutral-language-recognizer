import { categoryForTerm } from '../domain/results';
import type { AggregatedResult } from '../domain/types';
export function ResultsTable({
  results,
}: {
  results: readonly AggregatedResult[];
}) {
  return (
    <div className="table-scroll">
      <table>
        <caption className="sr-only">
          Detected terms, occurrence counts, and suggested alternatives
        </caption>
        <thead>
          <tr>
            <th scope="col">Detected term</th>
            <th scope="col">Occurrences</th>
            <th scope="col">Suggested alternative</th>
            <th scope="col">Category</th>
          </tr>
        </thead>
        <tbody>
          {results.map((result) => (
            <tr key={result.term}>
              <th scope="row">{result.term}</th>
              <td>{result.count}</td>
              <td className="alternative">{result.alternative}</td>
              <td>
                <span className="category-badge">
                  {categoryForTerm(result.term)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
