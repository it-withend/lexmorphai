import { NextRequest, NextResponse } from 'next/server';
import { analyzeLegalDocument, getSampleAst } from '@/lib/gemini';
import { SAMPLE_CASES } from '@/lib/samples';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
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
        { success: false, error: 'Provide an image or OCR text to analyze.' },
        { status: 400 }
      );
    }

    const result = await analyzeLegalDocument(imageBase64, rawText, apiKey, groqApiKey);
    return NextResponse.json({
      success: true,
      ast: result.ast,
      source: result.source,
      warning: result.warning,
    });
  } catch (err: unknown) {
    console.error('API /analyze error:', err);
    const message = err instanceof Error ? err.message : 'Analysis failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
