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
  defenseViabilityScore: number; // 0 to 100
  viabilityGrade: 'Strong Dismissal Grounds' | 'Viable Counterclaims' | 'Moderate Defense' | 'Review Needed';
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
  originalImageUrl?: string;
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
