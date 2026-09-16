/**
 * LexMorph AI — Unified LLM Router
 *
 * Free-first pipeline for photo → editable document:
 * 1) Gemini vision (optional — often needs Google billing)
 * 2) Groq vision qwen/qwen3.6-27b (free tier, multimodal)
 * 3) Groq text on OCR (free)
 * 4) Local OCR text + statutory rules (zero cloud keys)
 */

import { GoogleGenAI } from '@google/genai';
import Groq from 'groq-sdk';
import { DocumentAST } from './types';
import { SAMPLE_CASES } from './samples';
import { enrichAstWithRules } from './apply-rules';
import { buildAstFromOcrText } from './ocr-ast';

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
}

const GROQ_TEXT_MODEL = 'openai/gpt-oss-120b';
const GROQ_VISION_MODEL = 'qwen/qwen3.6-27b';
const GROQ_TEXT_FALLBACKS = ['qwen/qwen3.6-27b', 'openai/gpt-oss-20b', 'llama-3.3-70b-versatile'];

function cleanJson(text: string): string {
  return text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
}

export async function analyzeLegalDocument(
  imageDataUrl?: string,
  rawText?: string,
  apiKey?: string,
  groqApiKey?: string
): Promise<AnalysisResult> {
  const geminiKey = apiKey || process.env.GEMINI_API_KEY;
  const groqKey = groqApiKey || process.env.GROQ_API_KEY;
  const analysisPrompt = buildAnalysisPrompt();
  const warnings: string[] = [];

  // 1) Gemini vision (optional)
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

      if (rawText) contents.push({ text: `OCR / DOCUMENT TEXT:\n${rawText}` });
      contents.push({ text: analysisPrompt });

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents,
        config: { responseMimeType: 'application/json' },
      });

      const text = response.text?.trim() || '';
      const ast = enrichAstWithRules(JSON.parse(cleanJson(text)) as DocumentAST, rawText);
      if (imageDataUrl) ast.originalImageUrl = imageDataUrl;
      return { ast, source: 'gemini' };
    } catch (e) {
      console.warn('[LexMorph] Gemini failed (billing/quota common):', e);
      warnings.push('Gemini unavailable — using free Groq / OCR path.');
    }
  }

  // 2) Groq vision (free multimodal)
  if (groqKey && imageDataUrl?.startsWith('data:')) {
    try {
      const result = await callGroqVision(groqKey, imageDataUrl, rawText, analysisPrompt);
      if (result) {
        const ast = enrichAstWithRules(result, rawText);
        ast.originalImageUrl = imageDataUrl;
        return {
          ast,
          source: 'groq-vision',
          warning: warnings[0],
        };
      }
    } catch (e) {
      console.warn('[LexMorph] Groq vision failed:', e);
      warnings.push('Groq vision failed — falling back to OCR text analysis.');
    }
  }

  // 3) Groq text on OCR
  if (groqKey && rawText && rawText.length > 20) {
    try {
      const result = await callGroqForAnalysis(groqKey, rawText, analysisPrompt);
      if (result) {
        const ast = enrichAstWithRules(result, rawText);
        if (imageDataUrl) ast.originalImageUrl = imageDataUrl;
        return {
          ast,
          source: 'groq-text',
          warning: warnings[0],
        };
      }
    } catch (e) {
      console.warn('[LexMorph] Groq text failed:', e);
    }
  }

  // 4) Zero-key: OCR text + statutory rules → editable AST
  if (rawText && rawText.length > 20) {
    try {
      const ast = buildAstFromOcrText(rawText, imageDataUrl);
      return {
        ast,
        source: 'ocr-rules',
        warning:
          warnings[0] ||
          'Reconstructed with on-device OCR + statutory rules (no cloud AI key required).',
      };
    } catch (e) {
      console.warn('[LexMorph] OCR-rules build failed:', e);
      throw e;
    }
  }

  throw new Error(
    'Could not analyze this photo. Add a free Groq API key (console.groq.com) or try a clearer image / demo sample.'
  );
}

async function callGroqVision(
  apiKey: string,
  imageDataUrl: string,
  rawText: string | undefined,
  prompt: string
): Promise<DocumentAST | null> {
  const groq = new Groq({ apiKey });
  const userText = rawText
    ? `OCR hint (may be imperfect):\n${rawText.slice(0, 4000)}\n\n${prompt}`
    : prompt;

  const completion = await groq.chat.completions.create({
    model: GROQ_VISION_MODEL,
    messages: [
      {
        role: 'system',
        content:
          'You are LexMorph AI, an expert legal tech analyst. Output only valid JSON matching the DocumentAST schema. No markdown.',
      },
      {
        role: 'user',
        content: [
          { type: 'text', text: userText },
          { type: 'image_url', image_url: { url: imageDataUrl } },
        ],
      },
    ],
    temperature: 0.1,
    max_tokens: 4096,
    response_format: { type: 'json_object' },
  });

  const text = completion.choices[0]?.message?.content?.trim() || '';
  if (!text) return null;
  return JSON.parse(cleanJson(text)) as DocumentAST;
}

async function callGroqForAnalysis(
  apiKey: string,
  rawText: string,
  prompt: string
): Promise<DocumentAST | null> {
  const groq = new Groq({ apiKey });
  const userContent = `Analyze this legal document:\n\n${rawText.slice(0, 12000)}\n\n${prompt}`;
  const models = [GROQ_TEXT_MODEL, ...GROQ_TEXT_FALLBACKS];

  for (const model of models) {
    try {
      const completion = await groq.chat.completions.create({
        model,
        messages: [
          {
            role: 'system',
            content:
              'You are LexMorph AI, an expert legal tech analyst. Output only valid JSON matching the DocumentAST schema. No markdown, no explanations.',
          },
          { role: 'user', content: userContent },
        ],
        temperature: 0.1,
        max_tokens: 4096,
        response_format: { type: 'json_object' },
      });

      const text = completion.choices[0]?.message?.content?.trim() || '';
      if (!text) continue;
      return JSON.parse(cleanJson(text)) as DocumentAST;
    } catch (e) {
      console.warn(`[LexMorph] Groq model ${model} failed:`, e);
    }
  }

  return null;
}

function buildAnalysisPrompt(): string {
  return `You are LexMorph AI, an expert Senior Legal Tech and Court Procedure Specialist.
Analyze this legal document and reconstruct it into a structured DocumentAST with statutory defect auditing.

Return ONLY valid JSON matching this exact schema:
{
  "id": "doc_generated",
  "title": "Document Title",
  "documentType": "eviction_notice" | "residential_lease" | "court_summons" | "debt_demand" | "general_contract",
  "jurisdiction": "State and County",
  "caption": {
    "courtName": "...",
    "countyOrDistrict": "...",
    "plaintiff": "...",
    "defendant": "...",
    "indexNumber": "...",
    "documentTitle": "..."
  },
  "metadata": {
    "dateIssued": "YYYY-MM-DD",
    "deadlineDate": "YYYY-MM-DD",
    "daysRemaining": 0,
    "claimAmount": "$...",
    "propertyAddress": "..."
  },
  "sections": [
    {
      "id": "sec_1",
      "type": "header" | "caption" | "paragraph" | "clause" | "statutory_warning" | "table" | "signature_block",
      "title": "optional title",
      "content": "full text",
      "clauseNumber": "optional",
      "redFlagId": "defect_id_if_this_section_is_defective_or_null"
    }
  ],
  "defects": [
    {
      "id": "defect_1",
      "severity": "critical" | "warning" | "info",
      "category": "procedural_defect" | "unlawful_clause" | "missing_statutory_notice" | "deadline_trap" | "habitability_breach",
      "title": "Short title",
      "citation": "Statute citation",
      "originalExcerpt": "Quote from document",
      "plainEnglishExplanation": "What this means in plain English",
      "recommendedDefense": "What to argue in court",
      "statutoryRemedy": "Available legal remedy",
      "dismissalImpactPercentage": 90
    }
  ],
  "audit": {
    "defenseViabilityScore": 95,
    "viabilityGrade": "Strong Dismissal Grounds" | "Viable Counterclaims" | "Moderate Defense" | "Review Needed",
    "summaryHeadline": "One sentence summary",
    "keyFindings": ["finding1", "finding2"],
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
}`;
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
  const geminiKey = apiKey || process.env.GEMINI_API_KEY;
  const groqKey = groqApiKey || process.env.GROQ_API_KEY;
  const prompt = buildPleadingPrompt(astJson, tenantName);

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
      console.warn('[LexMorph] Gemini pleading failed, trying Groq:', e);
    }
  }

  if (groqKey) {
    try {
      const groq = new Groq({ apiKey: groqKey });
      for (const model of [GROQ_TEXT_MODEL, ...GROQ_TEXT_FALLBACKS]) {
        try {
          const completion = await groq.chat.completions.create({
            model,
            messages: [
              {
                role: 'system',
                content: 'You are a legal drafting AI. Output only valid JSON. No markdown.',
              },
              { role: 'user', content: prompt },
            ],
            temperature: 0.1,
            max_tokens: 4096,
            response_format: { type: 'json_object' },
          });
          const text = completion.choices[0]?.message?.content?.trim() || null;
          if (text) return text;
        } catch {
          /* try next model */
        }
      }
    } catch (e) {
      console.warn('[LexMorph] Groq pleading failed:', e);
    }
  }

  return null;
}

// ─── Hearing Simulator ──────────────────────────────────────────────────────

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
} | null> {
  const geminiKey = apiKey || process.env.GEMINI_API_KEY;
  const groqKey = groqApiKey || process.env.GROQ_API_KEY;
  const prompt = buildSimulationPrompt(history, userResponse, caseContext);

  if (geminiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey: geminiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ text: prompt }],
        config: { responseMimeType: 'application/json' },
      });
      const text = response.text?.trim() || '';
      return JSON.parse(cleanJson(text));
    } catch (e) {
      console.warn('[LexMorph] Gemini simulation failed, trying Groq:', e);
    }
  }

  if (groqKey) {
    try {
      const groq = new Groq({ apiKey: groqKey });
      for (const model of [GROQ_TEXT_MODEL, ...GROQ_TEXT_FALLBACKS]) {
        try {
          const completion = await groq.chat.completions.create({
            model,
            messages: [
              {
                role: 'system',
                content: 'You are an NYC Housing Court judge AI. Output only valid JSON.',
              },
              { role: 'user', content: prompt },
            ],
            temperature: 0.3,
            max_tokens: 1024,
            response_format: { type: 'json_object' },
          });
          const text = completion.choices[0]?.message?.content?.trim() || '';
          if (text) return JSON.parse(cleanJson(text));
        } catch {
          /* next */
        }
      }
    } catch (e) {
      console.warn('[LexMorph] Groq simulation failed:', e);
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
