import { GoogleGenAI } from '@google/genai';
import Groq from 'groq-sdk';
import { AdviceAuditResult } from './types';
import { buildRulesOnlyAudit, runDeterministicAdviceRules, scoreAdviceRisk } from './advice-audit';

const GROQ_MODELS = ['openai/gpt-oss-120b', 'qwen/qwen3.6-27b', 'openai/gpt-oss-20b', 'llama-3.3-70b-versatile'];

function cleanJson(text: string): string {
  return text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
}

function buildPrompt(situation: string, adviceText: string, jurisdiction?: string): string {
  return `You are LexMorph Advice Auditor — an AI SAFETY reviewer for legal advice given by chatbots.

Your job is NOT to give new legal advice. Your job is to detect unsafe, overconfident, hallucinated, or jurisdiction-wrong guidance.

User situation:
${situation || '(not provided)'}

Claimed jurisdiction hint: ${jurisdiction || 'unknown'}

AI advice to audit:
"""
${adviceText.slice(0, 8000)}
"""

Return ONLY JSON:
{
  "summary": "one paragraph risk summary",
  "flags": [
    {
      "id": "f1",
      "severity": "critical" | "warning" | "info",
      "category": "hallucinated_law" | "wrong_jurisdiction" | "overconfidence" | "dangerous_action" | "missing_disclaimer" | "procedural_trap" | "fabricated_citation",
      "title": "short title",
      "excerpt": "quote from the advice",
      "explanation": "why this is unsafe",
      "saferAlternative": "safer framing (still not legal advice)"
    }
  ],
  "saferRewrite": "a cautious educational rewrite without guaranteeing outcomes",
  "checklist": ["actionable verification steps"]
}`;
}

export async function auditLegalAdvice(params: {
  adviceText: string;
  situation?: string;
  jurisdiction?: string;
  apiKey?: string;
  groqApiKey?: string;
}): Promise<{ result: AdviceAuditResult; source: 'ai' | 'rules' }> {
  const { adviceText, situation = '', jurisdiction, apiKey, groqApiKey } = params;
  const ruleBase = buildRulesOnlyAudit(adviceText, situation);
  const geminiKey = apiKey || process.env.GEMINI_API_KEY;
  const groqKey = groqApiKey || process.env.GROQ_API_KEY;
  const prompt = buildPrompt(situation, adviceText, jurisdiction);

  const mergeAi = (parsed: Partial<AdviceAuditResult>): AdviceAuditResult => {
    const ruleFlags = runDeterministicAdviceRules(adviceText);
    const aiFlags = parsed.flags || [];
    const seen = new Set<string>();
    const flags = [...ruleFlags, ...aiFlags].filter((f) => {
      const key = `${f.category}:${f.title}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    const { overallRisk, riskLevel } = scoreAdviceRisk(flags);
    return {
      id: `advice_${Date.now()}`,
      overallRisk,
      riskLevel,
      summary: parsed.summary || ruleBase.summary,
      flags,
      saferRewrite: parsed.saferRewrite || ruleBase.saferRewrite,
      checklist: parsed.checklist?.length ? parsed.checklist : ruleBase.checklist,
      disclaimers: ruleBase.disclaimers,
    };
  };

  if (geminiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey: geminiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ text: prompt }],
        config: { responseMimeType: 'application/json' },
      });
      const text = response.text?.trim() || '';
      if (text) {
        return { result: mergeAi(JSON.parse(cleanJson(text))), source: 'ai' };
      }
    } catch (e) {
      console.warn('[AdviceAuditor] Gemini failed:', e);
    }
  }

  if (groqKey) {
    const groq = new Groq({ apiKey: groqKey });
    for (const model of GROQ_MODELS) {
      try {
        const completion = await groq.chat.completions.create({
          model,
          messages: [
            {
              role: 'system',
              content:
                'You are an AI safety auditor for legal chatbot answers. Output only valid JSON. Never invent fake reassurance.',
            },
            { role: 'user', content: prompt },
          ],
          temperature: 0.1,
          max_tokens: 3000,
          response_format: { type: 'json_object' },
        });
        const text = completion.choices[0]?.message?.content?.trim() || '';
        if (text) {
          return { result: mergeAi(JSON.parse(cleanJson(text))), source: 'ai' };
        }
      } catch (e) {
        console.warn(`[AdviceAuditor] Groq ${model} failed:`, e);
      }
    }
  }

  return { result: ruleBase, source: 'rules' };
}
