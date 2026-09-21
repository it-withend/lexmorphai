/**
 * Client-side text extraction from common notice formats.
 * Images → Tesseract OCR; DOCX → mammoth; TXT → File.text().
 * PDF is not fully supported yet (see Limitations).
 */

export async function extractTextFromFile(
  file: File,
  onProgress?: (msg: string) => void
): Promise<{ text: string; method: 'txt' | 'docx' | 'ocr' | 'unsupported'; note?: string }> {
  const name = file.name.toLowerCase();
  const type = file.type;

  if (name.endsWith('.txt') || name.endsWith('.md') || type === 'text/plain') {
    onProgress?.('Reading text file…');
    return { text: await file.text(), method: 'txt' };
  }

  if (
    name.endsWith('.docx') ||
    type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    onProgress?.('Extracting Word (.docx) text…');
    const mammoth = await import('mammoth');
    const buf = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer: buf });
    return { text: result.value || '', method: 'docx' };
  }

  if (type.startsWith('image/') || /\.(png|jpe?g|webp|gif|bmp)$/i.test(name)) {
    onProgress?.('Reading text from photo (on-device OCR)…');
    const dataUrl = await fileToDataUrl(file);
    const { extractTextFromImage } = await import('./ocr-client');
    const ocr = await extractTextFromImage(dataUrl, (status) => onProgress?.(status));
    return {
      text: ocr.text,
      method: 'ocr',
      note: `OCR confidence ~${ocr.meanConfidence}%. Fix any misread lines after analysis.`,
    };
  }

  if (name.endsWith('.pdf') || type === 'application/pdf') {
    return {
      text: '',
      method: 'unsupported',
      note: 'PDF upload is not supported yet. Paste the text, upload a photo of the page, or convert to .txt / .docx.',
    };
  }

  return {
    text: '',
    method: 'unsupported',
    note: 'Unsupported file. Use paste, .txt, .docx, or a photo of the notice.',
  };
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error || new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}
