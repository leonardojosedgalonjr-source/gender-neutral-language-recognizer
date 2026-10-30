import type { ExtractedDocument, DocumentType } from '../domain/types';
import { readTextFile } from './readTextFile';
export const MAX_FILE_BYTES = 10 * 1024 * 1024;
export const MAX_TEXT_LENGTH = 500_000;
export const MAX_PDF_PAGES = 100;
export async function readDocument(file: File): Promise<ExtractedDocument> {
  const extension = file.name.match(/\.([^.]+)$/)?.[1]?.toLowerCase();
  if (!['txt', 'pdf', 'docx'].includes(extension ?? '')) {
    throw new Error(
      'Unsupported file format. Please select a .txt, .pdf, or .docx document. Legacy .doc files are not supported.',
    );
  }
  if (file.size > MAX_FILE_BYTES)
    throw new Error(
      'This document exceeds the 10 MiB file-size limit. Please select a smaller document.',
    );
  const type = extension as DocumentType;
  const extracted =
    type === 'txt'
      ? { text: await readTextFile(file), warnings: [] }
      : type === 'pdf'
        ? await (await import('./readPdfFile')).readPdfFile(file)
        : await (await import('./readDocxFile')).readDocxFile(file);
  if (extracted.text.length > MAX_TEXT_LENGTH)
    throw new Error(
      'This document exceeds the 500,000-character text limit. Please split it into smaller documents.',
    );
  return { filename: file.name, type, ...extracted };
}
