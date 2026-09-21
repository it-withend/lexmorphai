/**
 * Shared Groq client — current free/production model IDs (Sep 2026).
 * qwen/qwen3.6-27b was removed; using gpt-oss + qwen3.8.
 */

import Groq from 'groq-sdk';

/** Fast JSON text models (prefer first). Order matters — try until one succeeds. */
export const GROQ_TEXT_MODELS = [
  'openai/gpt-oss-20b',
  'openai/gpt-oss-120b',
  'qwen/qwen3.8-27b',
  'qwen/qwen3.6-27b',
  'llama-3.1-8b-instant',
] as const;

/** Multimodal (image) models — Qwen 3.x on Groq accepts images */
export const GROQ_VISION_MODELS = ['qwen/qwen3.8-27b', 'qwen/qwen3.6-27b'] as const;

/** Prefer Vercel/server keys only — visitors never supply keys. */
export function getServerGroqKey(_clientKey?: string): string | undefined {
  return process.env.GROQ_API_KEY || undefined;
}

export function getServerGeminiKey(_clientKey?: string): string | undefined {
  return process.env.GEMINI_API_KEY || undefined;
}

export function cleanJson(text: string): string {
  return text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
}

export type GroqJsonResult = {
  text: string;
  model: string;
};

/**
 * Try chat completion across model list until one returns usable content.
 * Surfaces the last error if all fail.
 */
export async function groqChatJson(params: {
  apiKey: string;
  system: string;
  user: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;
  models?: readonly string[];
  temperature?: number;
  maxTokens?: number;
}): Promise<GroqJsonResult> {
  const groq = new Groq({ apiKey: params.apiKey });
  const models = params.models || GROQ_TEXT_MODELS;
  const errors: string[] = [];

  for (const model of models) {
    try {
      const completion = await groq.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: params.system },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          { role: 'user', content: params.user as any },
        ],
        temperature: params.temperature ?? 0.2,
        max_tokens: params.maxTokens ?? 4096,
        response_format: { type: 'json_object' },
        // gpt-oss reasoning models: keep answer in content, hide chain-of-thought
        ...(model.includes('gpt-oss')
          ? { reasoning_effort: 'low' as const, include_reasoning: false }
          : {}),
      });

      const msg = completion.choices[0]?.message;
      let text = (msg?.content || '').trim();

      // Some reasoning models put JSON only after thinking — also check refusal
      if (!text && typeof (msg as { reasoning?: string })?.reasoning === 'string') {
        const r = (msg as { reasoning: string }).reasoning;
        const jsonMatch = r.match(/\{[\s\S]*\}/);
        if (jsonMatch) text = jsonMatch[0];
      }

      if (!text) {
        errors.push(`${model}: empty content`);
        continue;
      }

      return { text: cleanJson(text), model };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.warn(`[LexMorph Groq] ${model} failed:`, msg);
      errors.push(`${model}: ${msg}`);
    }
  }

  throw new Error(`All Groq models failed. ${errors.slice(-3).join(' | ')}`);
}

export async function probeGroq(apiKey: string): Promise<{ ok: boolean; model?: string; error?: string }> {
  try {
    const result = await groqChatJson({
      apiKey,
      system: 'Reply with JSON only.',
      user: 'Return {"ok":true,"ping":"lexmorph"}',
      models: ['openai/gpt-oss-20b'],
      maxTokens: 64,
      temperature: 0,
    });
    JSON.parse(result.text);
    return { ok: true, model: result.model };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}
