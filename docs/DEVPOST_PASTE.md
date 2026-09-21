# LexMorph — paste into Devpost (copy exactly)

Use this while filling **Project overview** and **Project details**. Character limits matter.

---

## Step 2 — Project overview (this screen)

### Project name *(Required · max 60)*
```
LexMorph Defense Studio
```
*(24 characters)*

### Elevator pitch *(Required · max 200)*
```
Tenants lose on procedure—and chatbots tell them to skip court. LexMorph audits notices, drafts Answers, rehearses Housing Court, and stress-tests dangerous AI “legal advice.”
```
*(188 characters)*

### Thumbnail
- Use `public/devpost-thumbnail.png` (generate/export 3:2, JPG/PNG, ≤5 MB).
- Or screenshot Studio with NYC example + “LexMorph” visible.
- Aspect **3:2** recommended.

### Built with (tags — pick what Devpost offers)
`Next.js` · `TypeScript` · `React` · `Tailwind CSS` · `Groq` · `Vercel` · `docx` · `AI` · `Access to Justice`

### Tracks to select
1. **Access to Justice & Civic Tech** (primary)
2. **AI Safety, Ethics & Governance** (secondary)
3. Optional: Legal Automation & Workflow Innovation

---

## Step 3 — Project details (typical Devpost fields)

### About / Inspiration *(or “The problem”)*
```
In U.S. Housing Court, most tenants have no lawyer. They lose on procedure—defective notices, missed deadlines, not knowing what to say—more often than on the underlying rent dispute.

Generative AI fills the gap with confident wrong advice: “skip the hearing,” “guaranteed win,” invented statute numbers. That advice can produce default judgments and eviction.

LexMorph was built for LexHack 2026 to close both gaps: help people read a notice and practice a defense, and catch dangerous chatbot legal advice before someone trusts it.
```

### What it does *(or “The solution”)*
```
LexMorph is a connected Defense Studio loop (educational prototype — not a lawyer):

1) Defense Studio (/studio)
   Open a practice NYC/CA example, or paste / photograph your own notice.
   We flag common legal problems in plain English, then help draft a court Answer (.docx).
   Your own cases save in the browser so a refresh doesn’t wipe them. No visitor API key needed.

2) Hearing Coach (/simulator)
   Rehearse what to say in Housing Court. Feedback + statute-aware phrasing.
   Context from Studio carries over.

3) Advice Auditor (/auditor) — AI Safety
   Paste ChatGPT-style advice. Deterministic danger rules catch “skip court,” overconfidence, and odd citation formats; optional server AI enriches a safer rewrite.
   Risk follows maximum severity. Empty match ≠ “safe” (shows “no known patterns matched”).
   Mini-eval: 25/25 labeled cases · 47 known-good citations · LLM cannot remove rule flags (safety floor).
```

### How we built it *(Tech stack)*
```
• App: Next.js 16, React 19, TypeScript, Tailwind CSS 4
• Deploy: Vercel — https://lexmorphai.vercel.app
• LLMs (server-side): Groq primary (gpt-oss / Qwen); Gemini optional
• Deterministic core: statutory rule KB (NY/CA), Advice Auditor regex + citation registry
• Export: docx (Answer draft + editable document)
• Eval: npm run eval:auditor → docs/ADVICE_AUDITOR_EVAL.md
• AI coding tools (build): Cursor agent + Claude — disclosed; we can explain every product path
• Visitors never paste API keys — GROQ_API_KEY on Vercel
```

### Challenges we ran into
```
• Hallucination risk in legal AI → rules-first design; Auditor merge keeps deterministic flags even if the LLM softens them.
• Demo reliability for judges → curated practice fixtures separate from live paste analysis; honest loading copy.
• Early “photo → perfect PDF” path was brittle → pivoted to text/OCR assist + Answer/Hearing/Auditor loop (during the hackathon).
• Plain language for non-lawyers without inventing win percentages.
```

### Accomplishments
```
• Working end-to-end loop: Studio → Answer .docx → Hearing Coach → Advice Auditor
• Dual-track story: Access to Justice + AI Safety in one product
• Auditor mini-eval 25/25 (100% must-hit recall, 0 watch-list false positives)
• 47-entry citation registry (verified / unknown / suspicious format — never auto-“fake”)
• Deployed prototype with server AI; Basic mode still works offline with rules + samples
```

### What we learned
```
• In A2J tools, honesty beats spectacle—false precision (% win scores) destroys trust.
• AI Safety for legal advice needs a deterministic floor, not only an LLM rewrite.
• Judges and scared tenants need the same UX: clear practice vs own-document paths, no key pasting.
```

### What's next
```
• Expand Auditor eval with consented real chatbot logs
• Primary-law link-outs for citations
• Clinic partnerships / more jurisdictions after the core loop is solid
• LexHack Builders Fellowship deployment support
```

### Links (paste in Devpost link fields)
```
Live demo: https://lexmorphai.vercel.app
GitHub: https://github.com/it-withend/lexmorphai
Eval report: https://github.com/it-withend/lexmorphai/blob/main/docs/ADVICE_AUDITOR_EVAL.md
Submission checklist: https://github.com/it-withend/lexmorphai/blob/main/docs/SUBMISSION_CHECKLIST.md
```

### Try it yourself (for judges)
```
1. Open https://lexmorphai.vercel.app → Defense Studio
2. Option A: NYC eviction practice example → review issues → Generate Court Answer → download .docx
3. Practice this case in Hearing Coach (cite RPAPL § 711 / 14-day)
4. Advice Auditor → NYC “skip court” demo → show critical risk + safer rewrite
5. Optional: npm run eval:auditor locally
```

---

## Why this scores on LexHack criteria

| Criterion (weight) | How LexMorph answers |
|--------------------|----------------------|
| Impact & Feasibility (25%) | Real Housing Court + chatbot-harm problem; deployable web app; LawHelp links; honest “not legal advice” |
| Technical Execution (25%) | Working prototype; Groq + rules; measurable Auditor eval; rate limits; clear `src/app` + `src/lib` |
| UX & Design (20%) | No visitor keys; Option A/B Studio; plain English; DRAFT Answer labels |
| Innovation (15%) | Defense loop + AI Safety auditor with non-removable rule floor |
| Presentation (15%) | This write-up + README + eval docs + ≤3 min video (record with script in DEVPOST.md) |

### Rule alignment
- Built during LexHack window (repo from mid-Sep 2026; pivot documented in commits)
- Working prototype + public repo + live URL
- AI tools disclosed (Cursor/Claude build; Groq/Gemini runtime)
- Pre-existing libs declared (Next, docx, Groq SDK, etc.)

---

## Peer submissions note (LexHack 2026)

As of mid-hackathon the **official project gallery is not public yet** (“hang tight”). When it opens, strong Devpost entries usually share:

1. **Clear tagline** (who + problem in one line)  
2. **3–6 screenshots** of the working product (not just logos)  
3. **≤3 min demo video** with captions  
4. **Live URL + GitHub** above the fold  
5. Honest **limitations** + tech stack / AI disclosure  

LexMorph already has paste-ready text in this file + thumbnail in `public/devpost-thumbnail.png`.

