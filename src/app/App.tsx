import { useRef, useState } from 'react';
import { FileUpload } from '../components/FileUpload';
import { ResultsTable } from '../components/ResultsTable';
import { DocumentPreview } from '../components/DocumentPreview';
import { recognizeText } from '../domain/recognizer';
import type { FileProcessingState } from '../domain/types';
import { readTextFile } from '../utils/readTextFile';
export default function App() {
  const [state, setState] = useState<FileProcessingState>({ status: 'idle' });
  const request = useRef(0);
  async function selectFile(file: File) {
    const current = ++request.current;
    setState({ status: 'loading', filename: file.name });
    try {
      const text = await readTextFile(file);
      const summary = recognizeText(text);
      if (current === request.current)
        setState({ status: 'success', filename: file.name, text, summary });
    } catch (error) {
      if (current === request.current)
        setState({
          status: 'error',
          filename: file.name,
          message:
            error instanceof Error
              ? error.message
              : 'The document could not be processed. Please try again.',
        });
    }
  }
  return (
    <>
      <header className="site-header">
        <div className="brand-icon" aria-hidden="true">
          Aa
        </div>
        <span>LANGUAGE REVIEW</span>
        <span className="local-badge">Private by design</span>
      </header>
      <main>
        <section className="intro">
          <p className="eyebrow">AUTOMATA AND LANGUAGE THEORY</p>
          <h1>
            Gender Neutral
            <br />
            Language Recognizer
          </h1>
          <p className="lead">
            A thoughtful review starts with language. Identify predefined
            gender-specific terms and explore inclusive alternatives.
          </p>
        </section>
        <FileUpload
          onSelect={(file) => {
            void selectFile(file);
          }}
        />
        <div aria-live="polite" role="status" className="status">
          {state.status === 'loading' && `Reading ${state.filename}…`}
          {state.status === 'success' &&
            `Analysis complete: ${state.filename}. ${state.summary.totalOccurrences} occurrences across ${state.summary.distinctTerms} distinct terms.`}
        </div>
        {state.status === 'error' && (
          <div role="alert" className="error">
            <strong>{state.filename}</strong>
            <p>{state.message}</p>
          </div>
        )}
        {state.status === 'success' ? (
          <>
            <section className="results" aria-labelledby="results-title">
              <div className="section-heading">
                <div>
                  <span className="step">02 / REVIEW</span>
                  <h2 id="results-title">Recognition results</h2>
                </div>
                <div className="summary">
                  <span>
                    <strong>{state.summary.distinctTerms}</strong> distinct
                    terms
                  </span>
                  <span>
                    <strong>{state.summary.totalOccurrences}</strong>{' '}
                    occurrences
                  </span>
                </div>
              </div>
              {state.summary.totalOccurrences ? (
                <ResultsTable results={state.summary.results} />
              ) : (
                <p className="empty-state">
                  No predefined gender-specific terms were detected.
                </p>
              )}
              <p className="review-note">
                Suggestions are contextual. Review each alternative before
                editing your document; no text is replaced automatically.
              </p>
            </section>
            <section
              className="preview-section"
              aria-labelledby="preview-title"
            >
              <div className="section-heading">
                <div>
                  <span className="step">03 / READ IN CONTEXT</span>
                  <h2 id="preview-title">Document preview</h2>
                </div>
                <span className="highlight-key">
                  Underlined highlights indicate matches
                </span>
              </div>
              <DocumentPreview
                text={state.text}
                matches={state.summary.matches}
              />
            </section>
          </>
        ) : state.status === 'idle' ? (
          <section className="welcome">
            <span className="document-icon" aria-hidden="true">
              ≡
            </span>
            <h2>Your review will appear here</h2>
            <p>
              Upload a document to see recognized terms, occurrence counts,
              <br className="desktop-break" /> and suggestions alongside your
              original text.
            </p>
          </section>
        ) : null}
      </main>
      <footer>
        <span>Bohol Island State University</span>
        <span>BSCS 3A · Automata and Language Theory</span>
      </footer>
    </>
  );
}
