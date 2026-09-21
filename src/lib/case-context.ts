import type { CounterPleading, DocumentAST } from './types';

const STUDIO_CTX_KEY = 'lexmorph_studio_case_context';
const ACTIVE_CTX_KEY = 'lexmorph_case_context';
const TITLE_KEY = 'lexmorph_case_title';

/** Build a coach-ready case brief from Studio AST (+ optional pleading). */
export function buildCaseContextFromAst(ast: DocumentAST, pleading?: CounterPleading | null): string {
  const defenses =
    pleading?.affirmativeDefenses
      ?.filter((d) => d.selected)
      .map((d) => `${d.defenseName} [${d.statutoryBasis}]`)
      .join('; ') ||
    ast.defects
      .slice(0, 4)
      .map((d) => `${d.title} [${d.citation}]`)
      .join('; ');

  return [
    `Jurisdiction: ${ast.jurisdiction}`,
    `Document: ${ast.title} (${ast.documentType})`,
    `Headline: ${ast.audit.summaryHeadline}`,
    `Key findings: ${(ast.audit.keyFindings || []).join('; ')}`,
    `Top defenses / defects: ${defenses}`,
    'Educational coaching only — not legal advice. Never guarantee outcomes.',
    'If New York nonpayment: RPAPL § 711(2) requires ≥14-day written rent demand; a 3-day demand is defective.',
  ]
    .filter(Boolean)
    .join('\n');
}

export function persistStudioCase(ast: DocumentAST, pleading?: CounterPleading | null): void {
  if (typeof window === 'undefined') return;
  try {
    const ctx = buildCaseContextFromAst(ast, pleading);
    sessionStorage.setItem(STUDIO_CTX_KEY, ctx);
    sessionStorage.setItem(ACTIVE_CTX_KEY, ctx);
    sessionStorage.setItem(TITLE_KEY, ast.title);
  } catch {
    /* ignore */
  }
}

/** Prefer Studio-carried context, then merge with scenario framing. */
export function getActiveCaseContext(scenarioContext: string): string {
  if (typeof window === 'undefined') return scenarioContext;
  try {
    const studio = sessionStorage.getItem(STUDIO_CTX_KEY) || '';
    if (studio.trim()) {
      return `${studio}\n\nScenario framing:\n${scenarioContext}`;
    }
    return sessionStorage.getItem(ACTIVE_CTX_KEY) || scenarioContext;
  } catch {
    return scenarioContext;
  }
}

export function getStudioCaseTitle(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return sessionStorage.getItem(TITLE_KEY);
  } catch {
    return null;
  }
}
