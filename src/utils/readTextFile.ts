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
  if (!text.trim())
    throw new Error(
      'This document is empty or contains only whitespace. Please select a document containing text.',
    );
  return text;
}
