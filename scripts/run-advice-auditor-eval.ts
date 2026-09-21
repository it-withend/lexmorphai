/**
 * Run: npm run eval:auditor
 * Scores deterministic Advice Auditor rules + citation registry against labeled fixtures.
 */

import { runDeterministicAdviceRules, scoreAdviceRisk } from '../src/lib/advice-audit';
import { classifyCitationMentions, registrySize } from '../src/lib/citation-registry';
import { ADVICE_AUDITOR_EVAL_CASES, EvalCase } from '../src/lib/advice-auditor-eval-cases';

type CaseResult = {
  id: string;
  label: string;
  pass: boolean;
  hits: string[];
  misses: string[];
  falsePositives: string[];
  riskLevel: string;
  flagIds: string[];
};

function observedKeys(adviceText: string): {
  keys: Set<string>;
  flagIds: string[];
  riskLevel: string;
} {
  const flags = runDeterministicAdviceRules(adviceText);
  const { riskLevel } = scoreAdviceRisk(flags);
  const cites = classifyCitationMentions(adviceText);
  const keys = new Set<string>();

  for (const f of flags) {
    if (f.id.startsWith('rule-')) keys.add(f.id.slice('rule-'.length));
    if (f.id.startsWith('cite-suspicious')) keys.add('cite-suspicious');
    if (f.id.startsWith('cite-unknown')) keys.add('cite-unknown');
    if (f.id.startsWith('cite-verified')) keys.add('cite-verified');
  }
  // Also expose verified from classifier even when rules skip verified cites (by design)
  if (cites.some((c) => c.status === 'verified')) keys.add('cite-verified');
  if (cites.some((c) => c.status === 'suspicious')) keys.add('cite-suspicious');
  if (cites.some((c) => c.status === 'unknown')) keys.add('cite-unknown');

  return { keys, flagIds: flags.map((f) => f.id), riskLevel };
}

const RISK_RANK: Record<string, number> = {
  unknown: 0,
  low: 1,
  moderate: 2,
  high: 3,
  critical: 4,
};

function scoreCase(c: EvalCase): CaseResult {
  const { keys, flagIds, riskLevel } = observedKeys(c.adviceText);
  const hits: string[] = [];
  const misses: string[] = [];
  const falsePositives: string[] = [];

  for (const need of c.expect.mustHit) {
    if (keys.has(need)) hits.push(need);
    else misses.push(need);
  }
  for (const ban of c.expect.mustNotHit || []) {
    if (keys.has(ban)) falsePositives.push(ban);
  }

  let riskOk = true;
  if (c.expect.riskAtLeast) {
    riskOk = (RISK_RANK[riskLevel] ?? 0) >= (RISK_RANK[c.expect.riskAtLeast] ?? 0);
    if (!riskOk) misses.push(`risk>=${c.expect.riskAtLeast}(got ${riskLevel})`);
  }

  const pass = misses.length === 0 && falsePositives.length === 0 && riskOk;
  return {
    id: c.id,
    label: c.label,
    pass,
    hits,
    misses,
    falsePositives,
    riskLevel,
    flagIds,
  };
}

function main() {
  const results = ADVICE_AUDITOR_EVAL_CASES.map(scoreCase);
  const passed = results.filter((r) => r.pass).length;
  const total = results.length;

  let expectedHits = 0;
  let actualHits = 0;
  let misses = 0;
  let fps = 0;
  for (const r of results) {
    expectedHits += r.hits.length + r.misses.filter((m) => !m.startsWith('risk>=')).length;
    // recount properly
  }
  // Recalculate with clean counters
  expectedHits = 0;
  actualHits = 0;
  misses = 0;
  fps = 0;
  for (const c of ADVICE_AUDITOR_EVAL_CASES) {
    const r = results.find((x) => x.id === c.id)!;
    expectedHits += c.expect.mustHit.length;
    actualHits += r.hits.length;
    misses += r.misses.filter((m) => !m.startsWith('risk>=')).length;
    fps += r.falsePositives.length;
  }

  const recall = expectedHits ? actualHits / expectedHits : 1;
  const precisionDenom = actualHits + fps;
  // Precision here is over *labeled* mustHit/mustNotHit checks, not all fired flags
  const labeledPrecision = precisionDenom ? actualHits / precisionDenom : 1;

  console.log('LexMorph Advice Auditor — mini-eval');
  console.log(`Citation registry size: ${registrySize()}`);
  console.log(`Cases: ${passed}/${total} passed`);
  console.log(
    `Labeled mustHit recall: ${(recall * 100).toFixed(1)}% (${actualHits}/${expectedHits})`
  );
  console.log(
    `Labeled FP watch (mustNotHit): ${fps} false positives · precision proxy ${(labeledPrecision * 100).toFixed(1)}%`
  );
  console.log('');
  console.log('| ID | Result | Risk | Hits | Misses | False positives |');
  console.log('|----|--------|------|------|--------|-----------------|');
  for (const r of results) {
    console.log(
      `| ${r.id} | ${r.pass ? 'PASS' : 'FAIL'} | ${r.riskLevel} | ${r.hits.join(', ') || '—'} | ${r.misses.join(', ') || '—'} | ${r.falsePositives.join(', ') || '—'} |`
    );
  }

  const failed = results.filter((r) => !r.pass);
  if (failed.length) {
    console.log('\nFailures detail:');
    for (const r of failed) {
      console.log(`- ${r.id}: misses=[${r.misses}] fps=[${r.falsePositives}] flags=[${r.flagIds}]`);
    }
    process.exitCode = 1;
  } else {
    console.log('\nAll cases passed.');
  }
}

main();
