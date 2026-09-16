import { GoogleGenAI } from '@google/genai';
import { AdviceAuditResult } from './types';
import { buildRulesOnlyAudit, runDeterministicAdviceRules, scoreAdviceRisk } from './advice-audit';
import {
  cleanJson,
  getServerGeminiKey,
  getServerGroqKey,
  groqChatJson,
  GROQ_TEXT_MODELS,
} from './groq';

function buildPrompt(situation: string, adviceText: string, jurisdiction?: string): string {
  return `You are LexMorph Advice Auditor — an AI SAFETY reviewer for legal advice given by chatbots.

Your job is NOT to give new legal advice. Detect unsafe, overconfident, hallucinated, or jurisdiction-wrong guidance.

User situation:
${situation || '(not provided)'}

Claimed jurisdiction hint: ${jurisdiction || 'unknown'}

AI advice to audit:
"""
${adviceText.slice(0, 8000)}
"""

Return ONLY JSON:
{
  "summary": "one paragraph risk summary specific to THIS advice",
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
  "saferRewrite": "a cautious educational rewrite tailored to this situation",
  "checklist": ["actionable verification steps"]
}`;
}

export async function auditLegalAdvice(params: {
  adviceText: string;
  situation?: string;
  jurisdiction?: string;
  apiKey?: string;
  groqApiKey?: string;
}): Promise<{ result: AdviceAuditResult; source: 'ai' | 'rules'; model?: string }> {
  const { adviceText, situation = '', jurisdiction, apiKey, groqApiKey } = params;
  const ruleBase = buildRulesOnlyAudit(adviceText, situation);
  const geminiKey = getServerGeminiKey(apiKey);
  const groqKey = getServerGroqKey(groqApiKey);
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

  // Prefer Groq (primary free path) — Gemini often fails on unpaid billing and delays demos
  if (groqKey) {
    try {
      const { text, model } = await groqChatJson({
        apiKey: groqKey,
        system:
          'You are an AI safety auditor for legal chatbot answers. Output only valid JSON. Never invent fake reassurance.',
        user: prompt,
        models: GROQ_TEXT_MODELS,
        temperature: 0.2,
        maxTokens: 3000,
      });
      return { result: mergeAi(JSON.parse(text)), source: 'ai', model };
    } catch (e) {
      console.warn('[AdviceAuditor] Groq failed:', e);
    }
  }

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
        return {
          result: mergeAi(JSON.parse(cleanJson(text))),
          source: 'ai',
          model: 'gemini-2.5-flash',
        };
      }
    } catch (e) {
      console.warn('[AdviceAuditor] Gemini failed:', e);
    }
  }

  return { result: ruleBase, source: 'rules' };
}
