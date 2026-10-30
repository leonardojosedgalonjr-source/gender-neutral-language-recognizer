import type { ReactNode } from 'react';
import type { RecognitionMatch } from '../domain/types';
export function DocumentPreview({
  text,
  matches,
}: {
  text: string;
  matches: readonly RecognitionMatch[];
}) {
  const segments: ReactNode[] = [];
  let cursor = 0;
  for (const match of matches) {
    segments.push(text.slice(cursor, match.start));
    segments.push(
      <mark
        key={match.start}
        title={`Suggested alternative: ${match.alternative}`}
      >
        {text.slice(match.start, match.end)}
      </mark>,
    );
    cursor = match.end;
  }
  segments.push(text.slice(cursor));
  return (
    <pre
      className="document-preview"
      aria-label="Original document with recognized terms highlighted"
      tabIndex={0}
    >
      {segments}
    </pre>
  );
}
