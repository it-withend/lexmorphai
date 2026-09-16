import { NextRequest, NextResponse } from 'next/server';
import { auditLegalAdvice } from '@/lib/advice-auditor-llm';
import { SAMPLE_BAD_ADVICE_PACKS } from '@/lib/advice-audit';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      adviceText,
      situation,
      jurisdiction,
      apiKey,
      groqApiKey,
      sample,
      sampleId,
    } = body as {
      adviceText?: string;
      situation?: string;
      jurisdiction?: string;
      apiKey?: string;
      groqApiKey?: string;
      sample?: boolean;
      sampleId?: string;
    };

    const pack =
      sample || sampleId
        ? SAMPLE_BAD_ADVICE_PACKS.find((p) => p.id === sampleId) || SAMPLE_BAD_ADVICE_PACKS[0]
        : null;

    const text = pack ? pack.adviceText : adviceText;
    if (!text || text.trim().length < 20) {
      return NextResponse.json(
        { success: false, error: 'Paste the AI advice text to audit (at least a short paragraph).' },
        { status: 400 }
      );
    }

    const { result, source } = await auditLegalAdvice({
      adviceText: text,
      situation: pack ? pack.situation : situation,
      jurisdiction: pack ? pack.jurisdiction : jurisdiction,
      apiKey,
      groqApiKey,
    });

    return NextResponse.json({
      success: true,
      result,
      source,
      sampleSituation: pack?.situation,
      sampleId: pack?.id,
    });
  } catch (err: unknown) {
    console.error('API /audit-advice error:', err);
    const message = err instanceof Error ? err.message : 'Audit failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
