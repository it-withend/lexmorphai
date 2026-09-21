export type DocumentType =
  | 'eviction_notice'
  | 'residential_lease'
  | 'court_summons'
  | 'debt_demand'
  | 'general_contract';

export interface InteractiveField {
  id: string;
  name: string;
  label: string;
  value: string;
  type: 'text' | 'date' | 'amount' | 'checkbox' | 'signature';
  placeholder?: string;
  options?: string[];
}

export interface DocumentSection {
  id: string;
  type: 'header' | 'caption' | 'paragraph' | 'clause' | 'statutory_warning' | 'table' | 'checkbox_list' | 'signature_block';
  title?: string;
  content: string;
  clauseNumber?: string;
  interactiveFields?: InteractiveField[];
  tableData?: {
    headers: string[];
    rows: string[][];
  };
  redFlagId?: string;
}

export interface CourtCaption {
  courtName: string;
  countyOrDistrict: string;
  plaintiff: string;
  defendant: string;
  indexNumber: string;
  assignedJudge?: string;
  documentTitle: string;
}

export interface LegalDefect {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  category:
    | 'procedural_defect'
    | 'unlawful_clause'
    | 'missing_statutory_notice'
    | 'deadline_trap'
    | 'habitability_breach';
  title: string;
  citation: string;
  originalExcerpt: string;
  plainEnglishExplanation: string;
  recommendedDefense: string;
  statutoryRemedy: string;
  dismissalImpactPercentage: number;
}

export interface AuditSummary {
  defenseViabilityScore: number; // internal 0–100 → mapped to qualitative band in UI
  viabilityGrade:
    | 'Strong possible defenses'
    | 'Viable counterclaims'
    | 'Moderate defense signals'
    | 'Needs human review';
  summaryHeadline: string;
  keyFindings: string[];
  actionSteps: {
    stepNumber: number;
    title: string;
    deadline: string;
    description: string;
    urgent: boolean;
  }[];
}

export interface DocumentAST {
  id: string;
  title: string;
  documentType: DocumentType;
  jurisdiction: string;
  /** Optional photo of the paper (OCR assist) — not a 1:1 “visual twin” product claim. */
  originalImageUrl?: string;
  /** Compressed embed used for Word export (set client-side). */
  embedImageUrl?: string;
  embedImageWidth?: number;
  embedImageHeight?: number;
  ocrConfidence?: number;
  /** How this AST was produced. */
  reconstructionMode?: 'sample' | 'ai_ast' | 'text_audit';
  /** Raw pasted / uploaded text shown beside the editor */
  sourceText?: string;
  caption?: CourtCaption;
  metadata: {
    dateIssued: string;
    deadlineDate: string;
    daysRemaining: number;
    claimAmount?: string;
    propertyAddress?: string;
    caseNumber?: string;
  };
  sections: DocumentSection[];
  defects: LegalDefect[];
  audit: AuditSummary;
}

export interface CounterPleading {
  id: string;
  pleadingType: 'verified_answer' | 'motion_to_dismiss' | 'cure_and_dispute_notice';
  title: string;
  caption: CourtCaption;
  generalDenial: string;
  affirmativeDefenses: {
    id: string;
    defenseName: string;
    statutoryBasis: string;
    statement: string;
    selected: boolean;
  }[];
  counterclaims: {
    title: string;
    damagesClaimed: string;
    factualBasis: string;
  }[];
  demandForRelief: string[];
  verificationBlock: {
    declarantName: string;
    penaltyOfPerjuryClause: string;
    date: string;
    county: string;
    signatureStatus: 'unsigned' | 'electronically_signed';
  };
}

export interface HearingSimulatorTurn {
  id: string;
  speaker: 'judge' | 'user';
  text: string;
  feedback?: {
    score: number; // 1-100
    praise: string;
    criticism?: string;
    suggestedLegalRefinement?: string;
  };
}

export interface HearingSimulationState {
  stage: 'introduction' | 'appearance' | 'notice_inspection' | 'affirmative_defenses' | 'habitability_evidence' | 'ruling';
  judgeName: string;
  currentTurnIndex: number;
  overallScore: number;
  turns: HearingSimulatorTurn[];
}

/** AI Legal Advice Safety Auditor (Track D) */
export type AdviceRiskLevel = 'critical' | 'high' | 'moderate' | 'low' | 'unknown';

export type AdviceFlagCategory =
  | 'hallucinated_law'
  | 'wrong_jurisdiction'
  | 'overconfidence'
  | 'dangerous_action'
  | 'missing_disclaimer'
  | 'procedural_trap'
  | 'fabricated_citation';

export interface AdviceSafetyFlag {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  category: AdviceFlagCategory;
  title: string;
  excerpt: string;
  explanation: string;
  saferAlternative: string;
}

export interface AdviceAuditResult {
  id: string;
  overallRisk: number; // 0 = safe, 100 = extremely dangerous
  riskLevel: AdviceRiskLevel;
  summary: string;
  flags: AdviceSafetyFlag[];
  saferRewrite: string;
  checklist: string[];
  disclaimers: string[];
}
