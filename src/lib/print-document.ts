import type { CounterPleading, DocumentAST } from './types';

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Print without relying on window.open('', ...) + noopener.
 * That combo leaves a blank about:blank tab and never fires onload.
 */
function printHtmlDocument(html: string): void {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const iframe = document.createElement('iframe');
  iframe.setAttribute('title', 'Print preview');
  iframe.setAttribute('aria-label', 'Print preview');
  Object.assign(iframe.style, {
    position: 'fixed',
    inset: '0',
    width: '100%',
    height: '100%',
    border: '0',
    zIndex: '2147483646',
    background: '#fff',
  });
  document.body.appendChild(iframe);

  const cleanup = () => {
    iframe.remove();
    URL.revokeObjectURL(url);
  };

  const triggerPrint = () => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch {
      /* print dialog can be cancelled */
    }
  };

  let cleaned = false;
  const safeCleanup = () => {
    if (cleaned) return;
    cleaned = true;
    cleanup();
  };

  iframe.onload = () => {
    window.setTimeout(triggerPrint, 250);
  };
  iframe.src = url;

  const afterPrint = () => {
    window.removeEventListener('afterprint', afterPrint);
    window.setTimeout(safeCleanup, 200);
  };
  window.addEventListener('afterprint', afterPrint);
  // If they never print, don't leave a covering iframe forever
  window.setTimeout(safeCleanup, 90_000);
}

function printChrome(opts?: { flagsToggle?: boolean; flagsOn?: boolean }): string {
  const toggle = opts?.flagsToggle
    ? `<label class="warn-toggle">
        <input type="checkbox" id="show-flags" ${opts.flagsOn ? 'checked' : ''} onchange="document.body.classList.toggle('hide-flags', !this.checked)" />
        Show issue flags
      </label>`
    : '';
  return `
  <div class="toolbar no-print">
    <p>Print preview · use Save as PDF in the dialog</p>
    ${toggle}
    <button type="button" onclick="window.print()">Print / Save PDF</button>
  </div>`;
}

const PRINT_CHROME_CSS = `
  .toolbar {
    font-family: Arial, Helvetica, sans-serif;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 14px;
    background: #111827;
    color: #e5e7eb;
    position: sticky;
    top: 0;
  }
  .toolbar p { margin: 0; font-size: 12px; }
  .toolbar button {
    border: 0;
    background: #c4a46a;
    color: #0c0d11;
    font-weight: 700;
    padding: 8px 12px;
    border-radius: 8px;
    cursor: pointer;
  }
  .warn-toggle {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: #e8d7b8;
  }
  @media print {
    .no-print { display: none !important; }
  }
`;

/**
 * Clean print window for the document editor — text (and optional photo) only, no site chrome.
 */
export function printLivingDocument(
  ast: DocumentAST,
  opts: { includeWarnings?: boolean } = {}
): void {
  const includeWarnings = opts.includeWarnings !== false;
  const showCaption =
    Boolean(ast.caption?.courtName?.trim()) && Boolean(ast.caption?.plaintiff?.trim());

  const photoSrc = ast.originalImageUrl
    ? ast.originalImageUrl.startsWith('http')
      ? ast.originalImageUrl
      : `${window.location.origin}${ast.originalImageUrl.startsWith('/') ? '' : '/'}${ast.originalImageUrl}`
    : '';
  const photoHtml = photoSrc
    ? `<div class="photo-wrap">
        <p class="badge">Original scan (if provided)</p>
        <img src="${esc(photoSrc)}" alt="Original document scan" />
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
      const defect = ast.defects.find((d) => d.id === s.redFlagId);
      const body = `<section>${title}<p>${esc(s.content).replace(/\n/g, '<br/>')}</p></section>`;
      if (!defect) return body;
      return `<section class="flag">
        <div class="flag-label">⚠ ${esc(defect.title)}${defect.citation ? ` · ${esc(defect.citation)}` : ''}</div>
        ${title}<p>${esc(s.content).replace(/\n/g, '<br/>')}</p>
      </section>`;
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
    .sheet { max-width: 800px; margin: 0 auto; padding: 18px; }
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
    .flag {
      border: 1.5px dashed #b91c1c;
      background: #fff5f5;
      padding: 8px 10px;
      margin: 0 0 12px;
    }
    .flag-label {
      font-family: Arial, sans-serif;
      font-size: 8.5pt;
      color: #9f1239;
      font-weight: 700;
      margin-bottom: 6px;
    }
    body.hide-flags .flag { border: none; background: transparent; padding: 0; }
    body.hide-flags .flag-label { display: none; }
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
    ${PRINT_CHROME_CSS}
  </style>
</head>
<body class="${includeWarnings ? '' : 'hide-flags'}">
  ${printChrome({ flagsToggle: true, flagsOn: includeWarnings })}
  <div class="sheet">
    ${photoHtml}
    <p class="transcript-label">Editable transcript</p>
    ${captionHtml}
    ${sectionsHtml}
    <div class="meta">LexMorph Defense Studio · ${esc(ast.jurisdiction)} · Not legal advice</div>
  </div>
</body>
</html>`;

  printHtmlDocument(html);
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
    .sheet { max-width: 7.5in; margin: 0 auto; padding: 18px; }
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
    ${PRINT_CHROME_CSS}
  </style>
</head>
<body>
  ${printChrome()}
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
        ${esc(pleading.caption.documentTitle || pleading.title || 'ANSWER DRAFT')}
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
</body>
</html>`;

  printHtmlDocument(html);
}
