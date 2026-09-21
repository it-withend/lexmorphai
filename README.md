# LexMorph AI — Defense Studio

**LexHack 2026** · Access to Justice & Civic Tech · AI Safety (Advice Auditor)

## What it is

LexMorph helps people without a lawyer:

1. **Defense Studio** (`/studio`) — practice cases, paste, photo OCR, or Word (.docx); flag issues; draft an Answer template
2. **Hearing Coach** (`/simulator`) — rehearse Housing Court with coaching feedback (not a win prediction)
3. **Advice Auditor** (`/auditor`) — stress-test ChatGPT-style legal advice (deterministic rules + optional LLM)

> Not legal advice. Educational hackathon prototype.

## Where the code lives (5-minute map)

| Path | Role |
|------|------|
| `src/app/studio` · `auditor` · `simulator` | Product pages |
| `src/app/api/*` | Thin API routes |
| `src/lib/legal-rules.ts` · `apply-rules.ts` | Statutory red flags |
| `src/lib/advice-audit.ts` · `citation-registry.ts` | Auditor safety floor |
| `src/lib/ai-pipeline.ts` · `groq.ts` | Groq-first LLM (Gemini optional) |
| `src/lib/samples.ts` | Offline practice fixtures |
| `docs/ADVICE_AUDITOR_EVAL.md` | Mini-eval table |
| `docs/DEVPOST_PASTE.md` | Copy-paste Devpost fields |

## Demo script (3 minutes)

1. Landing → **Open Defense Studio**
2. Option A → **NYC eviction example** → review issues → **Generate Court Answer** → `.docx`
3. **Practice what to say in court** → cite RPAPL § 711
4. **Advice Auditor** → NYC skip-court demo → risk + safer rewrite

## Links

- Live: https://lexmorphai.vercel.app
- Repo: https://github.com/it-withend/lexmorphai
- Devpost paste pack: `docs/DEVPOST_PASTE.md`
- Submission checklist: `docs/SUBMISSION_CHECKLIST.md`
- Auditor eval: `docs/ADVICE_AUDITOR_EVAL.md` (`npm run eval:auditor`)

## Setup

```bash
npm install
cp .env.example .env.local
# GROQ_API_KEY=gsk_...   # server only — visitors need no key
npm run dev
```

## Limitations

- Practice demos are offline fixtures (honest UI copy).
- Defense strength is a qualitative band, not a win %.
- Citations: known-good list + format heuristics — not live primary-law APIs.
- Safer rewrites may be AI-generated and are labeled unverified.
- Educational only — not a lawyer or filing system.

## Privacy

Practice examples stay in the browser. Pasted/OCR text and Auditor advice go to our Vercel API; with `GROQ_API_KEY` / `GEMINI_API_KEY` on the server they may be sent to that provider. Own cases can be saved in `localStorage` on that device. Redact SSNs and bank numbers. Visitors do not paste API keys.

## Tech stack

Next.js 16 · React 19 · TypeScript · Tailwind 4 · Groq / Gemini (optional) · `docx` · deterministic Auditor rules

## AI tools used (build)

Cursor agent + Claude for coding assistance; Groq / Gemini optional at runtime.

## License

MIT — see `LICENSE`
