import { LegalDefect } from './types';

export interface StatutoryRule {
  id: string;
  jurisdiction: string;
  topic: string;
  citation: string;
  triggerPhrases: string[];
  severity: 'critical' | 'warning' | 'info';
  generateDefect: (matchText: string, context?: Record<string, string>) => LegalDefect;
}

export const STATUTORY_KNOWLEDGE_BASE: StatutoryRule[] = [
  {
    id: 'ny-rpapl-711-14day',
    jurisdiction: 'New York',
    topic: 'Eviction Notice Period',
    citation: 'NY RPAPL § 711(2)',
    triggerPhrases: ['3 days', '3-day notice', '5 days', 'ten (10) days', 'demand within three days'],
    severity: 'critical',
    generateDefect: (matchText) => ({
      id: 'defect-ny-notice-period',
      severity: 'critical',
      category: 'procedural_defect',
      title: 'Jurisdictionally Defective Notice Period (Must be 14 Days)',
      citation: 'NY RPAPL § 711(2) (Housing Stability and Tenant Protection Act)',
      originalExcerpt: matchText,
      plainEnglishExplanation:
        'The landlord demands payment within 3 or 5 days, but New York law strictly requires an unequivocal written demand of at least 14 full days before any summary nonpayment proceeding can commence.',
      recommendedDefense: 'First Affirmative Defense: Lack of Subject Matter Jurisdiction due to Defective Statutory Notice.',
      statutoryRemedy: 'Argue for dismissal of the current nonpayment petition for failure to serve a valid predicate notice under RPAPL § 711(2). Outcomes depend on the facts and the court.',
      dismissalImpactPercentage: 78,
    }),
  },
  {
    id: 'ny-rpl-235b-habitability',
    jurisdiction: 'New York',
    topic: 'Warranty of Habitability',
    citation: 'NY Real Property Law § 235-b',
    triggerPhrases: ['as is', 'tenant agrees to maintain heat', 'landlord not liable for water', 'no rent abatement'],
    severity: 'critical',
    generateDefect: (matchText) => ({
      id: 'defect-ny-habitability',
      severity: 'critical',
      category: 'habitability_breach',
      title: 'Unlawful Waiver of Warranty of Habitability',
      citation: 'NY Real Property Law § 235-b',
      originalExcerpt: matchText,
      plainEnglishExplanation:
        'Any lease provision forcing a tenant to waive the landlord\'s obligation to provide heat, hot water, safe structural conditions, and pest-free housing is void as a matter of public policy.',
      recommendedDefense: 'Affirmative Defense & Counterclaim: Breach of Statutory Warranty of Habitability with Demand for 50-100% Rent Abatement.',
      statutoryRemedy: 'Mandatory judicial rent abatement and court-ordered HPD repair inspections.',
      dismissalImpactPercentage: 88,
    }),
  },
  {
    id: 'ca-civ-1950-5-deposit',
    jurisdiction: 'California',
    topic: 'Security Deposit Limits & Deductions',
    citation: 'Cal. Civ. Code § 1950.5',
    triggerPhrases: ['non-refundable deposit', 'cleaning fee nonrefundable', 'deposit exceeds one month'],
    severity: 'warning',
    generateDefect: (matchText) => ({
      id: 'defect-ca-deposit-cap',
      severity: 'warning',
      category: 'unlawful_clause',
      title: 'Illegal Non-Refundable Fee & Deposit Overcharge',
      citation: 'California Civil Code § 1950.5(m)',
      originalExcerpt: matchText,
      plainEnglishExplanation:
        'California law strictly states no lease may characterize any security deposit as "nonrefundable." AB 12 also limits residential security deposits to maximum 1 month\'s rent.',
      recommendedDefense: 'Counterclaim for Statutory Bad Faith Deposit Penalty (up to 2x deposit amount under § 1950.5(l)).',
      statutoryRemedy: 'Full refund of excess deposit plus statutory bad faith damages.',
      dismissalImpactPercentage: 82,
    }),
  },
  {
    id: 'fdcpa-1692g-validation',
    jurisdiction: 'Federal',
    topic: 'Fair Debt Collection Practices Act',
    citation: '15 U.S.C. § 1692g',
    triggerPhrases: ['pay immediately or face arrest', 'sue within 24 hours', 'immediate garnishment'],
    severity: 'critical',
    generateDefect: (matchText) => ({
      id: 'defect-fdcpa-threat',
      severity: 'critical',
      category: 'missing_statutory_notice',
      title: 'Violation of FDCPA 30-Day Validation & Impermissible Threats',
      citation: '15 U.S.C. §§ 1692e, 1692g',
      originalExcerpt: matchText,
      plainEnglishExplanation:
        'Debt collectors cannot overshadow your statutory 30-day right to dispute debt validity, nor can they threaten criminal action or wage garnishment before obtaining a valid court judgment.',
      recommendedDefense: 'Affirmative Defense and Federal Counterclaim for Statutory Damages under 15 U.S.C. § 1692k.',
      statutoryRemedy: 'Statutory damages up to $1,000 per violation plus mandatory attorney fee shifting.',
      dismissalImpactPercentage: 90,
    }),
  },
];
