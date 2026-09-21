import { NextRequest, NextResponse } from 'next/server';
import { analyzeLegalDocument, getSampleAst } from '@/lib/ai-pipeline';
import { SAMPLE_CASES } from '@/lib/samples';
import {
  clientKeyFromRequest,
  MAX_ANALYZE_CHARS,
  rateLimit,
} from '@/lib/rate-limit';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const rl = rateLimit(`analyze:${clientKeyFromRequest(req)}`, 15, 60_000);
    if (!rl.ok) {
      return NextResponse.json(
        { success: false, error: `Rate limit exceeded. Retry in ~${rl.retryAfterSec}s.` },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { imageBase64, rawText, sampleId, apiKey, groqApiKey } = body;

    if (sampleId) {
      const sample = SAMPLE_CASES.find((s) => s.id === sampleId);
      if (!sample) {
        return NextResponse.json({ success: false, error: 'Unknown sample' }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        ast: getSampleAst(sampleId),
        source: 'sample',
      });
    }

    if (!imageBase64 && !rawText) {
      return NextResponse.json(
        { success: false, error: 'Provide document text to analyze, or open a curated demo sample.' },
        { status: 400 }
      );
    }

    if (typeof rawText === 'string' && rawText.length > MAX_ANALYZE_CHARS) {
      return NextResponse.json(
        { success: false, error: `Document text too long (max ${MAX_ANALYZE_CHARS} characters).` },
        { status: 400 }
      );
    }

    const result = await analyzeLegalDocument(imageBase64, rawText, apiKey, groqApiKey);
    return NextResponse.json({
      success: true,
      ast: result.ast,
      source: result.source,
      model: result.model,
      warning: result.warning,
    });
  } catch (err: unknown) {
    console.error('API /analyze error:', err);
    const message = err instanceof Error ? err.message : 'Analysis failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
