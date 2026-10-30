import mammoth from 'mammoth/mammoth.browser.js';
export async function readDocxFile(file: File) {
  let arrayBuffer: ArrayBuffer;
  try {
    arrayBuffer = await file.arrayBuffer();
  } catch {
    throw new Error(
      'This Word document could not be read. Please select it again.',
    );
  }
  let result: Awaited<ReturnType<typeof mammoth.extractRawText>>;
  try {
    result = await mammoth.extractRawText({ arrayBuffer });
  } catch {
    throw new Error(
      'This DOCX is invalid or could not be extracted. Please save it as a valid .docx document and try again.',
    );
  }
  if (!result.value.trim())
    throw new Error(
      'This Word document has no extractable text. Please select a document containing text.',
    );
  return {
    text: result.value,
    warnings: [
      'The preview shows extracted plain text; Word formatting, images, and layout are not reproduced.',
      ...result.messages.map((message) => message.message),
    ],
  };
}
