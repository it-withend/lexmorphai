import { DocumentAST, CounterPleading } from './types';

export interface SampleCase {
  id: string;
  name: string;
  tagline: string;
  category: 'Housing & Eviction' | 'Predatory Lease' | 'Consumer Debt & Summons';
  jurisdiction: string;
  badgeColor: string;
  previewSnippet: string;
  ast: DocumentAST;
  recommendedCounterPleading: CounterPleading;
}

export const SAMPLE_CASES: SampleCase[] = [
  {
    id: 'nyc-eviction-14day-defect',
    name: 'NYC Defective Eviction Notice (3-Day vs 14-Day Demand)',
    tagline: 'Notice to Quit demanding surrender in 3 days with illegal late-fee rent surcharges.',
    category: 'Housing & Eviction',
    jurisdiction: 'New York (Kings County Housing Court)',
    badgeColor: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    previewSnippet: 'TENANT TAKE NOTICE: You are hereby required to pay $4,850.00 within THREE (3) DAYS or deliver up possession...',
    ast: {
      id: 'doc-sample-nyc-eviction',
      title: 'FOURTEEN (14) DAY STATUTORY RENT DEMAND & NOTICE TO VACATE',
      documentType: 'eviction_notice',
      jurisdiction: 'State of New York, County of Kings, Housing Part',
      originalImageUrl: '/samples/nyc_eviction_sample.svg',
      caption: {
        courtName: 'CIVIL COURT OF THE CITY OF NEW YORK',
        countyOrDistrict: 'COUNTY OF KINGS: HOUSING PART',
        plaintiff: 'METROPOLITAN REALTY HOLDINGS LLC, Petitioner-Landlord',
        defendant: 'MARCUS A. REYNOLDS, Respondent-Tenant',
        indexNumber: 'LT-304928-26/KI',
        assignedJudge: 'Hon. Carolyn Walker-Diallo',
        documentTitle: 'WRITTEN DEMAND FOR RENT PRIOR TO COMMENCEMENT OF SUMMARY PROCEEDING',
      },
      metadata: {
        dateIssued: '2026-09-10',
        deadlineDate: '2026-09-13',
        daysRemaining: 1,
        claimAmount: '$4,850.00',
        propertyAddress: '742 Franklin Ave, Apt 4B, Brooklyn, NY 11238',
        caseNumber: 'LT-304928-26/KI',
      },
      sections: [
        {
          id: 'sec-1',
          type: 'caption',
          content:
            'CIVIL COURT OF THE CITY OF NEW YORK\nCOUNTY OF KINGS: HOUSING PART\n------------------------------------------------------------X\nMETROPOLITAN REALTY HOLDINGS LLC,\nPetitioner-Landlord,\n\n-against-                                          Index No. LT-304928-26/KI\n\nMARCUS A. REYNOLDS,\nRespondent-Tenant.\n------------------------------------------------------------X',
        },
        {
          id: 'sec-2',
          type: 'header',
          title: 'FORMAL NOTICE AND DEMAND FOR RENT',
          content: 'PLEASE TAKE NOTICE that you are indebted to the Landlord for premises located at 742 Franklin Ave, Apt 4B, Brooklyn, NY 11238, in the sum of $4,850.00 as follows:',
        },
        {
          id: 'sec-3',
          type: 'table',
          content: 'Itemized Schedule of Alleged Rental Arrears:',
          tableData: {
            headers: ['Month / Period', 'Base Monthly Rent', 'Late Charge (Added Rent)', 'Total Amount Due'],
            rows: [
              ['July 2026', '$2,200.00', '$150.00', '$2,350.00'],
              ['August 2026', '$2,200.00', '$150.00', '$2,350.00'],
              ['Legal & Administrative Fee', '$0.00', '$150.00', '$150.00'],
            ],
          },
          redFlagId: 'defect-illegal-added-rent',
        },
        {
          id: 'sec-4',
          type: 'statutory_warning',
          clauseNumber: 'PARAGRAPH 3',
          content:
            'TAKE NOTICE THAT YOU MUST PAY THE FULL AMOUNT OF $4,850.00 WITHIN THREE (3) DAYS FROM THE SERVICE OF THIS NOTICE OR SURRENDER POSSESSION OF SAID PREMISES, IN DEFAULT WHEREOF SUMMARY DISPOSSESS PROCEEDINGS WILL BE COMMENCED AGAINST YOU.',
          redFlagId: 'defect-ny-3day-notice',
        },
        {
          id: 'sec-5',
          type: 'clause',
          clauseNumber: 'PARAGRAPH 4',
          content:
            'Tenant acknowledges that the premises are rented "AS IS" and Landlord is not liable for heat outages, plumbing back-ups, or elevator disruptions during the tenancy term.',
          redFlagId: 'defect-ny-habitability-waiver',
        },
        {
          id: 'sec-6',
          type: 'signature_block',
          content:
            'Dated: September 10, 2026\n\nBy: _____________________________________\n    ARTHUR STERLING, ESQ.\n    Attorney for Petitioner-Landlord\n    Wall Street Plaza, Suite 1400, New York, NY 10005',
          interactiveFields: [
            {
              id: 'field-tenant-signature',
              name: 'tenantSignature',
              label: 'Tenant Verification Acknowledgment',
              value: '',
              type: 'signature',
              placeholder: 'Type your full legal name to sign',
            },
          ],
        },
      ],
      defects: [
        {
          id: 'defect-ny-3day-notice',
          severity: 'critical',
          category: 'procedural_defect',
          title: 'Defective 3-Day Notice Period (Statutory Requirement: 14 Days)',
          citation: 'NY RPAPL § 711(2) as amended by HSTPA 2019',
          originalExcerpt: 'TAKE NOTICE THAT YOU MUST PAY THE FULL AMOUNT OF $4,850.00 WITHIN THREE (3) DAYS...',
          plainEnglishExplanation:
            'Under New York law, landlords can NO LONGER demand rent in 3 days. The law strictly requires an unequivocal written demand giving at least FOURTEEN (14) full days. Demanding payment in 3 days renders this notice completely void.',
          recommendedDefense: 'First Affirmative Defense: Lack of Subject Matter Jurisdiction Due to Defective Predicate Notice.',
          statutoryRemedy: 'Move to dismiss the nonpayment petition for defective predicate notice under RPAPL § 711(2). Educational framing only — a court decides.',
          dismissalImpactPercentage: 80,
        },
        {
          id: 'defect-illegal-added-rent',
          severity: 'critical',
          category: 'unlawful_clause',
          title: 'Illegal Collection of Late Charges as "Added Rent"',
          citation: 'NY Real Property Law § 238-a(2) & RPAPL § 702',
          originalExcerpt: 'Late Charge (Added Rent) - $150.00 per month; Legal & Admin Fee $150.00',
          plainEnglishExplanation:
            'New York law caps late fees at $50 or 5% of monthly rent (whichever is less) and explicitly FORBIDS landlords from suing for late fees or legal fees in residential nonpayment summary proceedings.',
          recommendedDefense: 'Second Affirmative Defense & Partial Dismissal: Improper Demand for Non-Rent Surcharges.',
          statutoryRemedy: 'Striking of $450 in illegal charges from the petition and statutory penalty.',
          dismissalImpactPercentage: 90,
        },
        {
          id: 'defect-ny-habitability-waiver',
          severity: 'critical',
          category: 'habitability_breach',
          title: 'Void Clause: Waiver of Statutory Warranty of Habitability',
          citation: 'NY Real Property Law § 235-b',
          originalExcerpt: 'Tenant acknowledges that the premises are rented "AS IS" and Landlord is not liable for heat outages...',
          plainEnglishExplanation:
            'Every residential lease in NY carries an un-waivable guarantee of safe, clean, and heated living conditions. Any clause stating you take the apartment "AS IS" is null, void, and against public policy.',
          recommendedDefense: 'Third Affirmative Defense and Counterclaim: Breach of Statutory Warranty of Habitability.',
          statutoryRemedy: 'Judicial inspection and rent abatement (discount) of up to 50%-100% for unlivable conditions.',
          dismissalImpactPercentage: 85,
        },
      ],
      audit: {
        defenseViabilityScore: 82,
        viabilityGrade: 'Strong possible defenses',
        summaryHeadline: 'Notice looks defective under NY RPAPL § 711 — strong issues to raise (not a win prediction)',
        keyFindings: [
          'Landlord provided only 3 days instead of the mandatory 14-day statutory notice under HSTPA 2019.',
          'Notice includes unlawful $450 in late & administrative fees prohibited under NY RPL § 238-a.',
          'Lease clause attempting to waive the Warranty of Habitability is completely void under RPL § 235-b.',
        ],
        actionSteps: [
          {
            stepNumber: 1,
            title: 'Draft a written Answer with defenses',
            deadline: 'Within 14 days of court summons service',
            description: 'Submit your Answer asserting jurisdictional defect and habitability counterclaims.',
            urgent: true,
          },
          {
            stepNumber: 2,
            title: 'Request Court HPD Inspection',
            deadline: 'On initial appearance date',
            description: 'Ask the clerk or judge for an official NYC HPD inspection of heat, water, and leaks.',
            urgent: false,
          },
          {
            stepNumber: 3,
            title: 'Prepare Evidence Dossier',
            deadline: 'Prior to court appearance',
            description: 'Compile timestamped photos of outages and records of complaints sent to landlord.',
            urgent: false,
          },
        ],
      },
    },
    recommendedCounterPleading: {
      id: 'pleading-nyc-verified-answer',
      pleadingType: 'verified_answer',
      title: 'VERIFIED ANSWER WITH AFFIRMATIVE DEFENSES & COUNTERCLAIMS',
      caption: {
        courtName: 'CIVIL COURT OF THE CITY OF NEW YORK',
        countyOrDistrict: 'COUNTY OF KINGS: HOUSING PART',
        plaintiff: 'METROPOLITAN REALTY HOLDINGS LLC, Petitioner-Landlord',
        defendant: 'MARCUS A. REYNOLDS, Respondent-Tenant',
        indexNumber: 'LT-304928-26/KI',
        documentTitle: 'VERIFIED ANSWER TO PETITION FOR NONPAYMENT OF RENT',
      },
      generalDenial:
        'Respondent-Tenant MARCUS A. REYNOLDS, appearing pro se, hereby generally denies each and every allegation in the Petition, except admits residence at the subject premises.',
      affirmativeDefenses: [
        {
          id: 'def-1',
          defenseName: 'First Defense: Defective Predicate 14-Day Notice',
          statutoryBasis: 'NY RPAPL § 711(2)',
          statement:
            'Petitioner failed to serve an unequivocal, written fourteen (14) day rent demand as strictly mandated by RPAPL § 711(2). The purported demand granted only three (3) days, depriving this Court of subject matter jurisdiction and requiring dismissal of the proceeding.',
          selected: true,
        },
        {
          id: 'def-2',
          defenseName: 'Second Defense: Unlawful Fees Sought as Rent',
          statutoryBasis: 'NY RPL § 238-a(2) and RPAPL § 702',
          statement:
            'Petitioner unlawfully incorporates late charges and administrative fees totaling $450.00 into the alleged rental arrears. Under NY law, non-rent charges may not be sought in a summary nonpayment proceeding.',
          selected: true,
        },
        {
          id: 'def-3',
          defenseName: 'Third Defense & Counterclaim: Breach of Warranty of Habitability',
          statutoryBasis: 'NY RPL § 235-b',
          statement:
            'Petitioner breached the statutory warranty of habitability by failing to provide adequate heat, experiencing chronic hot water interruptions, and failing to remediate severe plumbing leaks despite repeated written notice. Respondent demands a rent abatement of not less than 50% for the period in question.',
          selected: true,
        },
      ],
      counterclaims: [
        {
          title: 'First Counterclaim: Breach of Statutory Warranty of Habitability',
          damagesClaimed: '$2,200.00 (50% Abatement of July-August Rent)',
          factualBasis:
            'For over 45 days, Respondent suffered documented lack of hot water and chronic ceiling leaks in the bathroom, violating the NYC Housing Maintenance Code.',
        },
      ],
      demandForRelief: [
        '1. Dismissal of the Petition for failure to serve a valid 14-day rent demand under RPAPL § 711(2);',
        '2. An award of full rent abatement for Petitioner\'s breach of the warranty of habitability in the amount of $2,200.00;',
        '3. An order directing Petitioner to immediately repair all outstanding Housing Maintenance Code violations;',
        '4. Such other and further relief as the Court deems just and proper.',
      ],
      verificationBlock: {
        declarantName: 'MARCUS A. REYNOLDS',
        penaltyOfPerjuryClause:
          'I, MARCUS A. REYNOLDS, affirm under penalty of perjury under the laws of New York that I am the Respondent in this proceeding; that I have read the foregoing Verified Answer and know the contents thereof; and that the same are true to my own knowledge.',
        date: '2026-09-15',
        county: 'Kings County, State of New York',
        signatureStatus: 'electronically_signed',
      },
    },
  },
  {
    id: 'ca-predatory-lease',
    name: 'California Predatory Residential Lease Agreement',
    tagline: 'Standard rental agreement with hidden illegal deposit forfeitures and jury trial waivers.',
    category: 'Predatory Lease',
    jurisdiction: 'State of California (Civil Code § 1950.5)',
    badgeColor: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    previewSnippet: 'SECTION 9: Non-refundable cleaning charge of $800. Tenant explicitly waives constitutional right to trial by jury...',
    ast: {
      id: 'doc-sample-ca-lease',
      title: 'RESIDENTIAL LEASE AND OCCUPANCY AGREEMENT',
      documentType: 'residential_lease',
      jurisdiction: 'State of California, County of Los Angeles',
      originalImageUrl: '/samples/ca_lease_sample.svg',
      metadata: {
        dateIssued: '2026-08-01',
        deadlineDate: '2026-08-15',
        daysRemaining: 0,
        claimAmount: '$2,800.00 / mo',
        propertyAddress: '1420 Ocean Avenue, Apt 12, Santa Monica, CA 90401',
      },
      sections: [
        {
          id: 'sec-ca-1',
          type: 'header',
          title: 'STANDARD RESIDENTIAL LEASE AGREEMENT',
          content: 'This Agreement is entered into between PACIFIC HORIZON PROPERTIES LLC (Owner/Agent) and ELENA VASQUEZ (Resident).',
        },
        {
          id: 'sec-ca-2',
          type: 'clause',
          clauseNumber: 'SECTION 4',
          title: 'SECURITY DEPOSIT & NON-REFUNDABLE CHARGES',
          content:
            'Resident shall deposit the sum of $5,600.00 (two months rent) as security deposit. In addition, Resident agrees to pay an upfront non-refundable cleaning and maintenance charge of $800.00 upon move-in.',
          redFlagId: 'defect-ca-deposit-illegal',
        },
        {
          id: 'sec-ca-3',
          type: 'clause',
          clauseNumber: 'SECTION 11',
          title: 'WAIVER OF JURY TRIAL & MANDATORY PRIVATE ARBITRATION',
          content:
            'Tenant knowingly, voluntarily, and irrevocably waives any and all rights to a trial by jury in any litigation arising out of or related to this Lease or tenancy.',
          redFlagId: 'defect-ca-jury-waiver',
        },
        {
          id: 'sec-ca-4',
          type: 'clause',
          clauseNumber: 'SECTION 16',
          title: 'LANDLORD ENTRY WITHOUT NOTICE',
          content:
            'Owner and its agents retain the unrestricted right to enter the unit at any hour without prior notice for inspections, show-and-sell, or maintenance.',
          redFlagId: 'defect-ca-entry-notice',
        },
      ],
      defects: [
        {
          id: 'defect-ca-deposit-illegal',
          severity: 'critical',
          category: 'unlawful_clause',
          title: 'Statutory Violation: Non-Refundable Deposit & Over-Limit Charge',
          citation: 'California Civil Code § 1950.5(m) & AB 12 (Effective July 1, 2024)',
          originalExcerpt: 'non-refundable cleaning and maintenance charge of $800.00... security deposit of $5,600.00',
          plainEnglishExplanation:
            'California law strictly prohibits any fee from being designated as "non-refundable." Furthermore, California AB 12 caps residential security deposits at a maximum of ONE month\'s rent for almost all landlords.',
          recommendedDefense: 'Demand for Immediate Refund of $2,800 Excess Deposit plus $800 Non-Refundable Surcharge.',
          statutoryRemedy: 'Civil liability of Landlord for up to 2x statutory bad-faith damages under Cal. Civ. Code § 1950.5(l).',
          dismissalImpactPercentage: 92,
        },
        {
          id: 'defect-ca-jury-waiver',
          severity: 'critical',
          category: 'unlawful_clause',
          title: 'Unenforceable Pre-Dispute Jury Waiver',
          citation: 'California Supreme Court: Grafton Partners v. Superior Court (36 Cal. 4th 944)',
          originalExcerpt: 'Tenant knowingly, voluntarily, and irrevocably waives any and all rights to a trial by jury...',
          plainEnglishExplanation:
            'In California, pre-dispute contractual waivers of the right to a jury trial are unconstitutional and void as a matter of law. Landlords cannot force you to give up your jury trial rights in a lease.',
          recommendedDefense: 'Motion to Strike Unenforceable Waiver Clause.',
          statutoryRemedy: 'Clause stricken as null and void as a matter of public policy.',
          dismissalImpactPercentage: 88,
        },
      ],
      audit: {
        defenseViabilityScore: 78,
        viabilityGrade: 'Viable counterclaims',
        summaryHeadline: 'Lease Contains Multiple Illegal Clauses Under California Civil Code',
        keyFindings: [
          'Security deposit exceeds California AB 12 statutory 1-month cap.',
          '$800 non-refundable fee is expressly illegal under Cal. Civ. Code § 1950.5(m).',
          'Pre-dispute jury trial waiver is completely invalid under California law.',
        ],
        actionSteps: [
          {
            stepNumber: 1,
            title: 'Send Formal Statutory Cure Notice',
            deadline: 'Prior to lease signing or within 30 days',
            description: 'Provide written demand to redact illegal clauses and return excess deposit money.',
            urgent: true,
          },
          {
            stepNumber: 2,
            title: 'File Consumer Protection Dispute',
            deadline: 'If landlord refuses refund',
            description: 'File small claims action for up to 2x deposit amount in statutory damages.',
            urgent: false,
          },
        ],
      },
    },
    recommendedCounterPleading: {
      id: 'pleading-ca-cure-demand',
      pleadingType: 'cure_and_dispute_notice',
      title: 'FORMAL NOTICE OF UNLAWFUL LEASE PROVISIONS & DEMAND FOR STATUTORY COMPLIANCE',
      caption: {
        courtName: 'DEMAND SERVED UNDER CALIFORNIA CIVIL CODE',
        countyOrDistrict: 'COUNTY OF LOS ANGELES',
        plaintiff: 'PACIFIC HORIZON PROPERTIES LLC',
        defendant: 'ELENA VASQUEZ',
        indexNumber: 'STATUTORY DISPUTE NOTICE',
        documentTitle: 'FORMAL STATUTORY OBJECTION AND DEMAND FOR CORRECTION',
      },
      generalDenial: 'Resident ELENA VASQUEZ hereby provides formal notice of statutory defects and demands immediate correction.',
      affirmativeDefenses: [
        {
          id: 'def-ca-1',
          defenseName: 'Excess Security Deposit & Illegal Non-Refundable Fee',
          statutoryBasis: 'Cal. Civ. Code § 1950.5 & AB 12',
          statement:
            'Under California Civil Code § 1950.5(m), no lease may characterize any deposit or fee as nonrefundable. Furthermore, under AB 12, security deposits are capped at one month\'s rent ($2,800.00). Demand is hereby made for refund of $3,600.00 in unlawful deposit exactions.',
          selected: true,
        },
      ],
      counterclaims: [],
      demandForRelief: [
        '1. Immediate written amendment striking Section 4, 11, and 16;',
        '2. Refund of $3,600.00 in excess collected deposits within fourteen (14) days;',
        '3. Acknowledgment that Resident retains all statutory rights under California tenant protection laws.',
      ],
      verificationBlock: {
        declarantName: 'ELENA VASQUEZ',
        penaltyOfPerjuryClause: 'I declare under penalty of perjury under the laws of the State of California that the foregoing is true and correct.',
        date: '2026-09-15',
        county: 'Los Angeles, California',
        signatureStatus: 'electronically_signed',
      },
    },
  },
];
