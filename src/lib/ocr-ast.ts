import { DocumentAST, DocumentType } from './types';
import { enrichAstWithRules, matchStatutoryRules } from './apply-rules';

function detectDocumentType(text: string): DocumentType {
  const t = text.toLowerCase();
  if (t.includes('notice to quit') || t.includes('rent demand') || t.includes('eviction') || t.includes('vacate')) {
    return 'eviction_notice';
  }
  if (t.includes('lease agreement') || t.includes('residential lease') || t.includes('landlord and tenant')) {
    return 'residential_lease';
  }
  if (t.includes('summons') || t.includes('appear in court') || t.includes('index no')) {
    return 'court_summons';
  }
  if (t.includes('debt') || t.includes('collection') || t.includes('amount due') || t.includes('past due')) {
    return 'debt_demand';
  }
  return 'general_contract';
}

function detectJurisdiction(text: string): string {
  const t = text.toLowerCase();
  if (t.includes('kings county') || t.includes('brooklyn')) return 'New York (Kings County)';
  if (t.includes('new york') || t.includes('nyc') || t.includes('housing court')) return 'New York';
  if (t.includes('los angeles') || t.includes('santa monica')) return 'California (Los Angeles)';
  if (t.includes('california') || t.includes('cal. civ')) return 'California';
  return 'United States';
}

function extractAmount(text: string): string | undefined {
  const m = text.match(/\$\s?[\d,]+(?:\.\d{2})?/);
  return m?.[0]?.replace(/\s/g, '');
}

function extractAddress(text: string): string | undefined {
  const m = text.match(/\d{1,5}\s+[A-Za-z0-9.'\- ]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Place|Pl|Court|Ct)\.?[^\n]{0,40}/i);
  return m?.[0]?.trim();
}

function guessTitle(type: DocumentType, firstLine: string): string {
  if (firstLine && firstLine.length > 8 && firstLine.length < 120) return firstLine;
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
      return 'Reconstructed Legal Document';
  }
}

/**
 * Build a fully editable DocumentAST from OCR text + statutory rules.
 * Works with zero cloud AI keys — the free offline reconstruction path.
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

  const paragraphs: string[] = [];
  let buffer = '';
  for (const line of lines) {
    if (line.length < 40 && buffer) {
      paragraphs.push(buffer.trim());
      buffer = line;
    } else {
      buffer = buffer ? `${buffer} ${line}` : line;
    }
  }
  if (buffer) paragraphs.push(buffer.trim());

  const chunks = paragraphs.length > 0 ? paragraphs : [cleaned];
  const defects = matchStatutoryRules(cleaned);

  const sections = chunks.slice(0, 24).map((content, i) => {
    const hit = defects.find((d) =>
      content.toLowerCase().includes(d.originalExcerpt.slice(0, 20).toLowerCase())
    );
    return {
      id: `ocr_sec_${i + 1}`,
      type: (i === 0 ? 'header' : 'paragraph') as 'header' | 'paragraph',
      title: i === 0 ? 'Document Header' : `Section ${i}`,
      content,
      redFlagId: hit?.id,
    };
  });

  // Ensure every defect has at least one linked section
  for (const defect of defects) {
    if (!sections.some((s) => s.redFlagId === defect.id)) {
      const idx = sections.findIndex((s) =>
        s.content.toLowerCase().includes(defect.originalExcerpt.slice(0, 12).toLowerCase())
      );
      if (idx >= 0) sections[idx] = { ...sections[idx], redFlagId: defect.id };
    }
  }

  const claimAmount = extractAmount(cleaned);
  const propertyAddress = extractAddress(cleaned);
  const firstLine = lines[0] || '';

  const base: DocumentAST = {
    id: `ocr_${Date.now()}`,
    title: guessTitle(documentType, firstLine),
    documentType,
    jurisdiction,
    originalImageUrl: imageUrl,
    caption: {
      courtName: jurisdiction.includes('New York') ? 'Civil Court of the City of New York' : 'Local Civil Court',
      countyOrDistrict: jurisdiction,
      plaintiff: 'As stated in document',
      defendant: 'Tenant / Recipient',
      indexNumber: 'TBD',
      documentTitle: guessTitle(documentType, firstLine),
    },
    metadata: {
      dateIssued: new Date().toISOString().slice(0, 10),
      deadlineDate: '',
      daysRemaining: 0,
      claimAmount,
      propertyAddress,
    },
    sections,
    defects,
    audit: {
      defenseViabilityScore: 50,
      viabilityGrade: 'Review Needed',
      summaryHeadline: '',
      keyFindings: [],
      actionSteps: [],
    },
  };

  return enrichAstWithRules(base, cleaned);
}
