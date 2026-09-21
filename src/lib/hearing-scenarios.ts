import { Building2, ScrollText, Scale, LucideIcon } from 'lucide-react';

export interface HearingScenario {
  id: string;
  title: string;
  shortLabel: string;
  jurisdiction: string;
  Icon: LucideIcon;
  accent: string;
  caseContext: string;
  judgeOpening: string;
  quickAnswers: string[];
  tips: { title: string; body: string }[];
}

export const HEARING_SCENARIOS: HearingScenario[] = [
  {
    id: 'nyc-notice',
    title: 'NYC Nonpayment · Defective 3-day notice',
    shortLabel: 'NYC notice defect',
    jurisdiction: 'NYC Housing Court (Kings)',
    Icon: Building2,
    accent: 'border-amber-500/40 hover:border-amber-400',
    caseContext:
      'NYC nonpayment eviction: landlord served a defective 3-day rent demand instead of the mandatory 14-day written demand under RPAPL § 711(2). Apartment also had heat/hot water outages. Late fees were included as “added rent.”',
    judgeOpening:
      'Good morning. Civil Court of the City of New York, Kings County, Housing Part. Metropolitan Realty Holdings v. Reynolds, Index No. LT-304928-26. Parties present? Respondent-Tenant, identify yourself and state whether you have counsel.',
    quickAnswers: [
      'Your Honor, my name is Marcus Reynolds. I am here without a lawyer. I ask the court to dismiss because the landlord only gave a 3-day demand, not the required 14-day written rent demand under RPAPL § 711(2).',
      'Your Honor, I also raise breach of the warranty of habitability under RPL § 235-b — no heat or hot water for weeks — and request an HPD inspection and rent abatement.',
      'Your Honor, the petition includes late charges and legal fees as rent. Under RPL § 238-a and RPAPL § 702 those are not collectible as rent in this proceeding, and I ask they be stricken.',
    ],
    tips: [
      {
        title: 'Raise jurisdiction first',
        body: 'A bad notice period can end the case before other issues. Lead with the 14-day rule (RPAPL § 711(2)).',
      },
      {
        title: 'Ask for HPD inspection',
        body: 'Independent inspector reports support habitability abatements more than oral claims alone.',
      },
      {
        title: 'Strike non-rent fees',
        body: 'Object when late fees or attorney fees are sued as “rent” in a summary nonpayment case.',
      },
    ],
  },
  {
    id: 'nyc-habitability',
    title: 'NYC · Habitability & rent abatement focus',
    shortLabel: 'Habitability',
    jurisdiction: 'NYC Housing Court',
    Icon: Scale,
    accent: 'border-cyan-500/40 hover:border-cyan-400',
    caseContext:
      'Tenant faces nonpayment petition but apartment lacked heat and hot water for 45+ days. Goal: preserve defenses, request HPD inspection, and argue percentage rent abatement under RPL § 235-b while not conceding jurisdiction if notice was defective.',
    judgeOpening:
      'We are on for a nonpayment trial. Tenant, the landlord claims unpaid rent. Do you dispute the amount, raise conditions, or both? Keep your answer short and cite the legal basis.',
    quickAnswers: [
      'Your Honor, I dispute liability for the full rent. Under RPL § 235-b the warranty of habitability is non-waivable. We had no heat or hot water for over 45 days, and I request a 50% abatement for that period.',
      'Your Honor, I ask the Court to order an expedited HPD inspection so there is an official record of the conditions, not only my testimony.',
      'Your Honor, I notified the landlord in writing about the outages. I can show texts and photos. I am not refusing to pay forever — I am asking the Court to reduce rent for the uninhabitable period.',
    ],
    tips: [
      {
        title: 'Ask for a percentage',
        body: 'Judges need a number: “I request X% abatement for Y dates.”',
      },
      {
        title: 'Evidence beats adjectives',
        body: 'Photos, texts, and HPD complaints beat “it was terrible.”',
      },
      {
        title: 'Don’t overclaim',
        body: 'Seek abatement for the broken period — not a blanket “I never owe rent.”',
      },
    ],
  },
  {
    id: 'ca-deposit',
    title: 'California · Illegal deposit / void clauses',
    shortLabel: 'CA lease traps',
    jurisdiction: 'California (Los Angeles)',
    Icon: ScrollText,
    accent: 'border-blue-500/40 hover:border-blue-400',
    caseContext:
      'California residential lease dispute: landlord labeled security deposit “non-refundable,” charged above one month’s rent, and inserted a jury-trial waiver. Tenant is preparing a statutory objection / cure demand under Civil Code § 1950.5 and related consumer protections — practice speaking clearly to a neutral decision-maker.',
    judgeOpening:
      'This is a landlord-tenant conference calendar. Tenant, summarize in two sentences what you claim is unlawful in the lease and what remedy you want.',
    quickAnswers: [
      'Your Honor, Civil Code § 1950.5 makes “non-refundable” security deposits unlawful. Our lease calls the deposit non-refundable, so I demand return of the excess and statutory remedies for bad-faith withholding.',
      'Your Honor, AB 12 limits most residential deposits to one month’s rent. The charged deposit exceeds that cap, and I ask that the overcharge be refunded.',
      'Your Honor, the lease also tries to waive jury trial rights. I contend that waiver is void as against public policy and should not be enforced.',
    ],
    tips: [
      {
        title: 'Name the code section',
        body: '“Civil Code § 1950.5” lands better than “the deposit law.”',
      },
      {
        title: 'Ask for a concrete remedy',
        body: 'Refund, penalty, or strike the clause — say which one you want.',
      },
      {
        title: 'Stay calm and short',
        body: 'Conference calendars move fast. Two clear sentences beat a speech.',
      },
    ],
  },
];

export function getScenario(id: string): HearingScenario {
  return HEARING_SCENARIOS.find((s) => s.id === id) || HEARING_SCENARIOS[0];
}
