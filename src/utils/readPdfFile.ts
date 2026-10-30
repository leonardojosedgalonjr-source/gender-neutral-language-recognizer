import {
  getDocument,
  GlobalWorkerOptions,
} from 'pdfjs-dist/legacy/build/pdf.mjs';
import type { TextItem } from 'pdfjs-dist/types/src/display/api';
import workerUrl from 'pdfjs-dist/legacy/build/pdf.worker.min.mjs?url';
import { MAX_PDF_PAGES, MAX_TEXT_LENGTH } from './documentReader';
GlobalWorkerOptions.workerSrc = workerUrl;

export function joinPdfItems(items: readonly TextItem[]): string {
  let text = '';
  let previous: TextItem | undefined;
  for (const item of items) {
    if (previous && !text.endsWith('\n')) {
      const height = Math.max(Math.abs(previous.transform[3] ?? 0), 1);
      const differentLine =
        Math.abs((item.transform[5] ?? 0) - (previous.transform[5] ?? 0)) >
        height * 0.5;
      const gap =
        (item.transform[4] ?? 0) -
        ((previous.transform[4] ?? 0) + previous.width);
      if (differentLine) text += '\n';
      else if (gap > height * 0.1 && !/\s$/.test(text) && !/^\s/.test(item.str))
        text += ' ';
    }
    text += item.str;
    if (item.hasEOL) text += '\n';
    previous = item;
  }
  return text;
}
export async function readPdfFile(file: File) {
  let data: ArrayBuffer;
  try {
    data = await file.arrayBuffer();
  } catch {
    throw new Error('This PDF could not be read. Please select it again.');
  }
  const task = getDocument({
    data: new Uint8Array(data),
    useSystemFonts: true,
  });
  try {
    const pdf = await task.promise;
    if (pdf.numPages > MAX_PDF_PAGES)
      throw new Error(
        'This PDF exceeds the 100-page limit. Please split it into smaller documents.',
      );
    const pages: string[] = [];
    const warnings = [
      'PDF text order and spacing may differ from the original layout. The preview shows extracted plain text.',
    ];
    let length = 0;
    for (let number = 1; number <= pdf.numPages; number++) {
      const page = await pdf.getPage(number);
      try {
        const content = await page.getTextContent();
        const text = joinPdfItems(
          content.items.filter((item): item is TextItem => 'str' in item),
        );
        pages.push(text);
        length += text.length + (number > 1 ? 2 : 0);
        if (length > MAX_TEXT_LENGTH)
          throw new Error(
            'This document exceeds the 500,000-character text limit. Please split it into smaller documents.',
          );
        if (!text.trim())
          warnings.push(
            `Page ${number} has no extractable text. Scanned content requires OCR, which is not supported.`,
          );
      } finally {
        page.cleanup();
      }
    }
    const text = pages.join('\n\n');
    if (!text.trim())
      throw new Error(
        'This PDF has no extractable text. Scanned PDFs require OCR, which is not supported.',
      );
    return { text, pageCount: pdf.numPages, warnings };
  } catch (error) {
    if (error instanceof Error && error.name === 'PasswordException')
      throw new Error(
        'Password-protected PDFs are not supported. Please provide an unprotected copy.',
      );
    if (
      error instanceof Error &&
      /exceeds|no extractable text/.test(error.message)
    )
      throw error;
    throw new Error(
      'This PDF is invalid or could not be extracted. Please export a valid, unprotected PDF and try again.',
    );
  } finally {
    await task.destroy();
  }
}
