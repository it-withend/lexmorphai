import { NextRequest, NextResponse } from 'next/server';
import { simulateHearingTurn } from '@/lib/ai-pipeline';
import { clientKeyFromRequest, rateLimit } from '@/lib/rate-limit';

interface SimulationRequest {
  history?: Array<{ speaker: 'judge' | 'user'; text: string }>;
  userResponse?: string;
  caseContext?: string;
  scenarioId?: string;
}

const DEFAULT_CASE_CONTEXT =
  'NYC nonpayment eviction where landlord served a defective 3-day notice instead of the mandatory 14-day notice under RPAPL § 711(2), and the apartment suffered heat and hot water outages.';

/** Hard ground truth the coach must never contradict. */
const NOTICE_GUARDRAILS = `
CRITICAL LEGAL GROUND TRUTH (never contradict):
- In New York nonpayment summary proceedings, RPAPL § 711(2) requires a written rent demand of at least FOURTEEN (14) days.
- A 3-day or 5-day rent demand is DEFECTIVE for NY nonpayment jurisdiction — never tell the tenant a 3-day notice is enough, valid, or required.
- If the tenant claims a short notice is fine, SCORE LOW and correct them toward the 14-day rule.
- Habitability (RPL § 235-b) cannot be waived by "AS IS" lease language.
- Educational coaching only — not legal advice; never guarantee case outcomes.
`;

const SHORT_NOTICE_OK =
  /(3[\s-]?day|three[\s-]?day).{0,40}(enough|valid|legal|sufficient|proper|fine|ok|okay)|((enough|valid|legal|sufficient).{0,40}(3[\s-]?day|three[\s-]?day))/i;
const REJECTS_SHORT_NOTICE =
  /not (the )?(required|enough|valid|legal)|instead of|defective|dismiss|fourteen|14[\s-]?day|711/;

function applyNoticeGuardrails(
  result: {
    score: number;
    praise: string;
    criticism: string;
    suggestedLegalRefinement: string;
    judgeReply: string;
    model?: string;
  },
  userResponse: string,
  caseContext: string
) {
  const user = userResponse.toLowerCase();
  // Never scan caseContext — it always mentions the defective 3-day notice.
  const aiOut = `${result.praise}\n${result.criticism}\n${result.suggestedLegalRefinement}\n${result.judgeReply}`;
  const userCites14 = /14[\s-]?day|fourteen|711|jurisdiction|defective/.test(user);
  const userAffirmsShort = SHORT_NOTICE_OK.test(user) && !REJECTS_SHORT_NOTICE.test(user);
  const aiAffirmsShort = SHORT_NOTICE_OK.test(aiOut) && !REJECTS_SHORT_NOTICE.test(aiOut.toLowerCase());

  const isNyNoticeCase = /711|14[\s-]?day|nonpayment|new york|nyc/i.test(caseContext);

  if (isNyNoticeCase && userAffirmsShort && !userCites14) {
    return {
      ...result,
      score: Math.min(result.score, 35),
      criticism:
        'Important correction: for NY nonpayment, a 3-day demand is not a valid predicate notice. RPAPL § 711(2) requires at least 14 days.',
      suggestedLegalRefinement:
        'Your Honor, Petitioner served only a short-day demand. Under RPAPL § 711(2), a written rent demand of no less than fourteen days is required; I move to dismiss for lack of a valid predicate notice.',
      judgeReply:
        'Counsel, the court will not treat a three-day demand as satisfying RPAPL § 711(2). Tenant, restate your jurisdictional objection citing the fourteen-day requirement.',
      praise: result.praise || 'You spoke up — now lock the answer to the fourteen-day statute.',
    };
  }

  if (isNyNoticeCase && aiAffirmsShort) {
    return {
      ...result,
      criticism:
        result.criticism ||
        'Keep the record on the 14-day written demand. A short-day notice is not a valid NY nonpayment predicate.',
      suggestedLegalRefinement:
        'Your Honor, Petitioner served only a short-day demand. Under RPAPL § 711(2), a written rent demand of no less than fourteen days is required; I move to dismiss for lack of a valid predicate notice.',
      judgeReply:
        result.judgeReply.includes('711')
          ? result.judgeReply
          : 'That jurisdictional point is on the record. Counselor, produce the predicate notice. Tenant, anything else before I hear the landlord?',
    };
  }

  if (isNyNoticeCase && userCites14) {
    return {
      ...result,
      score: Math.max(result.score, 88),
    };
  }

  return result;
}

export async function POST(req: NextRequest) {
  try {
    const rl = rateLimit(`simulate:${clientKeyFromRequest(req)}`, 30, 60_000);
    if (!rl.ok) {
      return NextResponse.json(
        { success: false, error: `Too many requests. Try again in ${rl.retryAfterSec}s.` },
        { status: 429 }
      );
    }

    let body: SimulationRequest;
    try {
      body = (await req.json()) as SimulationRequest;
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 });
    }

    const history = Array.isArray(body.history) ? body.history : [];
    const userResponse = typeof body.userResponse === 'string' ? body.userResponse.trim() : '';
    if (!userResponse) {
      return NextResponse.json(
        { success: false, error: 'userResponse is required (non-empty string)' },
        { status: 400 }
      );
    }
    if (userResponse.length > 4000) {
      return NextResponse.json(
        { success: false, error: 'Answer is too long (max 4000 characters).' },
        { status: 400 }
      );
    }

    const caseContext = (body.caseContext || DEFAULT_CASE_CONTEXT).slice(0, 8000);

    const aiResult = await simulateHearingTurn(
      history,
      userResponse,
      `${caseContext}\n\n${NOTICE_GUARDRAILS}`
    );

    if (aiResult) {
      const guarded = applyNoticeGuardrails(aiResult, userResponse, caseContext);
      return NextResponse.json({
        success: true,
        ...guarded,
        source: 'ai',
        model: aiResult.model,
      });
    }

    // Smart heuristic fallback
    const lower = userResponse.toLowerCase();
    let score = 70;
    let praise = 'You identified yourself clearly and spoke respectfully to the court.';
    let criticism = 'Be sure to explicitly cite the controlling statute by number.';
    let suggestedLegalRefinement =
      'Your Honor, I move to dismiss this proceeding for lack of jurisdiction because Petitioner failed to serve a valid 14-day written demand as required by RPAPL § 711(2).';
    let judgeReply =
      'I see. Counselor, do you have a copy of the rent demand you served? And tenant, did you receive this notice by certified mail or personal service?';

    if (lower.includes('14') || lower.includes('711') || lower.includes('jurisdiction') || lower.includes('defect')) {
      score = 96;
      praise =
        "Excellent. You immediately raised the 14-day notice requirement — that goes directly to the court's jurisdiction over this proceeding.";
      criticism = 'Also be prepared to show the exact envelope or affidavit of service, or lack thereof.';
      suggestedLegalRefinement =
        'Under RPAPL § 711(2), an unequivocal written demand for rent of no less than fourteen days is a strict condition precedent. Without it, this court lacks subject matter jurisdiction.';
      judgeReply =
        'That is a serious jurisdictional defect if true. Counselor, let me see the predicate notice. Tenant, what condition was the apartment in during the alleged arrears period?';
    } else if (
      lower.includes('heat') ||
      lower.includes('water') ||
      lower.includes('repair') ||
      lower.includes('habitability') ||
      lower.includes('235')
    ) {
      score = 88;
      praise =
        'Good — raising warranty of habitability is a strong counterclaim and can reduce or eliminate any rent owed.';
      criticism = 'Request a specific abatement percentage — courts need a number to work with.';
      suggestedLegalRefinement =
        'Your Honor, I counterclaim for breach of the warranty of habitability under RPL § 235-b and request a 50% rent abatement for the period of the violations.';
      judgeReply =
        'I am ordering an expedited HPD inspection. What written records do you have of notifying the landlord about these conditions?';
    } else if (lower.includes('fee') || lower.includes('late') || lower.includes('238') || lower.includes('added rent')) {
      score = 85;
      praise = 'Correct to challenge the late fees — NY law prohibits collecting them in a summary nonpayment proceeding.';
      criticism = 'State the exact dollar amount and the correct statute.';
      suggestedLegalRefinement =
        'Under NY RPL § 238-a(2) and RPAPL § 702, late charges and legal fees may not be included as rent in this proceeding. I request they be stricken.';
      judgeReply =
        'Counselor, are you including non-rent charges in your petition? I need to see an itemized breakdown. Tenant, how much of the claimed amount is base rent vs. fees?';
    } else if (
      lower.includes('1950.5') ||
      lower.includes('non-refundable') ||
      lower.includes('nonrefundable') ||
      lower.includes('deposit') ||
      lower.includes('ab 12')
    ) {
      score = 90;
      praise =
        'Clear statutory framing — naming Civil Code § 1950.5 / deposit caps shows you know the controlling rule.';
      criticism = 'State the exact dollar overcharge and the remedy you want (refund / penalty / strike clause).';
      suggestedLegalRefinement =
        'Under California Civil Code § 1950.5, a security deposit may not be characterized as nonrefundable, and residential deposits are generally capped at one month’s rent. I request return of the unlawful portion and any statutory remedies for bad-faith withholding.';
      judgeReply =
        'Understood. Landlord counsel, respond to the § 1950.5 point. Tenant, do you have the lease page that says “non-refundable,” and proof of what you paid?';
    } else if (lower.includes('jury') || lower.includes('waiver') || lower.includes('public policy')) {
      score = 84;
      praise = 'Challenging a jury waiver as against public policy is a coherent California consumer/tenant theme.';
      criticism = 'Tie it to a concrete ask: do not enforce that clause / sever it from the lease.';
      suggestedLegalRefinement =
        'Your Honor, the jury-trial waiver in this residential lease is void as against public policy and should not be enforced.';
      judgeReply =
        'Noted. We will take the waiver issue under advisement. Anything else unlawful in the lease you want on the record today?';
    } else if (/(3[\s-]?day|three day).{0,30}(enough|valid|legal|fine|ok)/i.test(lower) || /3[\s-]?day (is|notice is) (enough|valid)/i.test(lower)) {
      score = 28;
      praise = 'You tried to address the notice — but the conclusion is legally backwards for NY nonpayment.';
      criticism =
        'Do not argue that a 3-day notice is enough. Under RPAPL § 711(2) the demand must be at least 14 days.';
      suggestedLegalRefinement =
        'Your Honor, a three-day demand does not satisfy RPAPL § 711(2). I move to dismiss because Petitioner failed to serve a fourteen-day written rent demand.';
      judgeReply =
        'Tenant, the court will not accept a three-day demand as jurisdictional for nonpayment. Reframe using the fourteen-day requirement.';
    }

    const heuristic = applyNoticeGuardrails(
      { score, praise, criticism, suggestedLegalRefinement, judgeReply },
      userResponse,
      caseContext
    );

    return NextResponse.json({
      success: true,
      ...heuristic,
      source: 'heuristic',
    });
  } catch (err: unknown) {
    console.error('API /simulate error:', err);
    const message = err instanceof Error ? err.message : 'Simulation failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
