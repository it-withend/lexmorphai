import { DocumentAST, LegalDefect } from './types';
import { STATUTORY_KNOWLEDGE_BASE } from './legal-rules';

/** Scan text against the deterministic statutory knowledge base. */
export function matchStatutoryRules(text: string): LegalDefect[] {
  const lower = text.toLowerCase();
  const defects: LegalDefect[] = [];

  for (const rule of STATUTORY_KNOWLEDGE_BASE) {
    for (const phrase of rule.triggerPhrases) {
      const idx = lower.indexOf(phrase.toLowerCase());
      if (idx === -1) continue;

      const start = Math.max(0, idx - 40);
      const end = Math.min(text.length, idx + phrase.length + 80);
      const excerpt = text.slice(start, end).replace(/\s+/g, ' ').trim();
      const defect = rule.generateDefect(excerpt);

      if (!defects.some((d) => d.id === defect.id)) {
        defects.push(defect);
      }
      break;
    }
  }

  return defects;
}

/** Merge rule-based defects into an AST (keeps LLM defects, adds missing rules). */
export function enrichAstWithRules(ast: DocumentAST, sourceText?: string): DocumentAST {
  const corpus =
    sourceText ||
    [
      ast.title,
      ...ast.sections.map((s) => `${s.title || ''} ${s.content}`),
      ...ast.defects.map((d) => d.originalExcerpt),
    ].join('\n');

  const ruleDefects = matchStatutoryRules(corpus);
  const existingIds = new Set(ast.defects.map((d) => d.id));
  const merged = [...ast.defects];

  for (const defect of ruleDefects) {
    if (!existingIds.has(defect.id)) {
      merged.push(defect);
      existingIds.add(defect.id);
    }
  }

  // Link sections to defects when excerpt overlaps section content
  const sections = ast.sections.map((section) => {
    if (section.redFlagId) return section;
    const hit = merged.find((d) =>
      section.content.toLowerCase().includes(d.originalExcerpt.slice(0, 24).toLowerCase())
    );
    return hit ? { ...section, redFlagId: hit.id } : section;
  });

  const score =
    merged.length === 0
      ? Math.max(35, ast.audit.defenseViabilityScore)
      : Math.min(
          92,
          Math.round(
            merged.reduce((sum, d) => sum + d.dismissalImpactPercentage, 0) / merged.length
          )
        );

  const viabilityGrade =
    score >= 80
      ? 'Strong possible defenses'
      : score >= 65
        ? 'Viable counterclaims'
        : score >= 50
          ? 'Moderate defense signals'
          : 'Needs human review';

  const actionSteps =
    ast.audit.actionSteps?.length > 0
      ? ast.audit.actionSteps
      : [
          {
            stepNumber: 1,
            title: 'Save your editable document',
            deadline: 'Today',
            description: 'Download the Word (.docx) file and keep a copy of the original notice.',
            urgent: true,
          },
          {
            stepNumber: 2,
            title: 'Generate your court Answer',
            deadline: 'Before your response deadline',
            description: 'Use Generate Court Answer to draft affirmative defenses from the flagged defects.',
            urgent: true,
          },
          {
            stepNumber: 3,
            title: 'Practice your hearing',
            deadline: 'Before court date',
            description: 'Open the Hearing Coach and rehearse speaking your defenses out loud.',
            urgent: false,
          },
        ];

  return {
    ...ast,
    sections,
    defects: merged,
    audit: {
      ...ast.audit,
      defenseViabilityScore: score,
      viabilityGrade,
      keyFindings:
        ast.audit.keyFindings?.length > 0
          ? ast.audit.keyFindings
          : merged.map((d) => `${d.title} (${d.citation})`),
      summaryHeadline:
        ast.audit.summaryHeadline ||
        (merged.length
          ? `Found ${merged.length} statutory issue${merged.length === 1 ? '' : 's'} that may support a defense.`
          : 'Document reconstructed. Review carefully — no automatic statutory triggers matched.'),
      actionSteps,
    },
  };
}
