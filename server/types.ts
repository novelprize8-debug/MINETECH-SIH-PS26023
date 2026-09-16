export type UserRole = 'AUTHORITY' | 'EMPLOYEE' | 'AUDITOR' | 'RESEARCHER';

export type Classification = 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'HIGHLY_RESTRICTED';

export type EvidenceType = 'REPORTED' | 'DERIVED' | 'USER_PROVIDED';

export type MiningMethod = 'OC' | 'UG' | 'TOTAL';

export type ReconciliationStatus = 'CONSISTENT' | 'EXPLAINABLE DIFFERENCE' | 'CONFLICT' | 'NOT COMPARABLE';

export type ExplanationLabel =
  | 'REPORTED'
  | 'DERIVED'
  | 'DOCUMENTED ASSOCIATION'
  | 'SUPPORTED EXPLANATION'
  | 'INSUFFICIENT EVIDENCE';

export type QueryIntent =
  | 'FACT'
  | 'TREND'
  | 'COMPARE'
  | 'TARGET_VS_ACTUAL'
  | 'RECONCILIATION'
  | 'CALCULATION'
  | 'EVIDENCE_AUDIT'
  | 'EXPLANATION'
  | 'REPORT'
  | 'RESEARCH_COMPARISON';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  clearanceLevel: Classification;
}

export interface DocumentRecord {
  id: string;
  title: string;
  docNumber: string;
  issuingAuthority: string; // e.g., 'Coal India Limited', 'CMPDI Ranchi', 'Ministry of Coal'
  date: string;
  version: string;
  classification: Classification;
  isOfficial: boolean;
  isPrivate: boolean;
  uploaderId?: string;
  uploaderName?: string;
  uploaderRole?: UserRole;
  pageCount: number;
  sourceType: 'ANNUAL_REPORT' | 'GEOLOGICAL_NOTE' | 'PROVISIONAL_FLASH' | 'RESEARCH_PAPER' | 'STATISTICAL_BULLETIN';
  summary: string;
  fileSize?: string;
  isSyntheticDemo: boolean;
  uploadedAt: string;
}

export interface EvidenceRecord {
  id: string;
  docId: string;
  docTitle: string;
  docNumber: string;
  docVersion: string;
  issuingAuthority: string;
  entity: string; // e.g., 'MCL', 'ECL', 'BCCL', 'CCL', 'WCL', 'SECL', 'NCL', 'CIL', 'CMPDI'
  metric: string; // e.g., 'Raw Coal Production', 'Offtake', 'Overburden Removal', 'Target Production', 'Washed Coal'
  value: number;
  unit: string; // e.g., 'Million Tonnes (MT)', 'M.Cu.m', '%'
  period: string; // e.g., 'FY2023-24', 'FY2022-23'
  scope: string; // e.g., 'Company Total', 'Ib Valley Area', 'Talcher Coalfield'
  coalType: string; // e.g., 'Thermal / Non-Coking', 'Coking Coal', 'All Grades'
  miningMethod: MiningMethod; // 'OC' (Opencast) | 'UG' (Underground) | 'TOTAL'
  page: number;
  tableOrSection: string;
  excerpt: string;
  extractionMethod: 'TABLE_EXTRACTION' | 'TEXT_NLP' | 'OCR_VERIFIED' | 'USER_UPLOAD';
  reportedOrDerived: EvidenceType;
  confidence: number; // 0.0 - 1.0 (e.g. 0.98)
  classification: Classification;
  timestamp: string;
  isSyntheticDemo: boolean;
  isOfficial?: boolean;
  formula?: string;
  inputs?: Record<string, any>;
  relationships?: {
    derivedFrom?: string[];
    supports?: string[];
    contradicts?: string[];
    sameEntity?: string[];
    sameMetric?: string[];
  };
}

export interface DeterministicCalculation {
  id: string;
  formulaName: string;
  formulaExpression: string;
  inputs: Record<string, { label: string; value: number; unit: string; evidenceId?: string; sourceDoc?: string }>;
  output: number;
  unit: string;
  derivedStatus: 'DERIVED';
  verifiedDeterministic: boolean;
  notes?: string;
}

export interface ReconciliationResult {
  status: ReconciliationStatus;
  summary: string;
  itemA: {
    evidenceId: string;
    docTitle: string;
    docVersion: string;
    value: number;
    unit: string;
    period: string;
    scope: string;
    coalType: string;
    miningMethod: MiningMethod;
    reportedOrDerived: EvidenceType;
  };
  itemB: {
    evidenceId: string;
    docTitle: string;
    docVersion: string;
    value: number;
    unit: string;
    period: string;
    scope: string;
    coalType: string;
    miningMethod: MiningMethod;
    reportedOrDerived: EvidenceType;
  };
  dimensionCheck: {
    entityMatch: boolean;
    metricMatch: boolean;
    periodMatch: boolean;
    unitMatch: boolean;
    scopeMatch: boolean;
    coalTypeMatch: boolean;
    methodMatch: boolean;
    versionMatch: boolean;
  };
  diagnosticExplanation: string;
  documentaryReason?: string;
}

export interface QueryUnderstandingResult {
  rawQuery: string;
  intent: QueryIntent;
  entity?: string;
  metric?: string;
  period?: string;
  periodRange?: string[];
  scope?: string;
  miningMethod?: MiningMethod;
  needsCalculation?: boolean;
  needsReconciliation?: boolean;
  needsReport?: boolean;
  comparisonEntities?: string[];
}

export interface AnswerResponse {
  queryId: string;
  query: string;
  intent: QueryIntent;
  status: 'VERIFIED_EVIDENCE' | 'RECONCILED' | 'CALCULATED' | 'INSUFFICIENT_EVIDENCE' | 'RESTRICTED_ACCESS';
  statusBadge: {
    text: string;
    type: 'success' | 'warning' | 'info' | 'danger';
  };
  answerHeadline: string;
  answerSummary: string;
  primaryMetric?: {
    label: string;
    value: number | string;
    unit: string;
    period: string;
    entity: string;
    confidence: number;
  };
  explanation: {
    label: ExplanationLabel;
    text: string;
    geminiGrounded: boolean;
    evidenceCount: number;
  };
  calculations?: DeterministicCalculation[];
  reconciliation?: ReconciliationResult;
  retrievedEvidence: EvidenceRecord[];
  sources: Array<{
    docId: string;
    title: string;
    docNumber: string;
    issuingAuthority: string;
    version: string;
    page: number;
    classification: Classification;
    isOfficial: boolean;
  }>;
  visualization?: {
    type: 'LINE' | 'BAR' | 'GROUPED_BAR' | 'STACKED_BAR' | 'DONUT' | 'STAT_BOX';
    title: string;
    xAxisKey?: string;
    data: any[];
    series: Array<{ key: string; name: string; color: string; unit?: string }>;
  };
  auditRecordId: string;
  insufficientEvidenceDetails?: string;
  isSyntheticDemo: boolean;
}

export interface AuditLogRecord {
  id: string;
  timestamp: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  };
  action: string;
  query?: string;
  intent?: QueryIntent;
  documentsAccessed: string[];
  evidenceAccessed: string[];
  authResult: 'GRANTED' | 'DENIED';
  reason?: string;
  details?: Record<string, any>;
  ipAddress?: string;
}

export interface ResearchComparisonItem {
  id: string;
  claimEntity: string;
  claimMetric: string;
  claimPeriod: string;
  claimValue: number;
  claimUnit: string;
  excerpt: string;
  status: 'SUPPORTED' | 'CONFLICTING' | 'NO MATCHING EVIDENCE' | 'NOT COMPARABLE';
  matchingOfficialEvidence?: EvidenceRecord;
  reason: string;
}
