# LexMorph AI — Defense Studio

**LexHack 2026** · Access to Justice & Civic Tech · AI Safety (Advice Auditor)

## What it is

LexMorph helps people without a lawyer:

1. **Defense Studio** (`/studio`) — practice cases, paste, photo OCR, or Word (.docx); flag issues; draft an Answer template
2. **Hearing Coach** (`/simulator`) — rehearse Housing Court with coaching feedback (not a win prediction)
3. **Advice Auditor** (`/auditor`) — stress-test ChatGPT-style legal advice (deterministic rules + optional LLM)

> Not legal advice. Educational hackathon prototype. See Limitations on the landing page.

## Privacy

Demo fixtures stay in the browser. Text/photos you analyze go to the Vercel API; if `GROQ_API_KEY` / `GEMINI_API_KEY` is set on the server, content may be sent to that provider. Redact sensitive numbers when possible.

## Demo script (3 minutes)

1. Landing → **Open Defense Studio**
2. Click **NYC Eviction Notice** → review red flags → **Generate Court Answer** → download `.docx`
3. **Practice this Answer in Hearing Coach** → use a quick answer citing RPAPL § 711
4. Open **Advice Auditor** → **Run bad-advice demo** → show risk score + safer rewrite

## Links
- Live: https://lexmorphai.vercel.app
- Repo: https://github.com/it-withend/lexmorphai
- P0 smoke notes: `docs/P0_TEST_NOTES.md`
- Advice Auditor mini-eval: `docs/ADVICE_AUDITOR_EVAL.md` (`npm run eval:auditor`)
- Devpost draft: `DEVPOST.md`

## Setup

```bash
npm install
cp .env.example .env.local
# optional free keys:
# GROQ_API_KEY=gsk_...
# GEMINI_API_KEY=AIza...
npm run dev
```

Keys can also be pasted in the navbar (**API Keys**) — they are stored in browser `localStorage`, but **requests still go through our Vercel API routes**, which forward content (and the key header when provided) to Groq/Gemini. Prefer a server `GROQ_API_KEY` for demos; rotate any key you paste in the UI.

## Limitations

- Curated Studio demos are **offline fixtures** (honest loading copy) — not a live LLM audit of that sample.
- Defense “viability” is a **qualitative band** from rule hits, not a win probability.
- Citation checks use a small known-good registry + format heuristics (`verified` / `unknown` / `suspicious`) — **not** primary-law API verification.
- Advice Auditor safer rewrites may be LLM-generated and are labeled **unverified**.
- Rate limits + max body length on `/api/analyze` and `/api/audit-advice`; in-memory limits reset per serverless instance.
- Educational prototype — not a lawyer, not a filing system, not legal advice.

## Privacy

- Demo fixtures stay in the browser.
- Pasted/OCR text and Auditor advice are sent to the API; with a provider key they may leave the server to Groq/Gemini.
- Redact SSNs, account numbers, and full addresses when possible.
- We do not intentionally persist user documents in a database in this hackathon build.

## Tech stack

- Next.js 16 · React 19 · TypeScript · Tailwind CSS 4
- LLMs: optional Groq / Gemini (demos work with offline rules + samples)
- Export: `docx`
- Safety auditor: deterministic danger patterns + LLM enrichment (rules cannot be removed by the model)

## AI tools used (build)

Cursor agent + Claude for coding assistance; Groq / Gemini optional at runtime.

## Repo

https://github.com/it-withend/lexmorphai
