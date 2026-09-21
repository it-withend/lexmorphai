/**
 * Small known-good citation registry for the Advice Auditor demo.
 * Statuses: verified (in list) | unknown (plausible but not listed) | suspicious (malformed).
 * This is NOT primary-law verification against NY Senate / CA Legislature.
 */

export type CitationStatus = 'verified' | 'unknown' | 'suspicious';

export type ClassifiedCitation = {
  raw: string;
  normalized: string;
  status: CitationStatus;
  note: string;
};

/** Curated educational list — expand carefully; do not claim completeness. */
export const KNOWN_GOOD_CITATIONS: Array<{ id: string; aliases: string[]; label: string }> = [
  {
    id: 'ny-rpapl-711-2',
    aliases: ['rpapl 711(2)', 'rpapl § 711(2)', 'rpapl 711', 'ny rpapl § 711(2)'],
    label: 'NY RPAPL § 711(2) (rent demand / nonpayment predicate)',
  },
  {
    id: 'ny-rpl-235-b',
    aliases: ['rpl 235-b', 'rpl § 235-b', 'real property law § 235-b', 'warranty of habitability'],
    label: 'NY RPL § 235-b (warranty of habitability)',
  },
  {
    id: 'ny-rpl-238-a',
    aliases: ['rpl 238-a', 'rpl § 238-a', '238-a(2)'],
    label: 'NY RPL § 238-a (fees / late charges limits)',
  },
  {
    id: 'ny-rpapl-702',
    aliases: ['rpapl 702', 'rpapl § 702'],
    label: 'NY RPAPL § 702 (rent defined for summary proceedings)',
  },
  {
    id: 'ca-civ-1950-5',
    aliases: ['civil code 1950.5', 'civ. code § 1950.5', 'cal. civ. code § 1950.5', '1950.5'],
    label: 'Cal. Civ. Code § 1950.5 (security deposits)',
  },
  {
    id: 'ca-ab-12',
    aliases: ['ab 12', 'assembly bill 12'],
    label: 'California AB 12 (deposit caps context)',
  },
  {
    id: 'fdcpa-1692g',
    aliases: ['15 u.s.c. § 1692g', '15 usc 1692g', '1692g'],
    label: '15 U.S.C. § 1692g (FDCPA validation)',
  },
  {
    id: 'fdcpa-1692e',
    aliases: ['15 u.s.c. § 1692e', '15 usc 1692e', '1692e'],
    label: '15 U.S.C. § 1692e (FDCPA false/misleading)',
  },
];

const CITE_FINDER =
  /\b((?:NY\s+)?RPAPL|(?:NY\s+)?RPL|CPLR|(?:Cal\.?\s*)?Civ(?:il)?\.?\s*Code|U\.?S\.?C\.?|USC)\s*§?\s*[\d.()a-zA-Z-]+/gi;

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/§/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\./g, '')
    .trim();
}

function looksSuspicious(raw: string): boolean {
  const n = normalize(raw);
  // Invented long hyphenated IDs like 7112-449 or 1692g-88 style mashups
  if (/\d{4,}-\d{2,}/.test(n)) return true;
  if (/7112-449|1692g-88|deposit kidnapping/.test(n)) return true;
  if (/rpapl\s*7112/.test(n)) return true;
  return false;
}

function isKnownGood(raw: string): boolean {
  const n = normalize(raw);
  return KNOWN_GOOD_CITATIONS.some((entry) =>
    entry.aliases.some((a) => n.includes(normalize(a)) || normalize(a).includes(n))
  );
}

export function classifyCitationMentions(text: string): ClassifiedCitation[] {
  const out: ClassifiedCitation[] = [];
  const seen = new Set<string>();
  const matches = text.match(CITE_FINDER) || [];
  for (const raw of matches) {
    const key = normalize(raw);
    if (seen.has(key)) continue;
    seen.add(key);

    if (looksSuspicious(raw)) {
      out.push({
        raw,
        normalized: key,
        status: 'suspicious',
        note: 'Format looks like a common LLM invention (odd hyphenated statute ID). Verify on a primary source — we do not auto-call this “fake.”',
      });
      continue;
    }

    if (isKnownGood(raw)) {
      out.push({
        raw,
        normalized: key,
        status: 'verified',
        note: 'Appears in LexMorph’s small known-good educational list (not a guarantee of correct application to facts).',
      });
      continue;
    }

    out.push({
      raw,
      normalized: key,
      status: 'unknown',
      note: 'Not in our small known-good list. Could be real or invented — look it up on legislature / LII before relying on it.',
    });
  }
  return out;
}
