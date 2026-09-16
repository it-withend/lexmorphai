import { NextResponse } from 'next/server';
import { getServerGeminiKey, getServerGroqKey, probeGroq } from '@/lib/groq';

export const maxDuration = 30;

/**
 * Health check so UI / judges can see whether server AI keys work.
 * Does not expose key values.
 */
export async function GET() {
  const groqConfigured = Boolean(getServerGroqKey());
  const geminiConfigured = Boolean(getServerGeminiKey());

  let groqProbe: { ok: boolean; model?: string; error?: string } | null = null;
  if (groqConfigured) {
    groqProbe = await probeGroq(getServerGroqKey()!);
  }

  return NextResponse.json({
    success: true,
    groq: {
      configured: groqConfigured,
      live: groqProbe?.ok ?? false,
      model: groqProbe?.model,
      error: groqProbe?.error,
    },
    gemini: {
      configured: geminiConfigured,
      note: 'Optional; often requires Google billing. Groq is the primary free path.',
    },
    tip: !groqConfigured
      ? 'Set GROQ_API_KEY in Vercel → Settings → Environment Variables (Production + Preview), then Redeploy.'
      : groqProbe?.ok
        ? 'Groq is live — Studio paste, Hearing, and Auditor should use AI (not offline templates).'
        : 'GROQ_API_KEY is set but the ping failed — check the key and that the project was redeployed.',
  });
}
