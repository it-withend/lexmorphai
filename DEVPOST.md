# LexMorph AI — Devpost Draft

## Project name
**LexMorph Defense Studio**

## Tagline
Audit notices, draft Answers, rehearse Housing Court — and catch dangerous ChatGPT “legal advice” before it hurts real people.

## Tracks
- **Primary:** Access to Justice & Civic Tech  
- **Secondary:** AI Safety, Ethics & Governance  
- **Also fits:** Legal Automation & Workflow Innovation  

## Elevator pitch (≤ 2 sentences)
Most tenants lose on procedure, not on the merits — and many now trust chatbot advice that tells them to skip court. LexMorph is a defense loop: statutory red-flag audit → court-ready Answer (.docx) → Hearing Coach → AI Advice Safety Auditor.

---

## Problem
- In housing / consumer courts, unrepresented people miss notice defects, filing deadlines, and oral-hearing strategy.
- Generative AI fills the gap with **confident wrong advice** (ignore hearings, invent statutes, guarantee wins).
- Tools that try “photo → perfect legal PDF” fail on stamps/layout and destroy trust in demos.

## Solution
LexMorph ships three connected tools:

1. **Defense Studio** (`/studio`)  
   Curated NY/CA cases or pasted notice/lease text → living editable document → statutory red flags (rules + optional LLM) → 1-click Answer export (`.docx`).

2. **Hearing Coach** (`/simulator`)  
   Three scenarios (NYC notice defect, habitability abatement, CA deposit traps). Practice answers, get scored feedback + statute-aware phrasing. Studio case context carries over.

3. **Advice Auditor** (`/auditor`) — AI Safety track  
   Paste ChatGPT-style advice. Deterministic danger rules + optional LLM enrichment flag overconfidence, suspicious-format citations, “skip court,” etc., then produce a safer educational rewrite + checklist (works offline). Risk level follows **max severity** (empty match → `unknown`, never “low/safe”).

---

## How it works (user flow)
1. Open Studio → **NYC Eviction Notice** demo (or “I’m scared” path)  
2. Review red flags (plain English first; statutes secondary)  
3. **Generate Court Answer** → download Word  
4. **Practice this Answer in Hearing Coach** → cite RPAPL § 711 / 14-day  
5. Open Auditor → **NYC skip-court** demo → risk score + safer rewrite  

---

## Tech stack & AI disclosure
- **App:** Next.js 16, React 19, TypeScript, Tailwind CSS 4  
- **LLMs (optional):** Groq (`openai/gpt-oss-*`, Qwen) primary free path; Google Gemini optional  
- **Offline reliability:** Curated sample cases + deterministic statutory / advice-safety rule engines  
- **Export:** `docx` library (court-style Answer draft)  
- **Deploy:** Vercel (`https://lexmorphai.vercel.app`)  
- **AI code tools:** Cursor / Copilot-style assistants may have been used during development; core product logic (rules KB, Studio/Hearing/Auditor flows) is team-owned and explainable.

## APIs / keys
- Visitors need **no** API key — server `GROQ_API_KEY` on Vercel powers live AI when configured.  
- Judging still works in **Basic mode** (samples + deterministic rules).  
- Health: `/api/ai-status`.

## What’s original
- End-to-end **defense loop** (audit → pleading → oral prep) instead of a generic chatbot.  
- Explicit **AI Safety auditor for legal advice** aimed at chatbot harm modes common in access-to-justice.  
- Honest product boundary: educational prototype — **not** an “AI lawyer” and **not** brittle 1:1 photo reconstruction as the hero claim.

## Challenges
- Balancing AI creativity with **hallucination risk** in a legal context (rules-first + Hearing guardrails).  
- Keeping demos reliable offline for judges.  
- Designing for non-lawyers without overclaiming outcomes.

## Accomplishments
- Working Studio + Answer export + Hearing Coach scenarios + Advice Auditor.  
- Dual-track narrative (A2J + AI Safety) with one coherent product story.  
- Deployed prototype; P0 reliability fixes for paste defects, simulate validation, notice-period guardrails, and viability bands.
- Advice Auditor mini-eval (**25/25**) + **47**-entry citation registry (`verified` / `unknown` / `suspicious`).

## What’s next
- Expand Auditor eval with consented chatbot / clinic logs  
- Clinic partnerships / more jurisdictions **after** core loop is solid  
- Citation link-outs to primary law  
- Multilingual plain-English explanations  
- LexHack Builders Fellowship deployment support  

## Team
- **Azamat** — builder / product (solo or add teammates here)

## AI tools used (build & runtime)
- **Build:** Cursor agent + Claude for scaffolding, refactors, and docs
- **Runtime (optional):** Groq (primary) / Gemini for paste analyze, Hearing feedback, Auditor enrichment
- **Deterministic core:** statutory rules, Advice Auditor regex + citation registry (LLM cannot drop rule flags)

## Limitations (honest)
- Curated demos are fixtures; viability is a qualitative band, not a %.
- Citations: **47-entry** known-good registry + format heuristics (`verified` / `unknown` / `suspicious`) — not live primary-law API verification.
- Safer rewrites are AI-generated / unverified when an LLM is used.
- Educational only — not legal advice; Answer export is a DRAFT template.
- Deterministic Auditor mini-eval: **25/25** labeled cases, 100% mustHit recall, 0 mustNotHit FPs (`npm run eval:auditor`, `docs/ADVICE_AUDITOR_EVAL.md`).

## Privacy
Visitors do **not** paste API keys. The app uses the server `GROQ_API_KEY` on Vercel when configured. Pasted notices / advice may be sent to the LLM provider for enrichment. Practice examples stay in the browser; your own cases can be saved in `localStorage` on that device.

## Links
- **Live app:** https://lexmorphai.vercel.app  
- **Repo:** https://github.com/it-withend/lexmorphai  
- **P0 smoke notes:** `docs/P0_TEST_NOTES.md`  
- **Auditor mini-eval:** `docs/ADVICE_AUDITOR_EVAL.md`  
- **Submission checklist:** `docs/SUBMISSION_CHECKLIST.md`

---

## Demo video script (≤ 3:00)

**[0:00–0:20] Hook**  
“Ninety percent of tenants in Housing Court have no lawyer. Chatbots now tell them to skip their hearing. LexMorph is a Defense Studio that helps people spot illegal notices, draft an Answer, rehearse court — and audit bad AI advice.”

**[0:20–1:10] Studio**  
Screen: Landing → Studio → click **NYC Eviction Notice**.  
Show red flags (3-day vs 14-day, habitability, fees).  
Click **Generate Court Answer** → toggle a defense → download `.docx`.  
Say: “This is the Access to Justice loop — plain English plus court-formatted output.”

**[1:10–1:55] Hearing Coach**  
Open Simulator → pick **NYC notice defect** → click a recommended argument citing RPAPL § 711.  
Show score + “better phrasing.”  
Flip briefly to **CA lease traps** scenario to show multi-case coaching.

**[1:55–2:35] Advice Auditor (AI Safety)**  
Open Auditor → **NYC · Skip court & stop rent** demo.  
Show critical risk score, flags (ignore court, guarantee, suspicious-format citation).  
One click the **CA deposit** pack.  
Say: “We don’t just generate AI text — we stress-test the AI advice people already trust. Mini-eval: 25/25 labeled cases.”

**[2:35–2:55] Close**  
“LexMorph: audit, answer, rehearse, and keep unsafe chatbot advice from becoming a default judgment. Built for LexHack 2026. Not legal advice — a prototype for real-world impact.”

**[2:55–3:00] End card**  
Live URL + GitHub + tracks: Access to Justice + AI Safety.

### Recording tips
- Use curated demos only (no live photo upload).  
- Hard-refresh production after deploy.  
- Keep UI zoom ~110% for readability on Loom/YouTube.
