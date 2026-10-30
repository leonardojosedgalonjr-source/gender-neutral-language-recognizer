interface Props {
  onSelect: (file: File) => void;
}
export function FileUpload({ onSelect }: Props) {
  return (
    <section className="upload-panel" aria-labelledby="upload-title">
      <div>
        <span className="step">01 / UPLOAD</span>
        <h2 id="upload-title">Start with a document</h2>
        <p>Select a text file to review its language.</p>
      </div>
      <div className="file-control">
        <label htmlFor="document">Choose a text document</label>
        <input
          id="document"
          type="file"
          accept=".txt,text/plain"
          aria-describedby="file-help"
          onChange={(event) => {
            const file = event.currentTarget.files?.[0];
            if (file) onSelect(file);
            event.currentTarget.value = '';
          }}
        />
        <p id="file-help">
          .txt files · UTF-8 encoding · Processed on this device
        </p>
      </div>
    </section>
  );
}
