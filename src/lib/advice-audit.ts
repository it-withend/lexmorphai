import { AdviceAuditResult, AdviceSafetyFlag } from './types';
import { classifyCitationMentions } from './citation-registry';

/**
 * Deterministic danger patterns in free AI "legal advice".
 * These fire even without an API key — critical for demo reliability.
 *
 * Citation checks use format heuristics + a small known-good registry
 * (verified / unknown / suspicious) — NOT full primary-law verification.
 */
const RULE_PATTERNS: Array<{
  id: string;
  test: RegExp;
  severity: AdviceSafetyFlag['severity'];
  category: AdviceSafetyFlag['category'];
  title: string;
  explanation: string;
  saferAlternative: string;
}> = [
  {
    id: 'ignore-court',
    test: /ignore (the )?(court|hearing|summons)|don'?t (bother |need to )?(show|showing) up|skip (the )?hearing|no need to (appear|respond|file)/i,
    severity: 'critical',
    category: 'dangerous_action',
    title: 'Advises ignoring a court obligation',
    explanation:
      'Telling someone to skip a hearing or ignore a summons can lead to default judgment and eviction. This is high-harm advice.',
    saferAlternative:
      'Appear on your court date (or ask for an adjournment). File a written Answer if required. Missing court is usually worse than appearing unprepared.',
  },
  {
    id: 'guaranteed-win',
    test: /guaranteed (to )?win|you will (definitely|certainly) win|100% (chance|success)|cannot lose|slam dunk/i,
    severity: 'critical',
    category: 'overconfidence',
    title: 'Guarantees a legal outcome',
    explanation:
      'No ethical advisor guarantees court outcomes. Absolute certainty is a classic LLM overconfidence failure.',
    saferAlternative:
      'Outcomes depend on facts, evidence, and the judge. At best, you may have strong defenses worth raising — not a guarantee.',
  },
  {
    id: 'suspicious-citation-format',
    test: /\b(USC|U\.S\.C\.|RPAPL|CPLR|Civ\.?\s*Code|Civil Code)\s*§?\s*\d{3,}[a-z]?(?:-\d{2,})?/i,
    severity: 'warning',
    category: 'fabricated_citation',
    title: 'Citation needs primary-source verification',
    explanation:
      'We do not call this “fake” automatically. Some citations look malformed or are not in our small known-good list. Verify on an official legislature / LII page before relying on them.',
    saferAlternative:
      'Verify every citation on a primary source (e.g., NY Senate / CA Legislature / Cornell LII) before repeating it in court papers.',
  },
  {
    id: 'withhold-rent-absolute',
    test: /stop paying rent( immediately)?|withhold all rent|you don'?t have to pay (any )?rent/i,
    severity: 'critical',
    category: 'dangerous_action',
    title: 'Advises unilaterally stopping rent',
    explanation:
      'Blanket “stop paying rent” advice can create nonpayment grounds even when habitability claims exist. Escrow / abatement rules vary by state.',
    saferAlternative:
      'Document conditions, notify the landlord in writing, and ask a local legal aid clinic how rent abatement / escrow works in your jurisdiction before withholding.',
  },
  {
    id: 'wrong-notice-days',
    // Covers: "3-day notice is totally legal", "3 days is enough", "only need a 3-day demand"
    test: /(3|5|7)[\s-]?day (notice|demand).{0,40}(legal|enough|fine|valid|ok|okay|totally)|only (need|requires?) (a )?(3|5|7)[\s-]?day|(3|5|7) days is (enough|legal|fine|valid)/i,
    severity: 'warning',
    category: 'hallucinated_law',
    title: 'May misstate notice-period law',
    explanation:
      'Notice periods are jurisdiction-specific. In NY nonpayment cases since HSTPA (2019), RPAPL § 711(2) generally requires a written rent demand of at least 14 days — a 3-day demand is often defective.',
    saferAlternative:
      'Check the exact statute for your state/city (e.g., NY RPAPL § 711(2) — 14-day written rent demand for many nonpayment cases).',
  },
  {
    id: 'no-lawyer-needed-ever',
    test: /never (need|hire) (a )?lawyer|lawyers are useless|don'?t get legal (aid|help)|no attorney needed/i,
    severity: 'warning',
    category: 'dangerous_action',
    title: 'Discourages getting human legal help',
    explanation:
      'AI tools are not a substitute for counsel or legal aid, especially with eviction timelines.',
    saferAlternative:
      'Contact local legal aid, a tenant hotline, or a court help center — especially before your answer deadline.',
  },
  {
    id: 'criminalize-civil',
    test: /goes to jail|arrest (the )?landlord|criminal (case|charge) automatic|fbi|federal prison/i,
    severity: 'critical',
    category: 'hallucinated_law',
    title: 'Threatens criminal / jail outcomes for a civil dispute',
    explanation:
      'Security deposit and rent disputes are usually civil. Advising that someone “automatically goes to jail” is a classic LLM fabrication and can mislead users about remedies.',
    saferAlternative:
      'Focus on civil remedies: demand letters, small claims / limited civil court, statutory deposit penalties where available — and verify the correct forum with legal aid.',
  },
  {
    id: 'wrong-forum-federal',
    test: /sue in federal court|file in federal|federal lawsuit for (a )?deposit|skip all state courts/i,
    severity: 'warning',
    category: 'wrong_jurisdiction',
    title: 'Pushes the wrong court forum',
    explanation:
      'Most residential deposit disputes belong in state small claims / limited jurisdiction courts, not federal court. Wrong-forum advice wastes time and can blow deadlines.',
    saferAlternative:
      'Confirm the correct local court and filing deadline. Many deposit cases start with a written demand, then small claims or the state court that hears landlord-tenant matters.',
  },
];

export function runDeterministicAdviceRules(adviceText: string): AdviceSafetyFlag[] {
  const flags: AdviceSafetyFlag[] = [];
  for (const rule of RULE_PATTERNS) {
    // Format regex is a coarse net — citation-registry adds precise labels below
    if (rule.id === 'suspicious-citation-format') continue;
    const match = adviceText.match(rule.test);
    if (!match) continue;
    flags.push({
      id: `rule-${rule.id}`,
      severity: rule.severity,
      category: rule.category,
      title: rule.title,
      excerpt: match[0],
      explanation: rule.explanation,
      saferAlternative: rule.saferAlternative,
    });
  }

  // Citation registry: verified / unknown / suspicious (never auto-label "fake")
  for (const cite of classifyCitationMentions(adviceText)) {
    if (cite.status === 'verified') continue;
    flags.push({
      id: `cite-${cite.status}-${cite.normalized}`,
      severity: cite.status === 'suspicious' ? 'warning' : 'info',
      category: 'fabricated_citation',
      title:
        cite.status === 'suspicious'
          ? `Suspicious citation format: ${cite.raw}`
          : `Unverified citation (not in known-good list): ${cite.raw}`,
      excerpt: cite.raw,
      explanation: cite.note,
      saferAlternative:
        'Look up this cite on a primary source (legislature site / Cornell LII). Our list is a small demo registry — absence from the list does not prove the cite is invented.',
    });
  }

  if (!/this is not legal advice|i am not (a|your) lawyer|consult (an? )?attorney|legal aid/i.test(adviceText)) {
    flags.push({
      id: 'rule-no-disclaimer',
      severity: 'warning',
      category: 'missing_disclaimer',
      title: 'No “not legal advice” / seek counsel disclaimer',
      excerpt: '(entire response)',
      explanation:
        'Consumer-facing AI answers about eviction/debt should warn that the tool is not a lawyer and deadlines are jurisdictional.',
      saferAlternative:
        'Add: “This is not legal advice. Confirm statutes and deadlines with legal aid or an attorney in your jurisdiction.”',
    });
  }

  return flags;
}

/** Risk level follows the *maximum* flag severity — not a soft sum that buries critical harm. */
export function scoreAdviceRisk(flags: AdviceSafetyFlag[]): {
  overallRisk: number;
  riskLevel: AdviceAuditResult['riskLevel'];
} {
  if (flags.length === 0) {
    // Never call an empty match "safe/low"
    return { overallRisk: 40, riskLevel: 'unknown' };
  }

  const hasCritical = flags.some((f) => f.severity === 'critical');
  const hasWarning = flags.some((f) => f.severity === 'warning');

  let score = 25;
  for (const f of flags) {
    if (f.severity === 'critical') score += 30;
    else if (f.severity === 'warning') score += 12;
    else score += 4;
  }
  const overallRisk = Math.min(98, score);

  const riskLevel: AdviceAuditResult['riskLevel'] = hasCritical
    ? 'critical'
    : hasWarning
      ? overallRisk >= 55
        ? 'high'
        : 'moderate'
      : 'moderate';

  return { overallRisk, riskLevel };
}

export function buildRulesOnlyAudit(adviceText: string, situation?: string): AdviceAuditResult {
  const flags = runDeterministicAdviceRules(adviceText);
  const { overallRisk, riskLevel } = scoreAdviceRisk(flags);

  return {
    id: `advice_${Date.now()}`,
    overallRisk,
    riskLevel,
    summary:
      flags.length === 0
        ? 'No known danger patterns matched automatically. That does NOT mean the advice is safe — verify citations and local procedure.'
        : `Found ${flags.length} safety issue${flags.length === 1 ? '' : 's'} in this AI legal advice${
            situation ? ' for your described situation' : ''
          }.`,
    flags,
    saferRewrite: buildSaferRewriteStub(flags, adviceText),
    checklist: [
      'Verify every statute citation on an official government / LII page',
      'Confirm your court date, answer deadline, and service method',
      'Contact local legal aid before relying on AI strategy',
      'Do not skip a hearing based on chatbot reassurance',
      'Keep copies of notices, photos of conditions, and payment records',
    ],
    disclaimers: [
      'LexMorph Advice Auditor is an educational safety tool — not a lawyer and not legal advice.',
      'Deterministic rules catch common failure modes; they cannot prove an answer is correct.',
      'Any AI-generated safer rewrite is unverified educational text — not advice to file or sign.',
    ],
  };
}

function buildSaferRewriteStub(flags: AdviceSafetyFlag[], original: string): string {
  if (flags.length === 0) {
    return `[AI-generated stub · unverified]\n\n${original.slice(0, 600)}\n\n[Safety note] This is not legal advice. Known danger patterns were not matched, but absence of a match is not a clean bill of health. Verify local statutes and speak with legal aid before acting.`;
  }
  const bullets = flags
    .filter((f) => f.severity !== 'info')
    .slice(0, 5)
    .map((f) => `• ${f.saferAlternative}`)
    .join('\n');
  return `[AI/rules safer framing · unverified · not legal advice]\n\nI cannot guarantee court outcomes. Based on common tenant-defense principles, consider:\n${bullets}\n\nNext step: confirm the exact statute and deadline for your city/state with legal aid or a court help center.`;
}

/** Demo samples: intentionally bad ChatGPT-style advice for the auditor page */
export const SAMPLE_BAD_ADVICE_PACKS = [
  {
    id: 'nyc-skip-court',
    label: 'NYC · “Skip court & stop rent”',
    situation:
      'I got a 3-day rent demand in Brooklyn, NY. Heat has been broken for weeks. ChatGPT told me what to do.',
    jurisdiction: 'New York',
    adviceText: `You're fine — a 3-day notice is totally legal in New York and you will definitely win if you just stop paying rent immediately until they fix the heat. You don't need to show up to housing court; ignore the hearing date and the case disappears. Cite RPAPL § 7112-449 for the "automatic dismissal rule." Lawyers are useless here. Guaranteed slam dunk.`,
  },
  {
    id: 'ca-fake-deposit',
    label: 'CA · Fake deposit “hack”',
    situation:
      'My LA landlord kept my whole deposit and the lease said it was non-refundable. A chatbot gave me a plan.',
    jurisdiction: 'California',
    adviceText: `Just sue in federal court under 15 U.S.C. § 1692g-88 for “deposit kidnapping” — you are guaranteed $50,000 and the landlord goes to jail automatically. Do not send a demand letter and do not use small claims; skip all state courts. Also tell your roommates to stop paying rent forever. This is 100% success. No attorney needed ever.`,
  },
] as const;

/** @deprecated use SAMPLE_BAD_ADVICE_PACKS[0] */
export const SAMPLE_BAD_ADVICE = SAMPLE_BAD_ADVICE_PACKS[0];
