# P0 smoke checks (LexHack judging)

Run against local `npm run dev` or production after deploy. No secrets required for #2; #1/#3 prefer live Groq.

## 1) Analyze paste always gets statutory defects

```http
POST /api/analyze
Content-Type: application/json

{
  "rawText": "You have 3 days to pay rent or vacate. Apartment is rented AS IS. Tenant must maintain heat."
}
```

**Accept:** `ast.defects.length >= 2` including notice-period + habitability rule IDs (`defect-ny-notice-period`, `defect-ny-habitability`), even if `jurisdiction` was missing from the LLM.

**Reject:** `defects: []` with `jurisdiction: "Unknown"`.

## 2) Simulate never 500s on missing history

```http
POST /api/simulate
Content-Type: application/json

{ "userResponse": "hello" }
```

**Accept:** `200` with coaching JSON (`source` ai|heuristic), OR `400` if `userResponse` empty.

**Reject:** `500` / `Cannot read properties of undefined (reading 'map')`.

Malformed empty body without `userResponse`:

```json
{}
```

**Accept:** `400` `{ "success": false, "error": "..." }`.

## 3) Hearing Coach does not affirm illegal short NY notice

```http
POST /api/simulate
Content-Type: application/json

{
  "userResponse": "Your Honor, a 3-day notice is enough and valid under New York law.",
  "caseContext": "NYC nonpayment eviction; landlord served a 3-day demand. RPAPL § 711(2) requires 14 days.",
  "history": []
}
```

**Accept:** score ≤ 40 (or corrected criticism) and suggested phrasing cites **14-day / RPAPL § 711(2)** — never “3-day is enough/valid/required”.

## 4) No single-point win % in Studio UI

Open `/studio` → NYC demo → results sidebar.

**Accept:** qualitative band (“Strong possible defenses” / similar) + “Not a court prediction”.

**Reject:** prominent “96% defense viability” / “% dismissal chance” as a win probability.
