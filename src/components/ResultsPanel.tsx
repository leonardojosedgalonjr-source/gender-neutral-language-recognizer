import { useState } from 'react';
import type { RecognitionSummary, Category } from '../domain/types';
import { categories } from '../domain/types';
import { selectResults, downloadAnalysis } from '../domain/results';
import type { ResultSort } from '../domain/results';
import { ResultsTable } from './ResultsTable';
export function ResultsPanel({
  summary,
  filename,
}: {
  summary: RecognitionSummary;
  filename: string;
}) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<Category | ''>('');
  const [sort, setSort] = useState<ResultSort>('occurrences');
  const visible = selectResults(summary.results, query, category, sort);
  return (
    <section className="results panel" aria-labelledby="results-title">
      <div className="section-heading">
        <div>
          <span className="step">REVIEW SUGGESTIONS</span>
          <h2 id="results-title">Recognition results</h2>
        </div>
        <button
          className="secondary-button"
          disabled={!summary.totalOccurrences}
          onClick={() => downloadAnalysis(summary.results, filename)}
        >
          Export all results as CSV
        </button>
      </div>
      <div className="toolbar">
        <div className="search-field">
          <label htmlFor="search">Search detected terms</label>
          <input
            id="search"
            type="search"
            placeholder="Find a term…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <div>
          <label htmlFor="category">Category</label>
          <select
            id="category"
            value={category}
            onChange={(event) =>
              setCategory(event.target.value as Category | '')
            }
          >
            <option value="">All categories</option>
            {categories.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="sort">Sort results</label>
          <select
            id="sort"
            value={sort}
            onChange={(event) => setSort(event.target.value as ResultSort)}
          >
            <option value="occurrences">Most occurrences</option>
            <option value="term">Term A–Z</option>
          </select>
        </div>
        <button
          className="text-button"
          onClick={() => {
            setQuery('');
            setCategory('');
            setSort('occurrences');
          }}
        >
          Clear filters
        </button>
      </div>
      {summary.totalOccurrences === 0 ? (
        <p className="empty-state">
          No predefined gender-specific terms were detected.
        </p>
      ) : visible.length ? (
        <>
          <p className="result-count">
            Showing {visible.length} of {summary.distinctTerms} detected terms
          </p>
          <ResultsTable results={visible} />
        </>
      ) : (
        <p className="empty-state">No detected terms match these filters.</p>
      )}
      <p className="review-note">
        Suggestions are contextual. Review each alternative before editing your
        document; no text is replaced automatically. CSV exports include all
        detected terms.
      </p>
    </section>
  );
}
