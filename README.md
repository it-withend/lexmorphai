# LexMorph AI

**LexHack 2026** · Access to Justice & Civic Tech

Turn a phone photo of an eviction notice, lease, or summons into an **editable living document**, flag statutory defects in plain English, generate a court-ready Answer, and practice oral argument in a hearing simulator.

> Not legal advice. Educational prototype for pro se awareness.

## Demo path (90 seconds)

1. Open `/studio`
2. Click **NYC Eviction Notice** (works offline, no API keys)
3. Click red flags → **Generate Official Court Answer** → download `.docx`
4. Open `/simulator` and try a quick defense

## Photo → editable document (no paid Gemini)

Google Gemini free keys often fail without billing. LexMorph uses a **free-first** pipeline:

1. **On-device OCR** (`tesseract.js`) — extracts text in the browser
2. **Groq vision / text** (optional free key from [console.groq.com/keys](https://console.groq.com/keys))
3. **Statutory rules engine** (`src/lib/legal-rules.ts`) — deterministic NY / CA / FDCPA triggers
4. Gemini only if you already have a working key

Editable export is **native Word (.docx)**. Use **Print / Save PDF** in the browser for a PDF copy of the reconstructed page.

## Setup

```bash
npm install
cp .env.example .env.local
# optional:
# GROQ_API_KEY=gsk_...
# GEMINI_API_KEY=AIza...
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

You can also paste keys in the app navbar (**API Keys**) — stored only in your browser `localStorage`.

## Tech stack

- Next.js 16 · React 19 · TypeScript · Tailwind CSS 4
- OCR: `tesseract.js` (client)
- LLMs: Groq (`qwen/qwen3.6-27b` vision, `openai/gpt-oss-120b` text) · optional Gemini 2.5 Flash
- Export: `docx`
- Domain: DocumentAST + statutory knowledge base

## Scripts

| Command | Purpose |
|--------|---------|
| `npm run dev` | Local development |
| `npm run build` | Production build |
| `npm run start` | Serve production build |

## Repository

https://github.com/it-withend/lexmorphai
