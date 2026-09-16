/**
 * Client-side OCR — free, no API key, runs in the browser.
 * Used when Gemini billing is unavailable; text is then analyzed by Groq or local rules.
 */

export async function extractTextFromImage(
  imageDataUrl: string,
  onProgress?: (status: string, progress: number) => void
): Promise<string> {
  const { createWorker } = await import('tesseract.js');
  const worker = await createWorker('eng', 1, {
    logger: (m) => {
      if (m.status === 'recognizing text' && typeof m.progress === 'number') {
        onProgress?.('Reading text from photo…', Math.round(m.progress * 100));
      } else if (m.status) {
        onProgress?.(String(m.status).replace(/_/g, ' '), Math.round((m.progress || 0) * 100));
      }
    },
  });

  try {
    const { data } = await worker.recognize(imageDataUrl);
    return (data.text || '').trim();
  } finally {
    await worker.terminate();
  }
}
