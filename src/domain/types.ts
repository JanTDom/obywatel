/**
 * Obywatel - Domain Types
 * Strict domain modeling conforming to docs/DATA_MODEL.md, docs/PRIVACY.md, docs/LEGAL_KNOWLEDGE.md
 */

export type CaseStatus =
  | 'intake'
  | 'analyzing'
  | 'action_ready'
  | 'letter_drafted'
  | 'prepared'
  | 'submitted'
  | 'closed';

export type ProcedureType =
  | 'administrative'
  | 'public_information'
  | 'complaint_or_petition'
  | 'other';

export interface Case {
  id: string;
  title: string;
  goalDescription: string;
  procedureType: ProcedureType;
  authorityName: string;
  authorityJurisdictionReason: string;
  status: CaseStatus;
  nextAction: string;
  missingFacts: string[];
  createdAt: string;
  updatedAt: string;
}

export type DocumentType =
  | 'decision'
  | 'request'
  | 'notification'
  | 'summons'
  | 'appeal'
  | 'proof_of_delivery'
  | 'other';

export type CorrespondenceDirection = 'incoming' | 'outgoing';

export type DocumentOrigin =
  | 'scan'
  | 'pdf_digital'
  | 'photo'
  | 'citizen_draft'
  | 'official_upo';

export interface DocumentRecord {
  id: string;
  caseIds: string[];
  type: DocumentType;
  direction: CorrespondenceDirection;
  origin: DocumentOrigin;
  originalFileName: string;
  mimeType: string;
  fileSize: number;
  originalSha256: string;
  createdAt: string;
  activeVersionId: string;
}

export type DocumentVersionKind =
  | 'original'
  | 'ocr_extracted'
  | 'user_corrected'
  | 'draft'
  | 'exported_pdf'
  | 'redacted';

export interface DocumentVersion {
  id: string;
  documentId: string;
  versionNumber: number;
  parentVersionId?: string;
  kind: DocumentVersionKind;
  contentSha256: string;
  textPayload?: string;
  createdAt: string;
  toolOrAuthor: string;
}

export type FieldStatus = 'unknown' | 'proposed' | 'confirmed' | 'disputed';

export type ExtractedFieldName =
  | 'case_signature'
  | 'issuing_authority'
  | 'document_date'
  | 'delivery_date'
  | 'appeal_deadline_days'
  | 'appeal_body'
  | 'instruction_text';

export interface ExtractedField {
  id: string;
  documentId: string;
  versionId: string;
  fieldName: ExtractedFieldName;
  label: string;
  rawValue: string;
  parsedValue?: string;
  status: FieldStatus;
  pageNumber: number;
  fragmentSnippet: string;
  ocrConfidence: number; // 0.0 - 1.0
  confirmedBy?: string;
  confirmedAt?: string;
  disputeReason?: string;
}

export type EventType =
  | 'document_issued'
  | 'document_sent'
  | 'document_delivered'
  | 'citizen_action'
  | 'deadline_calculated';

export type DatePrecision = 'exact' | 'uncertain' | 'unknown';

export interface CaseEvent {
  id: string;
  caseId: string;
  type: EventType;
  title: string;
  date: string; // YYYY-MM-DD or 'unknown'
  datePrecision: DatePrecision;
  documentVersionId?: string;
  proofDocumentId?: string;
  isConfirmed: boolean;
  notes?: string;
}

export type DeadlineStatus = 'unknown' | 'active' | 'expired' | 'suspended';

export interface ProceduralDeadline {
  id: string;
  caseId: string;
  baseEventId: string;
  ruleVersion: string;
  legalBasisId: string;
  legalStateDate: string;
  daysCount: number;
  startDate: string | 'unknown';
  calculatedEndDate: string | 'unknown';
  status: DeadlineStatus;
  assumptions: string[];
  calculationLog: string[];
  isWeekendOrHolidayShifted: boolean;
  actionRequired: string;
}

export type LegalSourceType =
  | 'statute'
  | 'regulation'
  | 'court_ruling'
  | 'eli_act';

export interface LegalSource {
  id: string;
  sourceType: LegalSourceType;
  officialUrl: string;
  publisher: string;
  actOrCaseId: string; // np. Dz.U. 1960 nr 30 poz. 168
  articleOrPage: string; // np. art. 57 § 1-4
  versionId: string;
  effectiveFrom: string;
  effectiveTo: string | 'in_force';
  retrievedAt: string;
  contentHash: string;
  verificationStatus: 'verified' | 'unverified' | 'superseded' | 'disputed';
  supportsClaim: string;
  quoteText: string;
}

export interface LegalAnalysis {
  id: string;
  caseId: string;
  problem: string;
  establishedFacts: {
    fact: string;
    proofDocVersionId?: string;
    page?: number;
  }[];
  missingFacts: string[];
  claims: {
    claim: string;
    sourceId: string;
    interpretationNote: string;
  }[];
  actionVariants: {
    id: string;
    title: string;
    conditions: string;
    risks: string;
    cost: string;
    deadlines: string;
    recommended: boolean;
  }[];
  counterArguments: string[];
  verificationStatus: 'verified' | 'requires_lawyer' | 'unverified';
}

export type LetterStatus =
  | 'draft'
  | 'prepared'
  | 'exported'
  | 'sent_by_user'
  | 'receipt_added'
  | 'confirmed_by_receipt';

export interface LetterChecklistItem {
  id: string;
  item: string;
  checked: boolean;
  isMandatory: boolean;
  verificationDetail: string;
}

export interface LetterDraft {
  id: string;
  caseId: string;
  title: string;
  letterType: 'odwolanie' | 'wniosek_o_informacje' | 'ponaglenie' | 'skarga';
  recipient: {
    name: string;
    addressOrChannel: string;
    intermediaryAuthority?: string;
  };
  sender: {
    placeholderName: string;
    contactChannel: string;
  };
  caseSignature: string;
  demands: string[];
  factualBasis: string;
  legalJustification: string;
  attachments: {
    id: string;
    title: string;
    documentId?: string;
    included: boolean;
  }[];
  status: LetterStatus;
  checklist: LetterChecklistItem[];
  exportedContent?: string;
  exportSha256?: string;
  userSubmissionReceipt?: {
    channel: string;
    submissionDate: string;
    referenceNumber: string;
    receiptSha256: string;
  };
}

export interface VaultManifest {
  manifestVersion: string;
  vaultId: string;
  createdAt: string;
  cases: Case[];
  documents: DocumentRecord[];
  documentVersions: DocumentVersion[];
  extractedFields: ExtractedField[];
  events: CaseEvent[];
  deadlines: ProceduralDeadline[];
  legalSources: LegalSource[];
  legalAnalyses: LegalAnalysis[];
  letters: LetterDraft[];
  exportedAt?: string;
}
