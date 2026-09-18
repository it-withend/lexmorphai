# LexMorph AI — Defense Studio

**LexHack 2026** · Access to Justice & Civic Tech · AI Safety (Advice Auditor)

## What it is

LexMorph helps pro se tenants:

1. **Defense Studio** (`/studio`) — audit a notice/lease (demo cases or pasted text), edit a living document, generate a court Answer draft (`.docx`)
2. **Hearing Coach** (`/simulator`) — rehearse Housing Court with scored feedback (Studio case context carries over)
3. **Advice Auditor** (`/auditor`) — stress-test ChatGPT-style legal advice for dangerous actions, fake citations, and overconfidence

> Not legal advice. Educational hackathon prototype.

## Demo script (3 minutes)

1. Landing → **Open Defense Studio**
2. Click **NYC Eviction Notice** → review red flags → **Generate Court Answer** → download `.docx`
3. **Practice this Answer in Hearing Coach** → use a quick answer citing RPAPL § 711
4. Open **Advice Auditor** → **Run bad-advice demo** → show risk score + safer rewrite

## Links
- Live: https://lexmorphai.vercel.app
- Repo: https://github.com/it-withend/lexmorphai
- P0 smoke notes: `docs/P0_TEST_NOTES.md`
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

Keys can also be pasted in the navbar (**API Keys**) — stored in browser `localStorage` only.

## Tech stack

- Next.js 16 · React 19 · TypeScript · Tailwind CSS 4
- LLMs: optional Groq / Gemini (demos work with offline rules + samples)
- Export: `docx`
- Safety auditor: deterministic danger patterns + LLM enrichment

## Repo

https://github.com/it-withend/lexmorphai
