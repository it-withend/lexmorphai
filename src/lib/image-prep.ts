/**
 * Client-side image prep for OCR + Visual Twin export.
 */

export function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Could not load image'));
    img.src = dataUrl;
  });
}

/** Resize / mild contrast boost for better OCR without destroying the original. */
export async function prepareImageForOcr(
  dataUrl: string,
  maxWidth = 1800
): Promise<{ ocrDataUrl: string; width: number; height: number }> {
  const img = await loadImage(dataUrl);
  const scale = Math.min(1, maxWidth / img.naturalWidth);
  const width = Math.max(1, Math.round(img.naturalWidth * scale));
  const height = Math.max(1, Math.round(img.naturalHeight * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas unavailable');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);

  // Mild contrast for black text on white paper
  const imageData = ctx.getImageData(0, 0, width, height);
  const d = imageData.data;
  const contrast = 1.18;
  const intercept = 128 * (1 - contrast);
  for (let i = 0; i < d.length; i += 4) {
    d[i] = Math.min(255, Math.max(0, d[i] * contrast + intercept));
    d[i + 1] = Math.min(255, Math.max(0, d[i + 1] * contrast + intercept));
    d[i + 2] = Math.min(255, Math.max(0, d[i + 2] * contrast + intercept));
  }
  ctx.putImageData(imageData, 0, 0);

  return {
    ocrDataUrl: canvas.toDataURL('image/jpeg', 0.92),
    width: img.naturalWidth,
    height: img.naturalHeight,
  };
}

/** Compress original for DOCX embed while keeping visual fidelity (logo/stamp). */
export async function prepareImageForEmbed(
  dataUrl: string,
  maxWidth = 1400
): Promise<{ dataUrl: string; width: number; height: number; mime: 'image/jpeg' | 'image/png' }> {
  const img = await loadImage(dataUrl);
  const scale = Math.min(1, maxWidth / img.naturalWidth);
  const width = Math.max(1, Math.round(img.naturalWidth * scale));
  const height = Math.max(1, Math.round(img.naturalHeight * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas unavailable');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);

  return {
    dataUrl: canvas.toDataURL('image/jpeg', 0.88),
    width,
    height,
    mime: 'image/jpeg',
  };
}
