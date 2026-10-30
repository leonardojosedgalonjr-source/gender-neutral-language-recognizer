// @vitest-environment node
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { beforeAll, expect, it } from 'vitest';
import {
  readDocument,
  MAX_FILE_BYTES,
  MAX_TEXT_LENGTH,
} from './documentReader';
import { recognizeText } from '../domain/recognizer';
import { GlobalWorkerOptions } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { readPdfFile, joinPdfItems } from './readPdfFile';
import type { TextItem } from 'pdfjs-dist/types/src/display/api';
beforeAll(() => {
  GlobalWorkerOptions.workerSrc = fileURLToPath(
    new URL(
      '../../node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs',
      import.meta.url,
    ),
  );
});
async function fixture(name: string) {
  return new File(
    [await readFile(new URL(`../test/fixtures/${name}`, import.meta.url))],
    name,
  );
}
it('extracts a real two-page PDF with page separation and recognizes the text', async () => {
  const result = await readDocument(await fixture('sample.pdf'));
  expect(result.type).toBe('pdf');
  expect(result.pageCount).toBe(2);
  expect(result.text).toBe(
    'The chairmen welcomed the policewomen.\n\nA spokeswoman thanked the firemen.',
  );
  expect(recognizeText(result.text).matches.map((match) => match.term)).toEqual(
    ['chairmen', 'policewomen', 'spokeswoman', 'firemen'],
  );
  expect(result.warnings.length).toBeGreaterThan(0);
});
it('distinguishes readable no-match PDF from a PDF without text', async () => {
  expect(
    recognizeText((await readDocument(await fixture('no-matches.pdf'))).text)
      .totalOccurrences,
  ).toBe(0);
  await expect(readDocument(await fixture('blank.pdf'))).rejects.toThrow(
    'no extractable text',
  );
});
it('rejects corrupt and password-protected PDFs', async () => {
  await expect(readDocument(new File(['bad'], 'broken.pdf'))).rejects.toThrow(
    'PDF is invalid',
  );
  await expect(readDocument(await fixture('protected.pdf'))).rejects.toThrow(
    'Password-protected',
  );
});
it('extracts real DOCX paragraphs and recognizes the extracted text', async () => {
  const result = await readDocument(await fixture('sample.docx'));
  expect(result.type).toBe('docx');
  expect(result.text).toBe(
    'The chairwomen welcomed the salesmen.\n\nA businesswoman thanked the headmaster.\n\n',
  );
  expect(recognizeText(result.text).totalOccurrences).toBe(4);
});
it('rejects empty and corrupt DOCX files', async () => {
  await expect(readDocument(await fixture('blank.docx'))).rejects.toThrow(
    'no extractable text',
  );
  await expect(readDocument(new File(['bad'], 'broken.docx'))).rejects.toThrow(
    'DOCX is invalid',
  );
});
it('dispatches UTF-8 TXT, rejects binary text, legacy DOC, and unrelated formats', async () => {
  await expect(readDocument(new File(['bad'], 'pdf'))).rejects.toThrow(
    'Unsupported file format',
  );
  expect((await readDocument(new File(['He'], 'sample.TXT'))).text).toBe('He');
  await expect(readDocument(new File(['He\0'], 'binary.txt'))).rejects.toThrow(
    'binary control',
  );
  await expect(readDocument(new File(['text'], 'legacy.doc'))).rejects.toThrow(
    'Legacy .doc',
  );
  await expect(readDocument(new File(['text'], 'picture.png'))).rejects.toThrow(
    'Unsupported file format',
  );
});
it('enforces input and extracted-text size limits', async () => {
  await expect(
    readDocument(new File([new Uint8Array(MAX_FILE_BYTES + 1)], 'large.txt')),
  ).rejects.toThrow('10 MiB');
  await expect(
    readDocument(new File(['a'.repeat(MAX_TEXT_LENGTH + 1)], 'long.txt')),
  ).rejects.toThrow('500,000-character');
});
it('joins PDF fragments using geometry and explicit line breaks', () => {
  const item = (
    str: string,
    x: number,
    y: number,
    width: number,
    hasEOL = false,
  ): TextItem => ({
    str,
    dir: 'ltr',
    transform: [12, 0, 0, 12, x, y],
    width,
    height: 12,
    fontName: 'test',
    hasEOL,
  });
  expect(
    joinPdfItems([
      item('chair', 0, 0, 30),
      item('man', 30, 0, 18),
      item('He', 60, 0, 12, true),
      item('She', 0, -15, 18),
    ]),
  ).toBe('chairman He\nShe');
});
it('reports PDF read failures', async () => {
  const file = new File(['bad'], 'bad.pdf');
  Object.defineProperty(file, 'arrayBuffer', {
    value: () => Promise.reject(new Error('read failed')),
  });
  await expect(readPdfFile(file)).rejects.toThrow('could not be read');
});
