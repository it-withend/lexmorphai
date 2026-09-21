# LexHack 2026 — submission & judging checklist

**Deadline:** Sep 27, 2026 · 5:00 PM EDT  
**Live:** https://lexmorphai.vercel.app  
**Repo:** https://github.com/it-withend/lexmorphai  
**Devpost draft:** `DEVPOST.md`

## Required Devpost fields (eligibility)

| Field | Status | Where / what to paste |
|-------|--------|------------------------|
| Project title & short description | Ready | Title: **LexMorph Defense Studio**. Tagline in `DEVPOST.md` |
| Problem & solution | Ready | `DEVPOST.md` → Problem / Solution |
| Public repo **or** live URL | Ready | Both linked above |
| Demo video ≤ 3 min | **YOU MUST RECORD** | Script at bottom of `DEVPOST.md`; host YouTube / Loom / Vimeo |
| Tech stack & credits | Ready | `DEVPOST.md` → Tech stack & AI disclosure |
| Team members listed | Fill on Devpost | Solo = just you; list everyone who coded |
| Tracks selected | Ready | Primary **Access to Justice**; secondary **AI Safety** |

Without the **video**, the submission is incomplete under official rules.

## Judging weights — where LexMorph stands & what to push

| Criterion | Weight | Current lean | Next lever |
|-----------|--------|--------------|------------|
| Real-World Impact & Feasibility | 25% | Strong problem (Housing Court + chatbot harm); honest limits | Demo video shows scared-tenant path → Answer → Hearing → Auditor; mention LawHelp links |
| Technical Execution | 25% | Strong for a hackathon: rules floor + LLM enrich + eval 25/25 + registry 47 | Point judges to `docs/ADVICE_AUDITOR_EVAL.md` and `/auditor` eval strip |
| User Experience & Design | 20% | Much improved (no visitor API keys; Option A/B; plain language) | Record video at ~110% zoom; one URL only |
| Innovation & Originality | 15% | Advice Auditor safety floor (rules cannot be dropped by LLM) | Say this out loud in video; show combo demo packs |
| Presentation & Documentation | 15% | README + DEVPOST + eval docs | **Video + screenshots on Devpost**; AI disclosure already written |

## Sponsor perks (optional — not required for score)

- **DevSwarm / YouCam:** skip for LexMorph (image/agent tooling ≠ product story).
- Keep product story: A2J loop + AI Safety auditor.

## Pre-submit smoke (10 min)

1. Hard-refresh https://lexmorphai.vercel.app — badge **AI ready** (server `GROQ_API_KEY`).
2. Studio → Option A NYC example → Answer draft → Hearing.
3. Studio → Option B paste short notice → saved after reload.
4. Auditor → NYC bad-advice demo → critical risk + rewrite labeled unverified.
5. `npm run eval:auditor` → 25/25.
6. Confirm Devpost has: live link, GitHub, video, screenshots, team, tracks, AI tools listed.

## What judges should hear in ≤ 3:00

1. Unrepresented tenants + chatbot “skip court” harm.  
2. Studio practice case → plain-English issues → DRAFT Answer.  
3. Hearing coach cites RPAPL § 711 / 14-day.  
4. Auditor catches skip-court + odd citations; rules are a **safety floor**.  
5. Educational only — not a lawyer; eval table = technical proof.
