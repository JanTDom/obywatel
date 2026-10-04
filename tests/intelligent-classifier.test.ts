/**
 * Tests for Intelligent Document Classifier & Relation Engine
 * Conforms to Requirement 4 ("Inteligentne grupowanie i relacje")
 */

import { describe, it, expect } from 'vitest';
import { IntelligentClassifier } from '../src/domain/intelligent-classifier';
import { Case, DocumentRecord } from '../src/domain/types';

describe('Intelligent Document Classifier & Relations', () => {
  const classifier = new IntelligentClassifier();

  const case1: Case = {
    id: 'S-0001',
    folderName: 'S-0001_Pozwolenie_na_budowe',
    title: 'Pozwolenie na budowę',
    goalDescription: 'Uchylenie decyzji odmownej',
    procedureType: 'administrative',
    opponentType: 'public_authority',
    authorityOrOpponentName: 'Prezydent Miasta Stołecznego Warszawy',
    authorityJurisdictionReason: 'Organ I instancji',
    status: 'analyzing',
    nextAction: 'Weryfikacja',
    missingFacts: [],
    createdAt: '2026-09-15T10:00:00Z',
    updatedAt: '2026-09-15T10:00:00Z',
  };

  const case2: Case = {
    id: 'S-0002',
    folderName: 'S-0002_Reklamacja_laptopa',
    title: 'Reklamacja laptopa',
    goalDescription: 'Wymiana wadliwego sprzętu',
    procedureType: 'consumer_dispute',
    opponentType: 'company',
    authorityOrOpponentName: 'Elektronika Polska Sp. z o.o.',
    authorityJurisdictionReason: 'Sprzedawca towaru',
    status: 'analyzing',
    nextAction: 'Odpowiedź',
    missingFacts: [],
    createdAt: '2026-09-22T10:00:00Z',
    updatedAt: '2026-09-22T10:00:00Z',
  };

  const existingDocCase1: DocumentRecord = {
    id: 'doc-decyzja-142',
    caseIds: ['S-0001'],
    type: 'decision',
    direction: 'incoming',
    origin: 'pdf_digital',
    originalFileName: 'decyzja_142_2026.pdf',
    mimeType: 'application/pdf',
    fileSize: 1024,
    originalSha256: 'hash1',
    createdAt: '2026-09-15T11:00:00Z',
    activeVersionId: 'v1',
  };

  const context = {
    cases: [case1, case2],
    existingDocuments: [existingDocCase1],
    relations: [],
  };

  it('classifies postal receipt / UPO into 04_Potwierdzenia with high confidence', () => {
    const receiptDoc: DocumentRecord = {
      id: 'doc-zwrotka',
      caseIds: [],
      type: 'proof_of_delivery',
      direction: 'incoming',
      origin: 'official_upo',
      originalFileName: 'zolta_zwrotka_pocztowa.pdf',
      mimeType: 'application/pdf',
      fileSize: 512,
      originalSha256: 'hash2',
      createdAt: '2026-09-18T12:00:00Z',
      activeVersionId: 'v1',
    };

    const text = 'POCZTA POLSKA S.A. POTWIERDZENIE ODBIORU PRZESYŁKI POLECONEJ. Data doręczenia: 2026-09-18';
    const { proposal } = classifier.classifyDocument(receiptDoc, text, context);

    expect(proposal.proposedSubfolder).toBe('04_Potwierdzenia');
    expect(proposal.confidence).toBeGreaterThanOrEqual(0.8);
    expect(proposal.rationale).toContain('potwierdzenie');
  });

  it('classifies VAT invoice into 03_Dowody', () => {
    const invoiceDoc: DocumentRecord = {
      id: 'doc-inv',
      caseIds: [],
      type: 'invoice',
      direction: 'incoming',
      origin: 'pdf_digital',
      originalFileName: 'faktura_vat_8812.pdf',
      mimeType: 'application/pdf',
      fileSize: 800,
      originalSha256: 'hash3',
      createdAt: '2026-08-10T10:00:00Z',
      activeVersionId: 'v1',
    };

    const text = 'FAKTURA VAT NR FV/2026/08/10/8812. Sprzedawca: Elektronika Polska Sp. z o.o. Nabywca: Jan Kowalski';
    const { proposal } = classifier.classifyDocument(invoiceDoc, text, context);

    expect(proposal.proposedSubfolder).toBe('03_Dowody');
    expect(proposal.proposedCaseId).toBe('S-0002');
    expect(proposal.confidence).toBeGreaterThanOrEqual(0.75);
  });

  it('discovers "odpowiada_na" relation when incoming letter references earlier document', () => {
    const answerDoc: DocumentRecord = {
      id: 'doc-ans',
      caseIds: [],
      type: 'other',
      direction: 'incoming',
      origin: 'scan',
      originalFileName: 'odpowiedz_organu.pdf',
      mimeType: 'application/pdf',
      fileSize: 900,
      originalSha256: 'hash4',
      createdAt: '2026-09-20T10:00:00Z',
      activeVersionId: 'v1',
    };

    const text = 'W nawiązaniu do pisma decyzja_142_2026 informuję, że wniosek został przekazany do SKO.';
    const { proposal, discoveredRelations } = classifier.classifyDocument(answerDoc, text, context);

    expect(proposal.proposedCaseId).toBe('S-0001');
    expect(discoveredRelations.some((r) => r.relationType === 'odpowiada_na')).toBe(true);
    expect(discoveredRelations[0].targetDocumentId).toBe('doc-decyzja-142');
  });

  it('formulates a simple question when confidence is below threshold', () => {
    const unknownDoc: DocumentRecord = {
      id: 'doc-unknown',
      caseIds: [],
      type: 'other',
      direction: 'incoming',
      origin: 'scan',
      originalFileName: 'nieznany_skan.pdf',
      mimeType: 'application/pdf',
      fileSize: 300,
      originalSha256: 'hash5',
      createdAt: '2026-09-25T10:00:00Z',
      activeVersionId: 'v1',
    };

    const text = 'Zwykły tekst bez sygnatury ani nazw stron.';
    const { proposal } = classifier.classifyDocument(unknownDoc, text, context);

    expect(proposal.confidence).toBeLessThan(0.7);
    expect(proposal.clarificationQuestion).toBeDefined();
    expect(proposal.clarificationQuestion).toContain('Czy ten dokument dotyczy sprawy');
  });
});
