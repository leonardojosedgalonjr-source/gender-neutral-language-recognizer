import { useState } from 'react';
interface Props {
  onSelect: (file: File) => void;
}
export function FileUpload({ onSelect }: Props) {
  const [dragging, setDragging] = useState(false);
  return (
    <section
      className={`upload-panel ${dragging ? 'dragging' : ''}`}
      aria-labelledby="upload-title"
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={(event) => {
        if (
          !(event.relatedTarget instanceof Node) ||
          !event.currentTarget.contains(event.relatedTarget)
        )
          setDragging(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        const file = event.dataTransfer.files[0];
        if (file) onSelect(file);
      }}
    >
      <div className="upload-icon" aria-hidden="true">
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M12 16V3m-5 5 5-5 5 5M4 15v5h16v-5" />
        </svg>
      </div>
      <div className="upload-copy">
        <h2 id="upload-title">Drop a document to begin</h2>
        <p>Review language in a text, PDF, or Word document.</p>
        <p className="file-help" id="file-help">
          TXT, PDF, DOCX · Up to 10 MiB · One document at a time
        </p>
      </div>
      <div className="file-control">
        <label htmlFor="document">Choose a text document</label>
        <input
          id="document"
          type="file"
          accept=".txt,.pdf,.docx"
          aria-describedby="file-help"
          onChange={(event) => {
            const file = event.currentTarget.files?.[0];
            if (file) onSelect(file);
            event.currentTarget.value = '';
          }}
        />
      </div>
    </section>
  );
}
