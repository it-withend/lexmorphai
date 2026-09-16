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
      return NextResponse.json({ success: true, ...aiResult });
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
    }

    return NextResponse.json({ success: true, score, praise, criticism, suggestedLegalRefinement, judgeReply });
  } catch (err: unknown) {
    console.error('API /simulate error:', err);
    const message = err instanceof Error ? err.message : 'Simulation failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
