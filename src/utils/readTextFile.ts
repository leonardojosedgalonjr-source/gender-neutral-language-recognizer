export async function readTextFile(file: File): Promise<string> {
  if (!/\.txt$/i.test(file.name))
    throw new Error('Unsupported file format. Please select a .txt document.');
  if (file.size === 0)
    throw new Error(
      'This document is empty. Please select a document containing text.',
    );
  let buffer: ArrayBuffer;
  try {
    buffer = await file.arrayBuffer();
  } catch {
    throw new Error('This document could not be read. Please select it again.');
  }
  let text: string;
  try {
    text = new TextDecoder('utf-8', { fatal: true }).decode(buffer);
  } catch {
    throw new Error(
      'This document is not valid UTF-8 text. Save it as UTF-8 and try again.',
    );
  }
  // eslint-disable-next-line no-control-regex -- Reject binary controls while preserving tabs and line endings.
  if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u.test(text))
    throw new Error(
      'This document contains binary control characters. Please select a plain UTF-8 text document.',
    );
  if (!text.trim())
    throw new Error(
      'This document is empty or contains only whitespace. Please select a document containing text.',
    );
  return text;
}
