import { useRef, useState } from 'react';
import { FileUpload } from '../components/FileUpload';
import { ResultsPanel } from '../components/ResultsPanel';
import { DocumentPreview } from '../components/DocumentPreview';
import { recognizeText } from '../domain/recognizer';
import { recognitionRules } from '../domain/recognitionRules';
import type { FileProcessingState } from '../domain/types';
import { readDocument } from '../utils/documentReader';
export default function App() {
  const [state, setState] = useState<FileProcessingState>({ status: 'idle' });
  const request = useRef(0);
  async function selectFile(file: File) {
    const current = ++request.current;
    setState({ status: 'loading', filename: file.name, size: file.size });
    try {
      const document = await readDocument(file);
      if (current !== request.current) return;
      const summary = recognizeText(document.text);
      setState({
        status: 'success',
        filename: file.name,
        size: file.size,
        document,
        summary,
      });
    } catch (error) {
      if (current === request.current)
        setState({
          status: 'error',
          filename: file.name,
          size: file.size,
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
        <div className="brand-text">
          LANGUAGE REVIEW <span>Document workspace · v2.0</span>
        </div>
        <span className="local-badge">
          <span aria-hidden="true" className="privacy-dot" />
          Processed on your device
        </span>
      </header>
      <main>
        <section className="intro">
          <p className="eyebrow">AUTOMATA AND LANGUAGE THEORY</p>
          <h1>Gender Neutral Language Recognizer</h1>
          <p className="lead">
            Review your document. Recognize gender-specific language.
            <br />
            Explore inclusive alternatives with context in view.
          </p>
        </section>
        <FileUpload
          onSelect={(file) => {
            void selectFile(file);
          }}
        />
        {state.status !== 'idle' && (
          <div className="file-metadata">
            <strong>{state.filename}</strong>
            <span>
              {(state.size / 1024).toFixed(1)} KiB
              {state.status === 'success'
                ? ` · ${state.document.type.toUpperCase()}${state.document.pageCount ? ` · ${state.document.pageCount} pages` : ''}`
                : ''}
            </span>
          </div>
        )}
        <div
          aria-live="polite"
          role="status"
          className={`status ${state.status === 'loading' ? 'loading' : ''}`}
        >
          {state.status === 'loading' && `Reading ${state.filename}…`}
          {state.status === 'success' &&
            `Analysis complete: ${state.filename}. ${state.summary.totalOccurrences} occurrences across ${state.summary.distinctTerms} distinct terms.`}
        </div>
        {state.status === 'error' && (
          <div role="alert" className="error">
            <strong>Unable to analyze document</strong>
            <p>{state.message}</p>
          </div>
        )}
        {state.status === 'success' ? (
          <>
            <section className="summary-grid" aria-label="Analysis summary">
              <div>
                <span>Total occurrences</span>
                <strong>{state.summary.totalOccurrences}</strong>
              </div>
              <div>
                <span>Distinct recognized terms</span>
                <strong>{state.summary.distinctTerms}</strong>
              </div>
              <div>
                <span>Predefined vocabulary</span>
                <strong>
                  {recognitionRules.length}
                  <small> rules</small>
                </strong>
              </div>
              <div>
                <span>Document format</span>
                <strong>{state.document.type.toUpperCase()}</strong>
              </div>
            </section>
            {state.document.warnings.length > 0 && (
              <aside className="extraction-notes" aria-label="Extraction notes">
                <strong>About this extraction</strong>
                <ul>
                  {state.document.warnings.map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              </aside>
            )}
            <div className="workspace">
              <ResultsPanel summary={state.summary} filename={state.filename} />
              <section
                className="preview-section panel"
                aria-labelledby="preview-title"
              >
                <div className="section-heading">
                  <div>
                    <span className="step">READ IN CONTEXT</span>
                    <h2 id="preview-title">Document preview</h2>
                  </div>
                  <span className="highlight-key">
                    Underlined terms are matches
                  </span>
                </div>
                <p className="preview-caption">
                  Extracted plain text · Original document is unchanged
                </p>
                <DocumentPreview
                  text={state.document.text}
                  matches={state.summary.matches}
                />
              </section>
            </div>
          </>
        ) : state.status === 'idle' ? (
          <section className="welcome">
            <div className="welcome-heading">
              <span className="step">READY WHEN YOU ARE</span>
              <h2>A clearer view of your language</h2>
              <p>Upload a document to start your review.</p>
            </div>
            <div className="welcome-features">
              <div>
                <strong>{recognitionRules.length} predefined rules</strong>
                <p>
                  Occupations, leadership, public service, education, and more.
                </p>
              </div>
              <div>
                <strong>Context stays in view</strong>
                <p>Counts and suggestions alongside highlighted plain text.</p>
              </div>
              <div>
                <strong>Your document stays private</strong>
                <p>
                  Local processing. No uploads to a server. No automatic edits.
                </p>
              </div>
            </div>
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
