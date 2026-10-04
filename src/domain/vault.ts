/**
 * Obywatel - Local Document Vault
 * Conforms to docs/DATA_MODEL.md, docs/PRIVACY.md, and .agents/skills/local-document-vault/SKILL.md
 *
 * Invariants:
 * - Original document bytes/hash are immutable.
 * - OCR extraction, corrections, and drafts form a version tree.
 * - Exact duplicates are flagged by content SHA-256.
 * - Local-first: all data resides in local memory/IndexedDB/encrypted backup.
 */

import { computeSha256, encryptVault, decryptVault, EncryptedContainer } from './crypto';
import {
  Case,
  DocumentRecord,
  DocumentVersion,
  ExtractedField,
  CaseEvent,
  ProceduralDeadline,
  LegalSource,
  LegalAnalysis,
  LetterDraft,
  VaultManifest,
} from './types';

export class LocalVault {
  public vaultId: string;
  public cases: Map<string, Case> = new Map();
  public documents: Map<string, DocumentRecord> = new Map();
  public documentVersions: Map<string, DocumentVersion> = new Map();
  public extractedFields: Map<string, ExtractedField> = new Map();
  public events: Map<string, CaseEvent> = new Map();
  public deadlines: Map<string, ProceduralDeadline> = new Map();
  public legalSources: Map<string, LegalSource> = new Map();
  public legalAnalyses: Map<string, LegalAnalysis> = new Map();
  public letters: Map<string, LetterDraft> = new Map();

  constructor(vaultId = `vault-${Date.now()}`) {
    this.vaultId = vaultId;
  }

  // --- Case Management ---
  public createCase(params: {
    title: string;
    goalDescription: string;
    procedureType: Case['procedureType'];
    authorityName: string;
    authorityJurisdictionReason: string;
  }): Case {
    const id = `case-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const newCase: Case = {
      id,
      title: params.title,
      goalDescription: params.goalDescription,
      procedureType: params.procedureType,
      authorityName: params.authorityName,
      authorityJurisdictionReason: params.authorityJurisdictionReason,
      status: 'intake',
      nextAction: 'Dodaj dokumenty sprawy lub wskaż pierwsze pismo od organu.',
      missingFacts: ['Brak zaimportowanych dokumentów źródłowych'],
      createdAt: now,
      updatedAt: now,
    };
    this.cases.set(id, newCase);
    return newCase;
  }

  // --- Document Import and Immutability ---
  public async importDocument(params: {
    caseId: string;
    type: DocumentRecord['type'];
    direction: DocumentRecord['direction'];
    origin: DocumentRecord['origin'];
    originalFileName: string;
    mimeType: string;
    content: string; // text or raw base64
  }): Promise<{ document: DocumentRecord; initialVersion: DocumentVersion; isDuplicate: boolean }> {
    const contentHash = await computeSha256(params.content);

    // Check for exact duplicate across all stored documents
    let isDuplicate = false;
    for (const doc of this.documents.values()) {
      if (doc.originalSha256 === contentHash) {
        isDuplicate = true;
        break;
      }
    }

    const docId = `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const versionId = `ver-${docId}-v1`;
    const now = new Date().toISOString();

    const initialVersion: DocumentVersion = {
      id: versionId,
      documentId: docId,
      versionNumber: 1,
      kind: 'original',
      contentSha256: contentHash,
      textPayload: params.content,
      createdAt: now,
      toolOrAuthor: 'Lokalny import użytkownika',
    };

    const docRecord: DocumentRecord = {
      id: docId,
      caseIds: [params.caseId],
      type: params.type,
      direction: params.direction,
      origin: params.origin,
      originalFileName: params.originalFileName,
      mimeType: params.mimeType,
      fileSize: new TextEncoder().encode(params.content).length,
      originalSha256: contentHash,
      createdAt: now,
      activeVersionId: versionId,
    };

    this.documentVersions.set(versionId, initialVersion);
    this.documents.set(docId, docRecord);

    // Update case status
    const targetCase = this.cases.get(params.caseId);
    if (targetCase) {
      targetCase.status = 'analyzing';
      targetCase.nextAction = 'Zweryfikuj odczytane pola z dokumentu (daty, sygnaturę, pouczenie).';
      targetCase.missingFacts = targetCase.missingFacts.filter(
        (f) => f !== 'Brak zaimportowanych dokumentów źródłowych'
      );
      targetCase.updatedAt = now;
    }

    return { document: docRecord, initialVersion, isDuplicate };
  }

  // --- Document Versioning (Korekta OCR / Edycja) ---
  public async addDocumentVersion(params: {
    documentId: string;
    kind: DocumentVersion['kind'];
    textPayload: string;
    toolOrAuthor: string;
    parentVersionId?: string;
  }): Promise<DocumentVersion> {
    const doc = this.documents.get(params.documentId);
    if (!doc) {
      throw new Error(`Dokument o ID ${params.documentId} nie istnieje w sejfie.`);
    }

    const existingVersions = Array.from(this.documentVersions.values()).filter(
      (v) => v.documentId === params.documentId
    );
    const nextVersionNumber = existingVersions.length + 1;
    const versionId = `ver-${params.documentId}-v${nextVersionNumber}`;
    const hash = await computeSha256(params.textPayload);
    const now = new Date().toISOString();

    const newVersion: DocumentVersion = {
      id: versionId,
      documentId: params.documentId,
      versionNumber: nextVersionNumber,
      parentVersionId: params.parentVersionId || doc.activeVersionId,
      kind: params.kind,
      contentSha256: hash,
      textPayload: params.textPayload,
      createdAt: now,
      toolOrAuthor: params.toolOrAuthor,
    };

    this.documentVersions.set(versionId, newVersion);
    doc.activeVersionId = versionId;
    return newVersion;
  }

  // --- Field Confirmation / Correction ---
  public recordExtractedField(field: ExtractedField): void {
    this.extractedFields.set(field.id, field);
  }

  public confirmField(fieldId: string, confirmedValue: string, confirmedBy = 'Użytkownik'): ExtractedField {
    const field = this.extractedFields.get(fieldId);
    if (!field) {
      throw new Error(`Pole o ID ${fieldId} nie istnieje.`);
    }
    field.status = 'confirmed';
    field.parsedValue = confirmedValue;
    field.confirmedBy = confirmedBy;
    field.confirmedAt = new Date().toISOString();
    return field;
  }

  public disputeField(fieldId: string, reason: string): ExtractedField {
    const field = this.extractedFields.get(fieldId);
    if (!field) {
      throw new Error(`Pole o ID ${fieldId} nie istnieje.`);
    }
    field.status = 'disputed';
    field.disputeReason = reason;
    return field;
  }

  // --- Events and Deadlines ---
  public addEvent(event: CaseEvent): void {
    this.events.set(event.id, event);
  }

  public setDeadline(deadline: ProceduralDeadline): void {
    this.deadlines.set(deadline.id, deadline);
  }

  // --- Legal Analysis and Letter ---
  public addLegalSource(source: LegalSource): void {
    this.legalSources.set(source.id, source);
  }

  public setLegalAnalysis(analysis: LegalAnalysis): void {
    this.legalAnalyses.set(analysis.id, analysis);
  }

  public setLetter(letter: LetterDraft): void {
    this.letters.set(letter.id, letter);
  }

  // --- Export and Backup ---
  public toManifest(): VaultManifest {
    return {
      manifestVersion: '1.0',
      vaultId: this.vaultId,
      createdAt: new Date().toISOString(),
      cases: Array.from(this.cases.values()),
      documents: Array.from(this.documents.values()),
      documentVersions: Array.from(this.documentVersions.values()),
      extractedFields: Array.from(this.extractedFields.values()),
      events: Array.from(this.events.values()),
      deadlines: Array.from(this.deadlines.values()),
      legalSources: Array.from(this.legalSources.values()),
      legalAnalyses: Array.from(this.legalAnalyses.values()),
      letters: Array.from(this.letters.values()),
    };
  }

  public async exportEncryptedBackup(passphrase: string): Promise<EncryptedContainer> {
    const manifest = this.toManifest();
    const json = JSON.stringify(manifest, null, 2);
    return encryptVault(json, passphrase);
  }

  public static async restoreFromEncryptedBackup(
    container: EncryptedContainer,
    passphrase: string
  ): Promise<LocalVault> {
    const decryptedJson = await decryptVault(container, passphrase);
    const manifest = JSON.parse(decryptedJson) as VaultManifest;
    return LocalVault.fromManifest(manifest);
  }

  public static fromManifest(manifest: VaultManifest): LocalVault {
    const vault = new LocalVault(manifest.vaultId);
    manifest.cases.forEach((c) => vault.cases.set(c.id, c));
    manifest.documents.forEach((d) => vault.documents.set(d.id, d));
    manifest.documentVersions.forEach((v) => vault.documentVersions.set(v.id, v));
    manifest.extractedFields.forEach((f) => vault.extractedFields.set(f.id, f));
    manifest.events.forEach((e) => vault.events.set(e.id, e));
    manifest.deadlines.forEach((dl) => vault.deadlines.set(dl.id, dl));
    manifest.legalSources.forEach((s) => vault.legalSources.set(s.id, s));
    manifest.legalAnalyses.forEach((a) => vault.legalAnalyses.set(a.id, a));
    manifest.letters.forEach((l) => vault.letters.set(l.id, l));
    return vault;
  }
}
