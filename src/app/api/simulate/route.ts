import { NextRequest, NextResponse } from 'next/server';
import { simulateHearingTurn } from '@/lib/gemini';

interface SimulationRequest {
  history: Array<{ speaker: 'judge' | 'user'; text: string }>;
  userResponse: string;
  caseContext?: string;
  apiKey?: string;
  groqApiKey?: string;
}

const DEFAULT_CASE_CONTEXT =
  'NYC nonpayment eviction where landlord served a defective 3-day notice instead of the mandatory 14-day notice under RPAPL § 711(2), and the apartment suffered heat and hot water outages.';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as SimulationRequest;
    const { history, userResponse, caseContext, apiKey, groqApiKey } = body;

    // Try real AI (Gemini → Groq free vision/text)
    const aiResult = await simulateHearingTurn(
      history,
      userResponse,
      caseContext || DEFAULT_CASE_CONTEXT,
      apiKey,
      groqApiKey
    );

    if (aiResult) {
      return NextResponse.json({
        success: true,
        ...aiResult,
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
      praise = 'Excellent. You immediately raised the 14-day notice requirement — that goes directly to the court\'s jurisdiction over this proceeding.';
      criticism = 'Also be prepared to show the exact envelope or affidavit of service, or lack thereof.';
      suggestedLegalRefinement = 'Under RPAPL § 711(2), an unequivocal written demand for rent of no less than fourteen days is a strict condition precedent. Without it, this court lacks subject matter jurisdiction.';
      judgeReply = 'That is a serious jurisdictional defect if true. Counselor, let me see the predicate notice. Tenant, what condition was the apartment in during the alleged arrears period?';
    } else if (lower.includes('heat') || lower.includes('water') || lower.includes('repair') || lower.includes('habitability') || lower.includes('235')) {
      score = 88;
      praise = 'Good — raising warranty of habitability is a strong counterclaim and can reduce or eliminate any rent owed.';
      criticism = 'Request a specific abatement percentage — courts need a number to work with.';
      suggestedLegalRefinement = 'Your Honor, I counterclaim for breach of the warranty of habitability under RPL § 235-b and request a 50% rent abatement for the period of the violations.';
      judgeReply = 'I am ordering an expedited HPD inspection. What written records do you have of notifying the landlord about these conditions?';
    } else if (lower.includes('fee') || lower.includes('late') || lower.includes('238') || lower.includes('added rent')) {
      score = 85;
      praise = 'Correct to challenge the late fees — NY law prohibits collecting them in a summary nonpayment proceeding.';
      criticism = 'State the exact dollar amount and the correct statute.';
      suggestedLegalRefinement = 'Under NY RPL § 238-a(2) and RPAPL § 702, late charges and legal fees may not be included as rent in this proceeding. I request they be stricken.';
      judgeReply = 'Counselor, are you including non-rent charges in your petition? I need to see an itemized breakdown. Tenant, how much of the claimed amount is base rent vs. fees?';
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
    }

    return NextResponse.json({
      success: true,
      score,
      praise,
      criticism,
      suggestedLegalRefinement,
      judgeReply,
      source: 'heuristic',
    });
  } catch (err: unknown) {
    console.error('API /simulate error:', err);
    const message = err instanceof Error ? err.message : 'Simulation failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
