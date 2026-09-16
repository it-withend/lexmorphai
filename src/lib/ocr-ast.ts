import { DocumentAST, DocumentType } from './types';
import { enrichAstWithRules, matchStatutoryRules } from './apply-rules';

function detectDocumentType(text: string): DocumentType {
  const t = text.toLowerCase();
  // Court / eviction — only when clearly present
  if (
    /\b(notice to quit|rent demand|eviction|vacate|выселен|истеъфо)\b/i.test(text) ||
    t.includes('notice to quit') ||
    t.includes('rent demand')
  ) {
    return 'eviction_notice';
  }
  if (/\b(lease agreement|residential lease|ijara shartnomasi|договор аренды)\b/i.test(text)) {
    return 'residential_lease';
  }
  if (/\b(summons|appear in court|index no|исковое|судга чақирув)\b/i.test(text)) {
    return 'court_summons';
  }
  if (/\b(debt collection|amount due|past due|задолженн|қарз талаб)\b/i.test(text)) {
    return 'debt_demand';
  }
  return 'general_contract';
}

function detectJurisdiction(text: string): string {
  const t = text.toLowerCase();
  if (
    t.includes('самарқанд') ||
    t.includes('samarqand') ||
    t.includes('toshkent') ||
    t.includes('тошкент') ||
    t.includes('o‘zbek') ||
    t.includes('ozbek') ||
    t.includes('uzbekistan') ||
    t.includes('ўзбекистон') ||
    t.includes('мчж') ||
    t.includes('mchj') ||
    t.includes('+998')
  ) {
    if (t.includes('самарқанд') || t.includes('samarqand')) return 'Uzbekistan (Samarkand)';
    if (t.includes('toshkent') || t.includes('тошкент')) return 'Uzbekistan (Tashkent)';
    return 'Uzbekistan';
  }
  if (t.includes('kings county') || t.includes('brooklyn')) return 'New York (Kings County)';
  if (t.includes('new york') || t.includes('nyc') || t.includes('housing court')) return 'New York';
  if (t.includes('los angeles') || t.includes('santa monica')) return 'California (Los Angeles)';
  if (t.includes('california') || t.includes('cal. civ')) return 'California';
  return 'Unknown jurisdiction';
}

function isUsJurisdiction(jurisdiction: string): boolean {
  return /new york|california|united states|kings county|los angeles/i.test(jurisdiction);
}

function looksLikeCourtCaption(text: string): boolean {
  return /\b(court|суд|index no|plaintiff|defendant|истец|жавобгар|against)\b/i.test(text);
}

function extractAmount(text: string): string | undefined {
  const m = text.match(/(?:\$|USD|сўм|сум|UZS)\s?[\d\s,]+(?:\.\d{2})?/i);
  return m?.[0]?.replace(/\s+/g, ' ').trim();
}

function guessTitle(type: DocumentType, lines: string[]): string {
  const header = lines.find((l) => l.length > 8 && l.length < 140) || '';
  if (type === 'general_contract' && header) return header.slice(0, 120);
  switch (type) {
    case 'eviction_notice':
      return 'Rent Demand / Notice to Vacate';
    case 'residential_lease':
      return 'Residential Lease Agreement';
    case 'court_summons':
      return 'Court Summons';
    case 'debt_demand':
      return 'Debt Collection Demand';
    default:
      return header || 'Reconstructed Document';
  }
}

/**
 * Faithful reconstruction from OCR — preserves original language, no invented court forms.
 */
export function buildAstFromOcrText(rawText: string, imageUrl?: string): DocumentAST {
  const cleaned = rawText.replace(/\r/g, '').trim();
  if (!cleaned || cleaned.length < 20) {
    throw new Error('Could not read enough text from this photo. Try a clearer image or a demo sample.');
  }

  const documentType = detectDocumentType(cleaned);
  const jurisdiction = detectJurisdiction(cleaned);
  const lines = cleaned
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  // Keep line breaks — do not smash into one English-looking blob
  const sections: DocumentAST['sections'] = lines.slice(0, 40).map((content, i) => ({
    id: `ocr_sec_${i + 1}`,
    type: (i < 3 ? 'header' : 'paragraph') as 'header' | 'paragraph',
    content,
  }));

  // Only apply US statutory rules when the document is actually US-scoped
  const defects = isUsJurisdiction(jurisdiction) ? matchStatutoryRules(cleaned) : [];

  for (const defect of defects) {
    const idx = sections.findIndex((s) =>
      s.content.toLowerCase().includes(defect.originalExcerpt.slice(0, 12).toLowerCase())
    );
    if (idx >= 0) {
      sections[idx] = { ...sections[idx], redFlagId: defect.id };
    }
  }

  const claimAmount = extractAmount(cleaned);
  const includeCaption =
    (documentType === 'court_summons' || documentType === 'eviction_notice') &&
    looksLikeCourtCaption(cleaned);

  const base: DocumentAST = {
    id: `ocr_${Date.now()}`,
    title: guessTitle(documentType, lines),
    documentType,
    jurisdiction,
    originalImageUrl: imageUrl,
    caption: includeCaption
      ? {
          courtName: '',
          countyOrDistrict: jurisdiction,
          plaintiff: '',
          defendant: '',
          indexNumber: '',
          documentTitle: guessTitle(documentType, lines),
        }
      : undefined,
    metadata: {
      dateIssued: '',
      deadlineDate: '',
      daysRemaining: 0,
      claimAmount,
      propertyAddress: undefined,
    },
    sections,
    defects,
    audit: {
      defenseViabilityScore: defects.length ? 70 : 40,
      viabilityGrade: defects.length ? 'Moderate Defense' : 'Review Needed',
      summaryHeadline: isUsJurisdiction(jurisdiction)
        ? ''
        : 'Document reconstructed from OCR. Original language preserved. Review and edit any misread lines before relying on this text.',
      keyFindings: isUsJurisdiction(jurisdiction)
        ? []
        : [
            'This does not appear to be a US court filing — no US statutory rules were auto-applied.',
            'Edit any OCR mistakes directly in the living document canvas.',
          ],
      actionSteps: [
        {
          stepNumber: 1,
          title: 'Correct OCR mistakes',
          deadline: 'Now',
          description: 'Click any line in the living document and fix text that does not match the photo.',
          urgent: true,
        },
        {
          stepNumber: 2,
          title: 'Download Word (.docx)',
          deadline: 'Today',
          description: 'Export the corrected text as an editable Word file — this is the reliable editable output.',
          urgent: false,
        },
        {
          stepNumber: 3,
          title: 'Print / Save PDF cleanly',
          deadline: 'When needed',
          description: 'Use Print Document — it opens a clean page with only the letter, not the website chrome.',
          urgent: false,
        },
      ],
    },
  };

  return isUsJurisdiction(jurisdiction) ? enrichAstWithRules(base, cleaned) : base;
}
