/**
 * Known-good citation registry for the Advice Auditor.
 * Statuses: verified (in list) | unknown (plausible but not listed) | suspicious (malformed).
 * This is NOT live primary-law verification against NY Senate / CA Legislature APIs.
 */

export type CitationStatus = 'verified' | 'unknown' | 'suspicious';

export type ClassifiedCitation = {
  raw: string;
  normalized: string;
  status: CitationStatus;
  note: string;
};

/** Curated educational list (~45 entries). Expand carefully; do not claim completeness. */
export const KNOWN_GOOD_CITATIONS: Array<{ id: string; aliases: string[]; label: string }> = [
  // —— New York RPAPL ——
  {
    id: 'ny-rpapl-711-2',
    aliases: ['rpapl 711(2)', 'rpapl § 711(2)', 'rpapl 711', 'ny rpapl § 711(2)', 'rpapl section 711'],
    label: 'NY RPAPL § 711(2) (rent demand / nonpayment predicate)',
  },
  {
    id: 'ny-rpapl-702',
    aliases: ['rpapl 702', 'rpapl § 702'],
    label: 'NY RPAPL § 702 (rent defined for summary proceedings)',
  },
  {
    id: 'ny-rpapl-713',
    aliases: ['rpapl 713', 'rpapl § 713'],
    label: 'NY RPAPL § 713 (grounds where no landlord-tenant relationship)',
  },
  {
    id: 'ny-rpapl-731',
    aliases: ['rpapl 731', 'rpapl § 731'],
    label: 'NY RPAPL § 731 (commencement of summary proceeding)',
  },
  {
    id: 'ny-rpapl-732',
    aliases: ['rpapl 732', 'rpapl § 732'],
    label: 'NY RPAPL § 732 (nonpayment petition special procedure)',
  },
  {
    id: 'ny-rpapl-733',
    aliases: ['rpapl 733', 'rpapl § 733'],
    label: 'NY RPAPL § 733 (holdover petition timing)',
  },
  {
    id: 'ny-rpapl-735',
    aliases: ['rpapl 735', 'rpapl § 735'],
    label: 'NY RPAPL § 735 (service of papers in summary proceedings)',
  },
  {
    id: 'ny-rpapl-741',
    aliases: ['rpapl 741', 'rpapl § 741'],
    label: 'NY RPAPL § 741 (contents of petition)',
  },
  {
    id: 'ny-rpapl-743',
    aliases: ['rpapl 743', 'rpapl § 743'],
    label: 'NY RPAPL § 743 (answer in summary proceeding)',
  },
  {
    id: 'ny-rpapl-745',
    aliases: ['rpapl 745', 'rpapl § 745'],
    label: 'NY RPAPL § 745 (trial; rent deposit / adjournment rules)',
  },
  {
    id: 'ny-rpapl-747',
    aliases: ['rpapl 747', 'rpapl § 747'],
    label: 'NY RPAPL § 747 (judgment)',
  },
  {
    id: 'ny-rpapl-749',
    aliases: ['rpapl 749', 'rpapl § 749'],
    label: 'NY RPAPL § 749 (warrant of eviction)',
  },
  {
    id: 'ny-rpapl-753',
    aliases: ['rpapl 753', 'rpapl § 753'],
    label: 'NY RPAPL § 753 (stay of warrant / cure opportunities)',
  },
  {
    id: 'ny-rpapl-768',
    aliases: ['rpapl 768', 'rpapl § 768'],
    label: 'NY RPAPL § 768 (unlawful eviction / illegal lockout context)',
  },
  // —— New York RPL ——
  {
    id: 'ny-rpl-223-b',
    aliases: ['rpl 223-b', 'rpl § 223-b', 'real property law § 223-b'],
    label: 'NY RPL § 223-b (retaliatory eviction)',
  },
  {
    id: 'ny-rpl-226-b',
    aliases: ['rpl 226-b', 'rpl § 226-b'],
    label: 'NY RPL § 226-b (assignment / sublet consent)',
  },
  {
    id: 'ny-rpl-227-a',
    aliases: ['rpl 227-a', 'rpl § 227-a'],
    label: 'NY RPL § 227-a (termination on death of tenant — limited)',
  },
  {
    id: 'ny-rpl-234',
    aliases: ['rpl 234', 'rpl § 234'],
    label: 'NY RPL § 234 (attorney fees reciprocity)',
  },
  {
    id: 'ny-rpl-235-a',
    aliases: ['rpl 235-a', 'rpl § 235-a'],
    label: 'NY RPL § 235-a (waiver of jury / certain tenant rights void)',
  },
  {
    id: 'ny-rpl-235-b',
    aliases: ['rpl 235-b', 'rpl § 235-b', 'real property law § 235-b', 'warranty of habitability'],
    label: 'NY RPL § 235-b (warranty of habitability)',
  },
  {
    id: 'ny-rpl-235-e',
    aliases: ['rpl 235-e', 'rpl § 235-e'],
    label: 'NY RPL § 235-e (rent receipts / payment records)',
  },
  {
    id: 'ny-rpl-235-f',
    aliases: ['rpl 235-f', 'rpl § 235-f'],
    label: 'NY RPL § 235-f (occupant / roommate rights)',
  },
  {
    id: 'ny-rpl-238-a',
    aliases: ['rpl 238-a', 'rpl § 238-a', '238-a(2)'],
    label: 'NY RPL § 238-a (fees / late charges limits)',
  },
  // —— New York CPLR / other ——
  {
    id: 'ny-cplr-3211',
    aliases: ['cplr 3211', 'cplr § 3211', 'cplr rule 3211'],
    label: 'NY CPLR 3211 (motion to dismiss)',
  },
  {
    id: 'ny-cplr-3215',
    aliases: ['cplr 3215', 'cplr § 3215'],
    label: 'NY CPLR 3215 (default judgment)',
  },
  {
    id: 'ny-cplr-2103',
    aliases: ['cplr 2103', 'cplr § 2103'],
    label: 'NY CPLR 2103 (service of papers)',
  },
  {
    id: 'ny-hstpa',
    aliases: ['hstpa', 'housing stability and tenant protection act'],
    label: 'NY HSTPA (Housing Stability and Tenant Protection Act of 2019)',
  },
  // —— California Civil Code ——
  {
    id: 'ca-civ-1940-2',
    aliases: ['civil code 1940.2', 'civ. code § 1940.2', 'cal. civ. code § 1940.2'],
    label: 'Cal. Civ. Code § 1940.2 (landlord entry / harassment limits)',
  },
  {
    id: 'ca-civ-1941-1',
    aliases: ['civil code 1941.1', 'civ. code § 1941.1', 'cal. civ. code § 1941.1'],
    label: 'Cal. Civ. Code § 1941.1 (uninhabitable dwelling standards)',
  },
  {
    id: 'ca-civ-1942',
    aliases: ['civil code 1942', 'civ. code § 1942', 'cal. civ. code § 1942'],
    label: 'Cal. Civ. Code § 1942 (repair and deduct — limited)',
  },
  {
    id: 'ca-civ-1942-4',
    aliases: ['civil code 1942.4', 'civ. code § 1942.4', 'cal. civ. code § 1942.4'],
    label: 'Cal. Civ. Code § 1942.4 (collection of rent after certain notices)',
  },
  {
    id: 'ca-civ-1942-5',
    aliases: ['civil code 1942.5', 'civ. code § 1942.5', 'cal. civ. code § 1942.5'],
    label: 'Cal. Civ. Code § 1942.5 (retaliatory eviction / acts)',
  },
  {
    id: 'ca-civ-1946-1',
    aliases: ['civil code 1946.1', 'civ. code § 1946.1', 'cal. civ. code § 1946.1'],
    label: 'Cal. Civ. Code § 1946.1 (termination notice length)',
  },
  {
    id: 'ca-civ-1946-2',
    aliases: ['civil code 1946.2', 'civ. code § 1946.2', 'cal. civ. code § 1946.2', 'ab 1482'],
    label: 'Cal. Civ. Code § 1946.2 / AB 1482 (just-cause eviction — covered tenancies)',
  },
  {
    id: 'ca-civ-1947-3',
    aliases: ['civil code 1947.3', 'civ. code § 1947.3', 'cal. civ. code § 1947.3'],
    label: 'Cal. Civ. Code § 1947.3 (rent payment methods)',
  },
  {
    id: 'ca-civ-1950-5',
    aliases: ['civil code 1950.5', 'civ. code § 1950.5', 'cal. civ. code § 1950.5', '1950.5'],
    label: 'Cal. Civ. Code § 1950.5 (security deposits)',
  },
  {
    id: 'ca-civ-1954',
    aliases: ['civil code 1954', 'civ. code § 1954', 'cal. civ. code § 1954'],
    label: 'Cal. Civ. Code § 1954 (landlord entry)',
  },
  {
    id: 'ca-ab-12',
    aliases: ['ab 12', 'assembly bill 12'],
    label: 'California AB 12 (security deposit caps — context)',
  },
  // —— California CCP (unlawful detainer) ——
  {
    id: 'ca-ccp-1161',
    aliases: ['ccp 1161', 'code of civil procedure 1161', 'cal. ccp § 1161'],
    label: 'Cal. Code Civ. Proc. § 1161 (unlawful detainer grounds / notices)',
  },
  {
    id: 'ca-ccp-1161-1',
    aliases: ['ccp 1161.1', 'code of civil procedure 1161.1', 'cal. ccp § 1161.1'],
    label: 'Cal. Code Civ. Proc. § 1161.1 (commercial rent demand variants)',
  },
  {
    id: 'ca-ccp-1162',
    aliases: ['ccp 1162', 'code of civil procedure 1162', 'cal. ccp § 1162'],
    label: 'Cal. Code Civ. Proc. § 1162 (service of UD notices)',
  },
  // —— Federal consumer / housing (common chatbot cites) ——
  {
    id: 'fdcpa-1692a',
    aliases: ['15 u.s.c. § 1692a', '15 usc 1692a', '1692a'],
    label: '15 U.S.C. § 1692a (FDCPA definitions)',
  },
  {
    id: 'fdcpa-1692c',
    aliases: ['15 u.s.c. § 1692c', '15 usc 1692c', '1692c'],
    label: '15 U.S.C. § 1692c (FDCPA communications)',
  },
  {
    id: 'fdcpa-1692e',
    aliases: ['15 u.s.c. § 1692e', '15 usc 1692e', '1692e'],
    label: '15 U.S.C. § 1692e (FDCPA false/misleading)',
  },
  {
    id: 'fdcpa-1692g',
    aliases: ['15 u.s.c. § 1692g', '15 usc 1692g', '1692g'],
    label: '15 U.S.C. § 1692g (FDCPA validation)',
  },
  {
    id: 'fdcpa-1692k',
    aliases: ['15 u.s.c. § 1692k', '15 usc 1692k', '1692k'],
    label: '15 U.S.C. § 1692k (FDCPA civil liability)',
  },
  {
    id: 'fha-3604',
    aliases: ['42 u.s.c. § 3604', '42 usc 3604', 'fair housing act § 3604'],
    label: '42 U.S.C. § 3604 (Fair Housing Act — discrimination in sale/rental)',
  },
];

const CITE_FINDER =
  /\b((?:NY\s+)?RPAPL|(?:NY\s+)?RPL|(?:NY\s+)?CPLR|(?:Cal\.?\s*)?Civ(?:il)?\.?\s*Code|(?:Cal\.?\s*)?C\.?C\.?P\.?|Code of Civil Procedure|U\.?S\.?C\.?|USC)\s*§?\s*[\d.()a-zA-Z-]+|\b(?:HSTPA|AB\s*12|AB\s*1482)\b/gi;

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
  if (/1692[a-z]-\d{2,}/.test(n)) return true;
  return false;
}

function isKnownGood(raw: string): boolean {
  const n = normalize(raw);
  return KNOWN_GOOD_CITATIONS.some((entry) =>
    entry.aliases.some((a) => {
      const na = normalize(a);
      return n.includes(na) || na.includes(n) || n === na;
    })
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
        note: 'Appears in LexMorph’s known-good educational list (not a guarantee of correct application to facts).',
      });
      continue;
    }

    out.push({
      raw,
      normalized: key,
      status: 'unknown',
      note: 'Not in our known-good list. Could be real or invented — look it up on legislature / LII before relying on it.',
    });
  }
  return out;
}

export function registrySize(): number {
  return KNOWN_GOOD_CITATIONS.length;
}
