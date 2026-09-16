import { DocumentAST } from './types';

/** Escape text for safe HTML injection in the print window. */
function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Opens a clean print window with ONLY the reconstructed letter —
 * no LexMorph chrome, sidebar, or dark UI.
 */
export function printLivingDocument(ast: DocumentAST): void {
  const showCaption =
    Boolean(ast.caption?.courtName?.trim()) && Boolean(ast.caption?.plaintiff?.trim());

  const captionHtml = showCaption && ast.caption
    ? `
      <div class="caption">
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
    : `<h1 class="title">${esc(ast.title)}</h1>`;

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
    @page { margin: 18mm; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: "Times New Roman", Times, serif;
      font-size: 12pt;
      line-height: 1.45;
      color: #111;
      background: #fff;
    }
    .sheet { max-width: 800px; margin: 0 auto; padding: 12mm 0; }
    h1, h2, .title { text-align: center; margin: 0 0 8px; }
    .title { font-size: 14pt; text-transform: none; margin-bottom: 18px; }
    .caption h1 { font-size: 13pt; text-transform: uppercase; }
    .caption h2 { font-size: 11pt; font-weight: 600; margin-bottom: 16px; }
    .parties {
      display: grid;
      grid-template-columns: 1.4fr 1fr;
      gap: 16px;
      border-top: 1.5px solid #111;
      border-bottom: 1.5px solid #111;
      padding: 10px 0;
      margin-bottom: 20px;
      font-size: 11pt;
    }
    .index { font-size: 10pt; }
    section { margin: 0 0 14px; }
    .sec-title { font-weight: 700; font-size: 10pt; margin-bottom: 4px; text-transform: uppercase; }
    p { margin: 0; white-space: pre-wrap; word-break: break-word; }
    .meta {
      margin-top: 28px;
      padding-top: 10px;
      border-top: 1px solid #ccc;
      font-size: 9pt;
      color: #555;
      font-family: Arial, sans-serif;
    }
    @media print {
      .no-print { display: none !important; }
      body { background: #fff; }
    }
  </style>
</head>
<body>
  <div class="sheet">
    ${captionHtml}
    ${sectionsHtml}
    <div class="meta">LexMorph reconstruction · ${esc(ast.jurisdiction)} · Not legal advice</div>
  </div>
  <script>
    window.onload = function () {
      setTimeout(function () { window.print(); }, 250);
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
