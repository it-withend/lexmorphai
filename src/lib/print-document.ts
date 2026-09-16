import { DocumentAST } from './types';

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Clean print window: exact photo twin first, then transcript — no site chrome.
 */
export function printLivingDocument(ast: DocumentAST): void {
  const showCaption =
    Boolean(ast.caption?.courtName?.trim()) && Boolean(ast.caption?.plaintiff?.trim());

  const photoHtml = ast.originalImageUrl
    ? `<div class="photo-wrap">
        <p class="badge">Visual Twin — exact photo (logo, stamp, signature)</p>
        <img src="${ast.originalImageUrl}" alt="Original document scan" />
      </div>`
    : '';

  const captionHtml =
    showCaption && ast.caption
      ? `<div class="caption">
        <h1>${esc(ast.caption.courtName)}</h1>
        <h2>${esc(ast.caption.countyOrDistrict || '')}</h2>
        <div class="parties">
          <div>
            <strong>${esc(ast.caption.plaintiff)}</strong><br/>
            <em>-against-</em><br/>
            <strong>${esc(ast.caption.defendant)}</strong>
          </div>
          <div class="index">
            <strong>Index No. ${esc(ast.caption.indexNumber || '')}</strong><br/>
            ${esc(ast.caption.documentTitle || '')}
          </div>
        </div>
      </div>`
      : '';

  const sectionsHtml = ast.sections
    .map((s) => {
      const title = s.title ? `<div class="sec-title">${esc(s.title)}</div>` : '';
      return `<section>${title}<p>${esc(s.content).replace(/\n/g, '<br/>')}</p></section>`;
    })
    .join('\n');

  const html = `<!DOCTYPE html>
<html lang="auto">
<head>
  <meta charset="utf-8" />
  <title>${esc(ast.title)}</title>
  <style>
    @page { margin: 12mm; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: "Times New Roman", Times, serif;
      font-size: 11pt;
      line-height: 1.4;
      color: #111;
      background: #fff;
    }
    .sheet { max-width: 800px; margin: 0 auto; }
    .badge {
      font-family: Arial, sans-serif;
      font-size: 9pt;
      color: #166534;
      margin: 0 0 8px;
      font-weight: 700;
    }
    .photo-wrap { margin-bottom: 18px; page-break-after: always; }
    .photo-wrap img { width: 100%; height: auto; display: block; border: 1px solid #ddd; }
    h1, h2 { text-align: center; margin: 0 0 8px; }
    .parties {
      display: grid;
      grid-template-columns: 1.4fr 1fr;
      gap: 16px;
      border-top: 1.5px solid #111;
      border-bottom: 1.5px solid #111;
      padding: 10px 0;
      margin-bottom: 16px;
    }
    section { margin: 0 0 10px; }
    .sec-title { font-weight: 700; font-size: 10pt; margin-bottom: 2px; }
    p { margin: 0; white-space: pre-wrap; word-break: break-word; }
    .meta {
      margin-top: 20px;
      padding-top: 8px;
      border-top: 1px solid #ccc;
      font-size: 8pt;
      color: #555;
      font-family: Arial, sans-serif;
    }
    .transcript-label {
      font-family: Arial, sans-serif;
      font-size: 10pt;
      font-weight: 700;
      color: #334155;
      margin: 0 0 12px;
      text-transform: uppercase;
    }
  </style>
</head>
<body>
  <div class="sheet">
    ${photoHtml}
    <p class="transcript-label">Editable transcript</p>
    ${captionHtml}
    ${sectionsHtml}
    <div class="meta">LexMorph Visual Twin · ${esc(ast.jurisdiction)} · Not legal advice</div>
  </div>
  <script>
    window.onload = function () {
      setTimeout(function () { window.print(); }, 300);
    };
  </script>
</body>
</html>`;

  const win = window.open('', '_blank', 'noopener,noreferrer,width=900,height=1100');
  if (!win) {
    alert('Please allow pop-ups to print / save PDF.');
    return;
  }
  win.document.open();
  win.document.write(html);
  win.document.close();
}
