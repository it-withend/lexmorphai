import { NextRequest, NextResponse } from 'next/server';
import { generatePleadingWithAI } from '@/lib/ai-pipeline';
import { DocumentAST, CounterPleading } from '@/lib/types';
import { SAMPLE_CASES } from '@/lib/samples';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ast, tenantName, apiKey, groqApiKey } = body as {
      ast: DocumentAST;
      tenantName?: string;
      apiKey?: string;
      groqApiKey?: string;
    };

    if (!ast) {
      return NextResponse.json({ success: false, error: 'Document AST is required' }, { status: 400 });
    }

    const defendant = tenantName || (ast.caption ? ast.caption.defendant : 'RESPONDENT');

    // Check if this matches one of our rich sample cases first
    const matchingSample = SAMPLE_CASES.find((s) => s.ast.id === ast.id);
    if (matchingSample) {
      const pleading = JSON.parse(JSON.stringify(matchingSample.recommendedCounterPleading)) as CounterPleading;
      if (tenantName) {
        pleading.verificationBlock.declarantName = tenantName;
        pleading.caption.defendant = tenantName;
        pleading.generalDenial = pleading.generalDenial.replace(
          matchingSample.ast.caption?.defendant || '',
          tenantName
        );
      }
      return NextResponse.json({ success: true, pleading, source: 'sample' });
    }

    // Try AI generation (Gemini → Groq)
    const aiResult = await generatePleadingWithAI(
      JSON.stringify(ast, null, 2),
      defendant,
      apiKey,
      groqApiKey
    );

    if (aiResult) {
      try {
        const pleading = JSON.parse(aiResult) as CounterPleading;
        return NextResponse.json({ success: true, pleading, source: 'ai' });
      } catch {
        console.warn('Could not parse AI pleading JSON, using dynamic fallback');
      }
    }

    // Dynamic template fallback
    const plaintiff = ast.caption ? ast.caption.plaintiff : 'PETITIONER-LANDLORD';
    const courtName = ast.caption ? ast.caption.courtName : 'CIVIL COURT OF LAW';
    const county = ast.caption ? ast.caption.countyOrDistrict : ast.jurisdiction;
    const indexNo = ast.caption ? ast.caption.indexNumber : 'INDEX NO. PENDING';

    const affirmativeDefenses = ast.defects.map((d, index) => ({
      id: `def-dyn-${index + 1}`,
      defenseName: `${['First', 'Second', 'Third', 'Fourth', 'Fifth'][index] || `${index + 1}th`} Defense: ${d.title}`,
      statutoryBasis: d.citation,
      statement: `${d.recommendedDefense}. ${d.plainEnglishExplanation} Pursuant to ${d.citation}, respondent is entitled to: ${d.statutoryRemedy}.`,
      selected: true,
    }));

    const dynamicPleading: CounterPleading = {
      id: `pleading-${Date.now()}`,
      pleadingType: ast.documentType === 'residential_lease' ? 'cure_and_dispute_notice' : 'verified_answer',
      title:
        ast.documentType === 'residential_lease'
          ? 'FORMAL NOTICE OF UNLAWFUL PROVISIONS & DEMAND FOR STATUTORY COMPLIANCE'
          : 'VERIFIED ANSWER WITH AFFIRMATIVE DEFENSES & STATUTORY COUNTERCLAIMS',
      caption: {
        courtName,
        countyOrDistrict: county,
        plaintiff,
        defendant,
        indexNumber: indexNo,
        documentTitle: 'FORMAL VERIFIED ANSWER',
      },
      generalDenial: `Respondent ${defendant}, appearing pro se, hereby generally denies each and every allegation in the claims, preserving all statutory and procedural rights.`,
      affirmativeDefenses,
      counterclaims: [
        {
          title: 'Statutory Claim for Declaratory Relief and Civil Remedies',
          damagesClaimed: 'Full statutory damages and abatement permitted by law',
          factualBasis: 'The initiating document contains documented statutory defects and unenforceable clauses.',
        },
      ],
      demandForRelief: [
        '1. Immediate dismissal of the complaint/petition pursuant to governing procedural rules;',
        '2. Striking of all unlawful fees, penalties, and void clauses;',
        '3. An award of statutory civil damages and restitution of any unlawful surcharges;',
        '4. Such other and further relief as the Court deems equitable and just.',
      ],
      verificationBlock: {
        declarantName: defendant,
        penaltyOfPerjuryClause: `I, ${defendant}, declare under penalty of perjury under the laws of ${ast.jurisdiction} that I have read the foregoing document and the facts stated herein are true to the best of my knowledge.`,
        date: new Date().toISOString().split('T')[0],
        county,
        signatureStatus: 'electronically_signed',
      },
    };

    return NextResponse.json({ success: true, pleading: dynamicPleading, source: 'template' });
  } catch (err: unknown) {
    console.error('API /response error:', err);
    const message = err instanceof Error ? err.message : 'Pleading generation failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
