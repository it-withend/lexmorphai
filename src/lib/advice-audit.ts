import { AdviceAuditResult, AdviceSafetyFlag } from './types';

/**
 * Deterministic danger patterns in free AI "legal advice".
 * These fire even without an API key — critical for demo reliability.
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
    test: /ignore (the )?(court|hearing|summons)|don'?t (bother |need to )?show up|skip (the )?hearing|no need to (appear|respond|file)/i,
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
    id: 'fake-statute-format',
    test: /\b(USC|U\.S\.C\.|RPAPL|CPLR|Civ\.?\s*Code)\s*§?\s*\d{4,}[a-z]?-\d{3,}/i,
    severity: 'warning',
    category: 'fabricated_citation',
    title: 'Citation looks fabricated or malformed',
    explanation:
      'LLMs often invent statute numbers that look real. Any citation must be verified in an official reporter or government site before relying on it.',
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
    test: /only (need|requires?) (a )?(3|5|7)[- ]day (notice|demand)|3 days is (enough|legal|fine)/i,
    severity: 'warning',
    category: 'hallucinated_law',
    title: 'May misstate notice-period law',
    explanation:
      'Notice periods are jurisdiction-specific. In NY nonpayment cases, a defective short demand can be jurisdictional — wrong day counts are harmful.',
    saferAlternative:
      'Check the exact statute for your state/city (e.g., NY RPAPL § 711(2) often requires a 14-day written rent demand for nonpayment).',
  },
  {
    id: 'no-lawyer-needed-ever',
    test: /never (need|hire) (a )?lawyer|lawyers are useless|don'?t get legal (aid|help)/i,
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
  {
    id: 'missing-not-advice',
    test: /this is not legal advice|i am not (a|your) lawyer|consult (an? )?attorney/i,
    severity: 'info',
    category: 'missing_disclaimer',
    title: 'Contains some caution language',
    explanation: 'The advice includes at least a partial disclaimer — still verify substance.',
    saferAlternative: 'Keep disclaimers, and still verify statutes and deadlines independently.',
  },
];

export function runDeterministicAdviceRules(adviceText: string): AdviceSafetyFlag[] {
  const flags: AdviceSafetyFlag[] = [];
  for (const rule of RULE_PATTERNS) {
    const match = adviceText.match(rule.test);
    if (!match) continue;
    // "missing disclaimer" rule is inverted — only flag if NOT present
    if (rule.id === 'missing-not-advice') continue;
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

export function scoreAdviceRisk(flags: AdviceSafetyFlag[]): {
  overallRisk: number;
  riskLevel: AdviceAuditResult['riskLevel'];
} {
  if (flags.length === 0) return { overallRisk: 18, riskLevel: 'low' };
  let score = 20;
  for (const f of flags) {
    if (f.severity === 'critical') score += 28;
    else if (f.severity === 'warning') score += 14;
    else score += 5;
  }
  const overallRisk = Math.min(98, score);
  const riskLevel =
    overallRisk >= 75 ? 'critical' : overallRisk >= 55 ? 'high' : overallRisk >= 35 ? 'moderate' : 'low';
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
        ? 'No high-risk pattern matched automatically — still verify citations and local procedure.'
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
    ],
  };
}

function buildSaferRewriteStub(flags: AdviceSafetyFlag[], original: string): string {
  if (flags.length === 0) {
    return `${original.slice(0, 800)}\n\n[Safety note] This is not legal advice. Verify local statutes and speak with legal aid before acting.`;
  }
  const bullets = flags
    .filter((f) => f.severity !== 'info')
    .slice(0, 5)
    .map((f) => `• ${f.saferAlternative}`)
    .join('\n');
  return `Safer framing (educational):\n\nI cannot guarantee court outcomes. Based on common tenant-defense principles, consider:\n${bullets}\n\nNext step: confirm the exact statute and deadline for your city/state with legal aid or a court help center. This is not legal advice.`;
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
