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
      ? 'Server AI is off — built-in rules still work. Organizers: set GROQ_API_KEY on Vercel and redeploy.'
      : groqProbe?.ok
        ? 'Server AI is on — visitors do not need their own API key.'
        : 'Server AI key is set but not responding — check the key and redeploy.',
  });
}
