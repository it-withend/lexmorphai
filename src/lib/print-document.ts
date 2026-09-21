import type { CounterPleading, DocumentAST } from './types';

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Clean print window for the document editor — text (and optional photo) only, no site chrome.
 */
export function printLivingDocument(ast: DocumentAST): void {
  const showCaption =
    Boolean(ast.caption?.courtName?.trim()) && Boolean(ast.caption?.plaintiff?.trim());

  const photoHtml = ast.originalImageUrl
    ? `<div class="photo-wrap">
        <p class="badge">Original scan (if provided)</p>
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
    <div class="meta">LexMorph Defense Studio · ${esc(ast.jurisdiction)} · Not legal advice</div>
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

/**
 * Clean Court Answer print — court-style text only (no modal chrome / buttons / scrollbars).
 */
export function printCourtAnswer(pleading: CounterPleading): void {
  const selected = pleading.affirmativeDefenses.filter((d) => d.selected);
  const defensesHtml = selected
    .map(
      (d, i) => `
    <section class="defense">
      <h3>${i + 1}. ${esc(d.defenseName)}</h3>
      <p class="cite"><em>Statutory basis:</em> ${esc(d.statutoryBasis)}</p>
      <p>${esc(d.statement)}</p>
    </section>`
    )
    .join('\n');

  const counterHtml =
    pleading.counterclaims?.length > 0
      ? `<h2>COUNTERCLAIMS</h2>
    ${pleading.counterclaims
      .map(
        (c) => `
    <section>
      <h3>${esc(c.title)}</h3>
      <p><em>Damages claimed:</em> ${esc(c.damagesClaimed)}</p>
      <p>${esc(c.factualBasis)}</p>
    </section>`
      )
      .join('\n')}`
      : '';

  const reliefHtml = (pleading.demandForRelief || [])
    .map((r, i) => `<li>${esc(r)}</li>`)
    .join('\n');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${esc(pleading.title || 'Court Answer draft')}</title>
  <style>
    @page { margin: 18mm 16mm; size: letter; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: "Times New Roman", Times, serif;
      font-size: 11pt;
      line-height: 1.35;
      color: #111;
      background: #fff;
    }
    .sheet { max-width: 7.5in; margin: 0 auto; }
    .banner {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 8pt;
      color: #92400e;
      background: #fffbeb;
      border: 1px solid #f59e0b;
      padding: 6px 8px;
      margin-bottom: 14px;
    }
    h1 { text-align: center; font-size: 12pt; margin: 0 0 4px; text-transform: uppercase; }
    h2 { font-size: 11pt; margin: 16px 0 8px; text-transform: uppercase; border-bottom: 1px solid #111; padding-bottom: 2px; }
    h3 { font-size: 11pt; margin: 10px 0 4px; }
    .parties {
      display: grid;
      grid-template-columns: 1.5fr 1fr;
      gap: 12px;
      border-top: 1.5px solid #111;
      border-bottom: 1.5px solid #111;
      padding: 10px 0;
      margin: 12px 0 16px;
    }
    .index { text-align: right; }
    p { margin: 0 0 8px; }
    .cite { font-size: 10pt; color: #333; margin-bottom: 4px; }
    .defense { margin-bottom: 10px; page-break-inside: avoid; }
    ol, ul { margin: 0 0 12px; padding-left: 22px; }
    li { margin-bottom: 4px; }
    .verify {
      margin-top: 20px;
      padding-top: 10px;
      border-top: 1px solid #111;
      page-break-inside: avoid;
    }
    .meta {
      margin-top: 18px;
      font-family: Arial, Helvetica, sans-serif;
      font-size: 8pt;
      color: #555;
    }
    @media print {
      .banner { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <div class="sheet">
    <div class="banner">
      DRAFT — EDUCATIONAL ONLY — NOT LEGAL ADVICE. Check every fact before signing or filing anything.
    </div>
    <h1>${esc(pleading.caption.courtName || '')}</h1>
    <p style="text-align:center;margin:0 0 8px">${esc(pleading.caption.countyOrDistrict || '')}</p>
    <div class="parties">
      <div>
        <strong>${esc(pleading.caption.plaintiff || '')}</strong><br/>
        <em>-against-</em><br/>
        <strong>${esc(pleading.caption.defendant || '')}</strong>
      </div>
      <div class="index">
        <strong>Index No. ${esc(pleading.caption.indexNumber || '')}</strong><br/>
        ${esc(pleading.caption.documentTitle || pleading.title || 'VERIFIED ANSWER')}
      </div>
    </div>

    <h2>General Denial</h2>
    <p>${esc(pleading.generalDenial)}</p>

    <h2>Affirmative Defenses (${selected.length})</h2>
    ${defensesHtml || '<p><em>No defenses selected.</em></p>'}

    ${counterHtml}

    <h2>Demand for Relief / Prayer</h2>
    <ol>
      ${reliefHtml}
    </ol>

    <div class="verify">
      <h2>Verification (draft)</h2>
      <p>${esc(pleading.verificationBlock.penaltyOfPerjuryClause)}</p>
      <p>
        Declarant: <strong>${esc(pleading.verificationBlock.declarantName)}</strong><br/>
        ${esc(pleading.verificationBlock.date)}, ${esc(pleading.verificationBlock.county)}
      </p>
    </div>

    <div class="meta">LexMorph Defense Studio · Court Answer draft · Not a filed pleading</div>
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

