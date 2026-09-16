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
   Curated NY/CA cases or pasted notice/lease text → living editable document → statutory red flags → 1-click Verified Answer export (`.docx`).

2. **Hearing Coach** (`/simulator`)  
   Three scenarios (NYC notice defect, habitability abatement, CA deposit traps). Practice answers, get scores + better statutory phrasing.

3. **Advice Auditor** (`/auditor`) — AI Safety track  
   Paste ChatGPT-style advice. Deterministic danger rules + optional LLM enrichment flag overconfidence, fake citations, “skip court,” etc., then produce a safer educational rewrite.

---

## How it works (user flow)
1. Open Studio → **NYC Eviction Notice** demo  
2. Review red flags (RPAPL § 711, habitability, illegal fees)  
3. **Generate Official Court Answer** → download Word  
4. **Practice this case in Court** → click a recommended argument  
5. Open Auditor → run **NYC skip-court** or **CA fake deposit** demo → show risk score  

---

## Tech stack
- **Frontend/App:** Next.js 16, React 19, TypeScript, Tailwind CSS 4  
- **LLMs (optional):** Groq (free-tier models), Google Gemini  
- **Offline reliability:** Curated sample cases + deterministic statutory / safety rule engines  
- **Export:** `docx` (court-ish Verified Answer)  
- **Deploy:** Vercel  

## APIs / keys
- Works for judging **without** paid Google billing.  
- Optional `GROQ_API_KEY` / `GEMINI_API_KEY` deepen AI turns.  
- Advice Auditor and Studio demos degrade gracefully to rules/samples.

## What’s original
- End-to-end **defense loop** (audit → pleading → oral prep) instead of a generic chatbot.  
- Explicit **AI Safety auditor for legal advice** aimed at chatbot harm modes common in access-to-justice.  
- Honest product boundary: no brittle “1:1 photo reconstruction” claim.

## Challenges
- Balancing AI creativity with **hallucination risk** in a legal context.  
- Keeping demos reliable offline for judges.  
- Designing for non-lawyers without overclaiming “legal advice.”

## Accomplishments
- Working Studio + Answer export + Hearing Coach scenarios + Advice Auditor.  
- Dual-track narrative (A2J + AI Safety) with one coherent product story.  
- Deployed prototype on Vercel.

## What’s next
- More jurisdictions / clinic partnerships  
- Multilingual plain-English explanations  
- Deeper citation verification against primary-law sources  
- LexHack Builders Fellowship deployment support

## Team
_Add names / roles_

## Links
- **Live app:** https://lexmorphai-azamat2009s-projects.vercel.app  
- **Repo:** https://github.com/it-withend/lexmorphai  

---

## Demo video script (≤ 3:00)

**[0:00–0:20] Hook**  
“Ninety percent of tenants in Housing Court have no lawyer. Chatbots now tell them to skip their hearing. LexMorph is a Defense Studio that helps people spot illegal notices, draft an Answer, rehearse court — and audit bad AI advice.”

**[0:20–1:10] Studio**  
Screen: Landing → Studio → click **NYC Eviction Notice**.  
Show red flags (3-day vs 14-day, habitability, fees).  
Click **Generate Official Court Answer** → toggle a defense → download `.docx`.  
Say: “This is the Access to Justice loop — plain English plus court-formatted output.”

**[1:10–1:55] Hearing Coach**  
Open Simulator → pick **NYC notice defect** → click a recommended argument citing RPAPL § 711.  
Show score + “better phrasing.”  
Flip briefly to **CA lease traps** scenario to show multi-case coaching.

**[1:55–2:35] Advice Auditor (AI Safety)**  
Open Auditor → **NYC · Skip court & stop rent** demo.  
Show critical risk score, flags (ignore court, guarantee, fake citation).  
One click the **CA fake deposit** pack.  
Say: “We don’t just generate AI text — we stress-test the AI advice people already trust.”

**[2:35–2:55] Close**  
“LexMorph: audit, answer, rehearse, and keep unsafe chatbot advice from becoming a default judgment. Built for LexHack 2026. Not legal advice — a prototype for real-world impact.”

**[2:55–3:00] End card**  
Live URL + GitHub + tracks: Access to Justice + AI Safety.

### Recording tips
- Use curated demos only (no live photo upload).  
- Hard-refresh production after deploy.  
- Keep UI zoom ~110% for readability on Loom/YouTube.
