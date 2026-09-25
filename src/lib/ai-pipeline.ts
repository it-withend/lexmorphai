/**
 * LexMorph AI — Unified LLM Router
 * Primary free path: Groq (gpt-oss / qwen3.8). Gemini optional.
 */

import { GoogleGenAI } from '@google/genai';
import { DocumentAST } from './types';
import { SAMPLE_CASES } from './samples';
import { enrichAstWithRules } from './apply-rules';
import { buildAstFromOcrText } from './ocr-ast';
import {
  cleanJson,
  getServerGeminiKey,
  getServerGroqKey,
  groqChatJson,
  GROQ_TEXT_MODELS,
  GROQ_VISION_MODELS,
} from './groq';

function hasCyrillic(text: string): boolean {
  return /[\u0400-\u04FF]/.test(text);
}

function isUsJurisdiction(jurisdiction: string): boolean {
  return /new york|california|united states|kings county|los angeles|nyc|brooklyn|bronx|queens|manhattan|usa|\bu\.?s\.?\b/i.test(
    jurisdiction || ''
  );
}

/** Infer NY/CA/US from document text when the LLM omits or invents jurisdiction. */
export function inferJurisdictionFromText(text: string, fallback = ''): string {
  const t = text.toLowerCase();
  if (/new york|nyc|kings county|brooklyn|bronx|queens|manhattan|rpapl|rpl §\s*235|housing court/i.test(t)) {
    return 'New York';
  }
  if (/california|los angeles|san francisco|civil code §\s*1950|ab\s*12/i.test(t)) {
    return 'California';
  }
  if (/united states|u\.s\.a|federal|fdcpa|15 u\.s\.c/i.test(t)) {
    return 'United States';
  }
  if (isUsJurisdiction(fallback)) return fallback;
  // US-looking housing/lease triggers without explicit place → default NY for LexHack demos
  if (
    /eviction|rent demand|notice to quit|landlord|tenant|lease|as is|3[\s-]?day|14[\s-]?day|nonpayment|habitability/i.test(
      t
    )
  ) {
    return 'New York';
  }
  return fallback || 'Unknown';
}

function shouldApplyUsRules(jurisdiction: string, rawText?: string): boolean {
  if (isUsJurisdiction(jurisdiction)) return true;
  if (!rawText) return false;
  return isUsJurisdiction(inferJurisdictionFromText(rawText, jurisdiction));
}

/** Drop invented US court captions / translations when OCR says otherwise. */
function sanitizeAst(ast: DocumentAST, rawText?: string, imageUrl?: string): DocumentAST {
  let next: DocumentAST = { ...ast };
  if (imageUrl) next.originalImageUrl = imageUrl;

  const corpus = `${next.title}\n${next.sections.map((s) => s.content).join('\n')}`;
  const ocrIsCyrillic = Boolean(rawText && hasCyrillic(rawText));
  const outputLostCyrillic = ocrIsCyrillic && !hasCyrillic(corpus);

  // If the model translated away from the source script, prefer faithful OCR reconstruction
  if (outputLostCyrillic && rawText) {
    return buildAstFromOcrText(rawText, { imageUrl });
  }

  const isCourtLike =
    next.documentType === 'court_summons' ||
    next.documentType === 'eviction_notice' ||
    Boolean(next.caption?.courtName && /court|суд/i.test(next.caption.courtName));

  if (!isCourtLike || !next.caption?.courtName?.trim() || !next.caption?.plaintiff?.trim()) {
    next = { ...next, caption: undefined };
  }

  const inferred = inferJurisdictionFromText(
    `${rawText || ''}\n${corpus}\n${next.jurisdiction || ''}`,
    next.jurisdiction
  );
  if (!isUsJurisdiction(next.jurisdiction) && isUsJurisdiction(inferred)) {
    next = { ...next, jurisdiction: inferred };
  }

  if (!shouldApplyUsRules(next.jurisdiction, rawText)) {
    // Never apply US-only defect inventions outside US docs
    next = {
      ...next,
      defects: next.defects.filter((d) => !/RPAPL|RPL §|Civil Code § 1950|FDCPA|15 U\.S\.C/i.test(d.citation)),
    };
    return next;
  }

  // Always merge deterministic statutory rules for US/NY/CA (do not rely on LLM defects alone)
  return enrichAstWithRules(next, rawText || corpus);
}

export type AnalysisSource =
  | 'gemini'
  | 'groq-vision'
  | 'groq-text'
  | 'ocr-rules'
  | 'sample';

export interface AnalysisResult {
  ast: DocumentAST;
  source: AnalysisSource;
  warning?: string;
  model?: string;
}

function cleanLocalJson(text: string): string {
  return cleanJson(text);
}

export async function analyzeLegalDocument(
  imageDataUrl?: string,
  rawText?: string,
  apiKey?: string,
  groqApiKey?: string
): Promise<AnalysisResult> {
  const geminiKey = getServerGeminiKey(apiKey);
  const groqKey = getServerGroqKey(groqApiKey);
  const analysisPrompt = buildAnalysisPrompt();
  const warnings: string[] = [];
  const ocrIsCyrillic = Boolean(rawText && hasCyrillic(rawText));

  // 1) Groq text analysis first (primary free path on Vercel)
  if (groqKey && rawText && rawText.length > 20) {
    try {
      const { text, model } = await groqChatJson({
        apiKey: groqKey,
        system:
          'You are LexMorph AI, a legal document analyst. Preserve original language. Output only valid DocumentAST JSON.',
        user: `Analyze this legal document text and return DocumentAST JSON.\n\nDOCUMENT:\n${rawText.slice(0, 12000)}\n\n${analysisPrompt}`,
        models: GROQ_TEXT_MODELS,
        temperature: 0.15,
      });
      const ast = sanitizeAst(JSON.parse(text) as DocumentAST, rawText, imageDataUrl);
      return { ast, source: 'groq-text', model, warning: warnings[0] };
    } catch (e) {
      console.warn('[LexMorph] Groq text failed:', e);
      warnings.push(`Groq text failed: ${e instanceof Error ? e.message : 'unknown'}`);
    }
  }

  // 2) Groq vision (image, non-Cyrillic)
  if (groqKey && imageDataUrl?.startsWith('data:') && !ocrIsCyrillic) {
    try {
      const userText = rawText
        ? `OCR hint:\n${rawText.slice(0, 4000)}\n\n${analysisPrompt}`
        : analysisPrompt;
      const { text, model } = await groqChatJson({
        apiKey: groqKey,
        system:
          'You are LexMorph AI. Reconstruct documents faithfully. NEVER translate. NEVER invent court captions. Output only valid JSON.',
        user: [
          { type: 'text', text: userText },
          { type: 'image_url', image_url: { url: imageDataUrl } },
        ],
        models: GROQ_VISION_MODELS,
        temperature: 0.1,
      });
      const ast = sanitizeAst(JSON.parse(text) as DocumentAST, rawText, imageDataUrl);
      return { ast, source: 'groq-vision', model, warning: warnings[0] };
    } catch (e) {
      console.warn('[LexMorph] Groq vision failed:', e);
      warnings.push('Groq vision failed — trying Gemini / rules.');
    }
  }

  // 3) Gemini (optional / billing-dependent)
  if (geminiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey: geminiKey });
      const contents: Array<Record<string, unknown>> = [];

      if (imageDataUrl && imageDataUrl.startsWith('data:')) {
        const commaIdx = imageDataUrl.indexOf(',');
        const mimeMatch = imageDataUrl.match(/data:([^;]+);/);
        const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
        const base64Data = imageDataUrl.substring(commaIdx + 1);
        contents.push({ inlineData: { mimeType, data: base64Data } });
      }

      if (rawText) contents.push({ text: `DOCUMENT TEXT:\n${rawText}` });
      contents.push({ text: analysisPrompt });

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents,
        config: { responseMimeType: 'application/json' },
      });

      const text = response.text?.trim() || '';
      const ast = sanitizeAst(JSON.parse(cleanLocalJson(text)) as DocumentAST, rawText, imageDataUrl);
      return { ast, source: 'gemini', model: 'gemini-2.5-flash' };
    } catch (e) {
      console.warn('[LexMorph] Gemini failed:', e);
      warnings.push('Gemini unavailable.');
    }
  }

  // 4) Offline rules / OCR AST
  if (rawText && rawText.length > 20) {
    const ast = buildAstFromOcrText(rawText, { imageUrl: imageDataUrl });
    return {
      ast,
      source: 'ocr-rules',
      warning:
        warnings[0] ||
        'Using offline rules (no live Groq). Set GROQ_API_KEY on Vercel and redeploy for live AI.',
    };
  }

  throw new Error('Provide document text to analyze, or open a curated demo sample.');
}

function buildAnalysisPrompt(): string {
  return `You are LexMorph AI — a DOCUMENT RECONSTRUCTION engine (not a translator, not a US court form filler).

CRITICAL RULES (must follow):
1. NEVER translate. Keep the EXACT original language and script (Uzbek Latin, Uzbek Cyrillic, Russian Cyrillic, English, mixed — as written).
2. NEVER invent a court caption, Index No., plaintiff/defendant, or "EVICTION NOTICE" unless the photo clearly is a court filing.
3. For ordinary business letters / МЧЖ letters: documentType = "general_contract", caption = null/omit, put letterhead + body into sections in original wording.
4. Do NOT force US Housing Court / NY RPAPL templates onto non-US documents.
5. Only flag defects with real citations matching the document's jurisdiction. If unsure, defects = [] and explain in audit.summaryHeadline that manual review is needed.
6. Prefer fidelity over creativity. If OCR is messy, still keep original script characters — do not "clean up" by translating to English.

Analyze the document and return ONLY valid JSON:
{
  "id": "doc_generated",
  "title": "Short title in the ORIGINAL language",
  "documentType": "eviction_notice" | "residential_lease" | "court_summons" | "debt_demand" | "general_contract",
  "jurisdiction": "Country / region as written on the document",
  "caption": null,
  "metadata": {
    "dateIssued": "YYYY-MM-DD or empty",
    "deadlineDate": "",
    "daysRemaining": 0,
    "claimAmount": "",
    "propertyAddress": ""
  },
  "sections": [
    {
      "id": "sec_1",
      "type": "header" | "paragraph" | "clause" | "signature_block",
      "title": "optional — original language",
      "content": "FULL original text for this block — do not translate",
      "redFlagId": null
    }
  ],
  "defects": [],
  "audit": {
    "defenseViabilityScore": 40,
    "viabilityGrade": "Needs human review",
    "summaryHeadline": "One sentence in English describing what the document appears to be",
    "keyFindings": ["finding in English"],
    "actionSteps": [
      {
        "stepNumber": 1,
        "title": "Action title",
        "deadline": "When",
        "description": "What to do",
        "urgent": true
      }
    ]
  }
}

Only include a non-null "caption" object if this is clearly a court pleading with parties and a case number.`;
}

/** Sample-only helper for curated demos */
export function getSampleAst(sampleId?: string): DocumentAST {
  const sample = SAMPLE_CASES.find((s) => s.id === sampleId) || SAMPLE_CASES[0];
  return enrichAstWithRules(sample.ast);
}

// ─── Pleading Generator ─────────────────────────────────────────────────────

export async function generatePleadingWithAI(
  astJson: string,
  tenantName: string,
  apiKey?: string,
  groqApiKey?: string
): Promise<string | null> {
  const geminiKey = getServerGeminiKey(apiKey);
  const groqKey = getServerGroqKey(groqApiKey);
  const prompt = buildPleadingPrompt(astJson, tenantName);

  if (groqKey) {
    try {
      const { text } = await groqChatJson({
        apiKey: groqKey,
        system: 'You are a legal drafting AI. Output only valid JSON. No markdown.',
        user: prompt,
        models: GROQ_TEXT_MODELS,
        temperature: 0.15,
      });
      return text;
    } catch (e) {
      console.warn('[LexMorph] Groq pleading failed:', e);
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
      return response.text?.trim() || null;
    } catch (e) {
      console.warn('[LexMorph] Gemini pleading failed:', e);
    }
  }

  return null;
}

export async function simulateHearingTurn(
  history: Array<{ speaker: string; text: string }> | undefined,
  userResponse: string,
  caseContext: string,
  apiKey?: string,
  groqApiKey?: string
): Promise<{
  score: number;
  praise: string;
  criticism: string;
  suggestedLegalRefinement: string;
  judgeReply: string;
  model?: string;
} | null> {
  const geminiKey = getServerGeminiKey(apiKey);
  const groqKey = getServerGroqKey(groqApiKey);
  const safeHistory = Array.isArray(history) ? history : [];
  const prompt = buildSimulationPrompt(safeHistory, userResponse, caseContext);

  // Groq first (user's primary free key on Vercel)
  if (groqKey) {
    try {
      const { text, model } = await groqChatJson({
        apiKey: groqKey,
        system:
          'You are a Housing Court judge on the bench. judgeReply is YOUR spoken line from the bench — never the tenant. Never start with "Your Honor". Never say "I request" or "I move". Address Tenant or Counsel. Output only valid JSON.',
        user: prompt,
        models: GROQ_TEXT_MODELS,
        temperature: 0.75,
        maxTokens: 1600,
      });
      const parsed = JSON.parse(cleanLocalJson(text));
      return { ...normalizeHearingTurn(parsed), model };
    } catch (e) {
      console.warn('[LexMorph] Groq simulation failed:', e);
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
      return { ...normalizeHearingTurn(JSON.parse(cleanJson(text))), model: 'gemini-2.5-flash' };
    } catch (e) {
      console.warn('[LexMorph] Gemini simulation failed:', e);
    }
  }

  return null;
}

function buildPleadingPrompt(astJson: string, tenantName: string): string {
  return `You are a senior pro se legal document generator. Based on this document analysis JSON, generate a formal court Answer.

Document AST:
${astJson}

Tenant Name: ${tenantName}

Output valid JSON with this schema:
{
  "id": "pleading-generated",
  "pleadingType": "verified_answer",
  "title": "VERIFIED ANSWER WITH AFFIRMATIVE DEFENSES",
  "caption": {
    "courtName": "...",
    "countyOrDistrict": "...",
    "plaintiff": "...",
    "defendant": "${tenantName}",
    "indexNumber": "...",
    "documentTitle": "VERIFIED ANSWER"
  },
  "generalDenial": "...",
  "affirmativeDefenses": [
    {
      "id": "def-1",
      "defenseName": "First Defense: [Name]",
      "statutoryBasis": "Statute citation",
      "statement": "Full defense statement",
      "selected": true
    }
  ],
  "counterclaims": [],
  "demandForRelief": ["1. ...", "2. ..."],
  "verificationBlock": {
    "declarantName": "${tenantName}",
    "penaltyOfPerjuryClause": "I, ${tenantName}, declare under penalty of perjury...",
    "date": "${new Date().toISOString().split('T')[0]}",
    "county": "...",
    "signatureStatus": "electronically_signed"
  }
}`;
}

function normalizeHearingTurn(parsed: unknown): {
  score: number;
  praise: string;
  criticism: string;
  suggestedLegalRefinement: string;
  judgeReply: string;
} {
  const o = parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : {};
  const asText = (v: unknown, fallback: string, max: number) =>
    (typeof v === 'string' && v.trim() ? v.trim() : fallback).slice(0, max);
  const scoreRaw = Number(o.score);
  return {
    score: Number.isFinite(scoreRaw) ? Math.max(1, Math.min(100, Math.round(scoreRaw))) : 62,
    praise: asText(o.praise, 'You answered the court.', 600),
    criticism: asText(o.criticism, 'Name the statute and the exact remedy you want.', 600),
    suggestedLegalRefinement: asText(o.suggestedLegalRefinement, '', 800),
    judgeReply: asText(
      o.judgeReply || o.judge_reply,
      'I heard you. Counsel, I will hear you next — tenant, stay on one issue and tell me the statute.',
      900
    ),
  };
}

function buildSimulationPrompt(
  history: Array<{ speaker: string; text: string }>,
  userResponse: string,
  caseContext: string
): string {
  const safeHistory = Array.isArray(history) ? history : [];
  const lastJudge = [...safeHistory].reverse().find((h) => h.speaker === 'judge')?.text || '';
  const tenantTurns = safeHistory.filter((h) => h.speaker === 'user').length;
  return `You are Judge Alvarez, Housing Part, a busy calendar. Educational rehearsal only — not legal advice. Never guarantee who wins.

CASE FACTS + GROUND TRUTH:
${caseContext}

Turn ${tenantTurns + 1} of this hearing.
Last thing YOU (the judge) said — do NOT repeat it:
${lastJudge || '(you just called the case)'}

Full conversation:
${safeHistory.map((h) => `${h.speaker.toUpperCase()}: ${h.text}`).join('\n') || '(start of hearing)'}

THE TENANT JUST SAID (react to these exact words):
<<<TENANT>>>
${userResponse}
<<<END>>>

How to speak (judgeReply):
- You ARE the judge. Speak from the bench in 1–3 sentences.
- NEVER start with "Your Honor". NEVER write as the tenant.
- Address "Tenant" or "Counsel". Interrupt, ask one follow-up, or put something on the record.
- Quote or paraphrase a phrase they used so the reply is obviously about THIS turn.
- If they raise RPAPL 711 / 14 days: ask landlord counsel to produce the demand, then ask how it was served.
- If they raise heat/water/habitability: ask dates, photos, written notice, HPD — do not jump to a 14-day lecture unless they brought it up.
- If they mention fees: ask for an itemized breakdown.
- If they are vague, cut them off and demand a statute + a remedy in one sentence.
- If they are wrong that a 3-day NY nonpayment demand is enough: score ≤40 and correct toward RPAPL § 711(2) (14 days).
- Never copy a prior judge line. Never use the same follow-up twice.

Also coach the tenant (separate from the spoken line):
Return JSON only:
{
  "score": <1-100>,
  "praise": "what they did right this turn, citing their words",
  "criticism": "one concrete improvement",
  "suggestedLegalRefinement": "one better sentence they could say next",
  "judgeReply": "the NEW spoken judicial line"
}`;
}
