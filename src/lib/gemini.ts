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
  return /new york|california|united states|kings county|los angeles/i.test(jurisdiction || '');
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

  if (!isUsJurisdiction(next.jurisdiction)) {
    // Never apply US-only defect inventions outside US docs
    next = {
      ...next,
      defects: next.defects.filter((d) => !/RPAPL|RPL §|Civil Code § 1950|FDCPA|15 U\.S\.C/i.test(d.citation)),
    };
  }

  return isUsJurisdiction(next.jurisdiction) ? enrichAstWithRules(next, rawText) : next;
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
    "viabilityGrade": "Review Needed",
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
  history: Array<{ speaker: string; text: string }>,
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
  const prompt = buildSimulationPrompt(history, userResponse, caseContext);

  // Groq first (user's primary free key on Vercel)
  if (groqKey) {
    try {
      const { text, model } = await groqChatJson({
        apiKey: groqKey,
        system:
          'You are an NYC/CA housing-court style judge coach. Be specific to the case context. Output only valid JSON.',
        user: prompt,
        models: GROQ_TEXT_MODELS,
        temperature: 0.35,
        maxTokens: 1200,
      });
      const parsed = JSON.parse(text);
      return { ...parsed, model };
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
      return { ...JSON.parse(cleanJson(text)), model: 'gemini-2.5-flash' };
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

function buildSimulationPrompt(
  history: Array<{ speaker: string; text: string }>,
  userResponse: string,
  caseContext: string
): string {
  return `You are a real NYC Housing Court Judge. The user is a pro se tenant in a nonpayment eviction hearing.
Case: ${caseContext}

Conversation so far:
${history.map((h) => `${h.speaker.toUpperCase()}: ${h.text}`).join('\n')}

Tenant's response: "${userResponse}"

Return JSON:
{
  "score": <1-100>,
  "praise": "What they did right",
  "criticism": "What to improve",
  "suggestedLegalRefinement": "Exact better phrasing to use",
  "judgeReply": "Your next realistic judicial question or ruling"
}`;
}
