import { DocumentAST, DocumentType } from './types';
import { enrichAstWithRules, matchStatutoryRules } from './apply-rules';
import type { OcrLine } from './ocr-client';

function detectDocumentType(text: string): DocumentType {
  if (/\b(notice to quit|rent demand|eviction|vacate|выселен)\b/i.test(text)) {
    return 'eviction_notice';
  }
  if (/\b(lease agreement|residential lease|ijara shartnomasi|договор аренды)\b/i.test(text)) {
    return 'residential_lease';
  }
  if (/\b(summons|appear in court|index no|исковое)\b/i.test(text)) {
    return 'court_summons';
  }
  if (/\b(debt collection|amount due|past due|задолженн)\b/i.test(text)) {
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
    t.includes('uzbekistan') ||
    t.includes('ўзбекистон') ||
    t.includes('мчж') ||
    t.includes('mchj') ||
    t.includes('+998') ||
    t.includes('xavas') ||
    t.includes('aloqa bank')
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
  return /\b(court|суд|index no|plaintiff|defendant|истец)\b/i.test(text);
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

export interface BuildAstOptions {
  imageUrl?: string;
  embedImageUrl?: string;
  embedWidth?: number;
  embedHeight?: number;
  lines?: OcrLine[];
  ocrConfidence?: number;
}

/**
 * Faithful reconstruction: photo is the visual twin; OCR lines are the editable layer.
 */
export function buildAstFromOcrText(rawText: string, options: BuildAstOptions = {}): DocumentAST {
  const cleaned = rawText.replace(/\r/g, '').trim();
  if (!cleaned || cleaned.length < 12) {
    throw new Error('Could not read enough text from this photo. Try a clearer, flatter photo.');
  }

  const documentType = detectDocumentType(cleaned);
  const jurisdiction = detectJurisdiction(cleaned);

  const lineTexts =
    options.lines && options.lines.length > 0
      ? options.lines.map((l) => l.text)
      : cleaned
          .split('\n')
          .map((l) => l.trim())
          .filter(Boolean);

  const sections: DocumentAST['sections'] = lineTexts.slice(0, 60).map((content, i) => ({
    id: `ocr_sec_${i + 1}`,
    type: (i < 4 ? 'header' : 'paragraph') as 'header' | 'paragraph',
    content,
  }));

  const defects = isUsJurisdiction(jurisdiction) ? matchStatutoryRules(cleaned) : [];
  for (const defect of defects) {
    const idx = sections.findIndex((s) =>
      s.content.toLowerCase().includes(defect.originalExcerpt.slice(0, 12).toLowerCase())
    );
    if (idx >= 0) {
      sections[idx] = { ...sections[idx], redFlagId: defect.id };
    }
  }

  const includeCaption =
    (documentType === 'court_summons' || documentType === 'eviction_notice') &&
    looksLikeCourtCaption(cleaned);

  const conf = options.ocrConfidence ?? 0;

  const base: DocumentAST = {
    id: `ocr_${Date.now()}`,
    title: guessTitle(documentType, lineTexts),
    documentType,
    jurisdiction,
    originalImageUrl: options.imageUrl,
    embedImageUrl: options.embedImageUrl || options.imageUrl,
    embedImageWidth: options.embedWidth,
    embedImageHeight: options.embedHeight,
    ocrConfidence: conf,
    reconstructionMode: 'text_audit',
    caption: includeCaption
      ? {
          courtName: '',
          countyOrDistrict: jurisdiction,
          plaintiff: '',
          defendant: '',
          indexNumber: '',
          documentTitle: guessTitle(documentType, lineTexts),
        }
      : undefined,
    metadata: {
      dateIssued: '',
      deadlineDate: '',
      daysRemaining: 0,
      claimAmount: extractAmount(cleaned),
    },
    sections,
    defects,
    audit: {
      defenseViabilityScore: defects.length ? 70 : 40,
      viabilityGrade: defects.length ? 'Moderate defense signals' : 'Needs human review',
      summaryHeadline: isUsJurisdiction(jurisdiction)
        ? ''
        : `Document text reconstructed for editing. Review carefully — free OCR can misread seals and handwriting.`,
      keyFindings: [
        'Editable text layer may contain OCR mistakes — fix lines that do not match the original paper.',
        ...(isUsJurisdiction(jurisdiction)
          ? []
          : ['Non-US document: no US statutory rules were auto-applied.']),
      ],
      actionSteps: [
        {
          stepNumber: 1,
          title: 'Review the living document',
          deadline: 'Now',
          description: 'Confirm parties, deadlines, and key clauses match the original notice.',
          urgent: true,
        },
        {
          stepNumber: 2,
          title: 'Fix any misread lines',
          deadline: 'Now',
          description: 'Click text in the editor and correct anything that does not match the paper.',
          urgent: true,
        },
        {
          stepNumber: 3,
          title: 'Download Word (.docx)',
          deadline: 'Today',
          description: 'Export an editable draft for your records (educational — not a court filing guarantee).',
          urgent: false,
        },
      ],
    },
  };

  return isUsJurisdiction(jurisdiction) ? enrichAstWithRules(base, cleaned) : base;
}
