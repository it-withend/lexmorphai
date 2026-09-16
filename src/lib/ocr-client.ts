/**
 * Client-side OCR — Latin + Cyrillic, returns line-level structure.
 */

export interface OcrLine {
  text: string;
  confidence: number;
}

export interface OcrResult {
  text: string;
  lines: OcrLine[];
  meanConfidence: number;
}

export async function extractTextFromImage(
  imageDataUrl: string,
  onProgress?: (status: string, progress: number) => void
): Promise<OcrResult> {
  const { createWorker } = await import('tesseract.js');

  const worker = await createWorker(['eng', 'rus'], 1, {
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
    const page = data as {
      text?: string;
      confidence?: number;
      lines?: Array<{ text?: string; confidence?: number }>;
    };

    const lines: OcrLine[] = (page.lines || [])
      .map((line: { text?: string; confidence?: number }) => ({
        text: (line.text || '').replace(/\s+/g, ' ').trim(),
        confidence: typeof line.confidence === 'number' ? line.confidence : 0,
      }))
      .filter((l: OcrLine) => l.text.length > 0);

    const text =
      lines.map((l) => l.text).join('\n').trim() ||
      (page.text || '')
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean)
        .join('\n')
        .trim();

    // Fallback: if Tesseract types omit lines, split plain text
    const finalLines =
      lines.length > 0
        ? lines
        : text
            .split('\n')
            .map((t) => t.trim())
            .filter(Boolean)
            .map((t) => ({ text: t, confidence: page.confidence || 0 }));

    const meanConfidence =
      finalLines.length > 0
        ? Math.round(finalLines.reduce((s, l) => s + l.confidence, 0) / finalLines.length)
        : Math.round(page.confidence || 0);

    return { text: finalLines.map((l) => l.text).join('\n'), lines: finalLines, meanConfidence };
  } finally {
    await worker.terminate();
  }
}
