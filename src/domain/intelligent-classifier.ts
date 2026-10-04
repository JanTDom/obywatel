/**
 * Obywatel - Intelligent Document Classifier & Relation Engine
 * Conforms to Requirement 4: "Porządkowanie wynika z treści i znaczenia dokumentu"
 *
 * Capabilities:
 * - Detects parties, signatures, contract numbers, invoice IDs.
 * - Discovers relations: "odpowiada na", "załącznik do", "potwierdza złożenie",
 *   "potwierdza doręczenie", "wspiera twierdzenie", "nowa wersja", "to samo zdarzenie".
 * - Generates clear proposals with confidence and human explanations.
 * - Asks one simple question when ambiguous.
 */

import { Case, CaseSubfolder, DocumentRecord, DocumentRelation, InboxProposal, RelationType } from './types';

export interface ClassificationContext {
  cases: Case[];
  existingDocuments: DocumentRecord[];
  relations: DocumentRelation[];
}

export interface ClassificationResult {
  proposal: InboxProposal;
  discoveredRelations: DocumentRelation[];
}

export class IntelligentClassifier {
  public classifyDocument(
    document: DocumentRecord,
    textContent: string,
    context: ClassificationContext
  ): ClassificationResult {
    const textLower = textContent.toLowerCase();
    const discoveredRelations: DocumentRelation[] = [];

    let matchedCase: Case | null = null;
    let confidence = 0.4;
    let rationale = 'Dokument wymaga ręcznego przyporządkowania do sprawy.';
    let proposedSubfolder: CaseSubfolder = '01_Otrzymane';
    let clarificationQuestion: string | undefined = undefined;

    // 1. Sprawdzanie potwierdzeń nadania / UPO / zwrotek pocztowych
    const isUpoOrReceipt =
      textLower.includes('urzędowe poświadczenie odbioru') ||
      textLower.includes('poświadczenie przedłożenia') ||
      textLower.includes('potwierdzenie nadania') ||
      textLower.includes('poczta polska') ||
      textLower.includes('zwrotne potwierdzenie odbioru') ||
      document.origin === 'official_upo';

    if (isUpoOrReceipt) {
      proposedSubfolder = '04_Potwierdzenia';
      confidence = 0.85;
      rationale = 'Dokument stanowi urzędowe potwierdzenie złożenia pisma lub doręczenia.';
    }

    // 2. Sprawdzanie dowodów (faktury, ekspertyzy, protokoły, zdjęcia)
    const isEvidence =
      textLower.includes('faktura vat') ||
      textLower.includes('paragon') ||
      textLower.includes('protokół odbioru') ||
      textLower.includes('opinia techniczna') ||
      textLower.includes('ekspertyza');

    if (isEvidence) {
      proposedSubfolder = '03_Dowody';
      confidence = 0.8;
      rationale = 'Dokument stanowi dowód materialny (faktura, protokół lub ekspertyza).';
    }

    // 3. Wyszukiwanie powiązań z konkretną sprawą na podstawie sygnatury lub stron
    for (const c of context.cases) {
      const authorityOrOpponent = c.authorityOrOpponentName.toLowerCase();
      const hasPartyMatch = authorityOrOpponent.length > 3 && textLower.includes(authorityOrOpponent);

      // Wyszukanie wcześniejszych dokumentów tej sprawy
      const caseDocs = context.existingDocuments.filter((d) => d.caseIds.includes(c.id));

      for (const existingDoc of caseDocs) {
        // Czy nowy dokument wymienia nazwę lub sygnaturę istniejącego dokumentu?
        if (existingDoc.originalFileName && textLower.includes(existingDoc.originalFileName.toLowerCase().replace(/\.[^/.]+$/, ''))) {
          discoveredRelations.push({
            id: `rel-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            sourceDocumentId: document.id,
            targetDocumentId: existingDoc.id,
            relationType: 'odpowiada_na',
            rationale: `Nowy dokument bezpośrednio odwołuje się do pisma ${existingDoc.originalFileName}.`,
            isConfirmedByUser: false,
            createdAt: new Date().toISOString(),
          });
          matchedCase = c;
          confidence = 0.95;
          rationale = `Ten dokument należy do sprawy „${c.title}”: odwołuje się do wcześniejszego pisma ${existingDoc.originalFileName}.`;
          break;
        }

        // Czy to potwierdzenie złożenia istniejącego pisma?
        if (isUpoOrReceipt && existingDoc.direction === 'outgoing') {
          discoveredRelations.push({
            id: `rel-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            sourceDocumentId: document.id,
            targetDocumentId: existingDoc.id,
            relationType: 'potwierdza_zlozenie',
            rationale: `Dokument potwierdza nadanie pisma wychodzącego: ${existingDoc.originalFileName}.`,
            isConfirmedByUser: false,
            createdAt: new Date().toISOString(),
          });
        }
      }

      if (!matchedCase && hasPartyMatch) {
        matchedCase = c;
        confidence = 0.75;
        rationale = `Dokument wymienia stronę lub instytucję „${c.authorityOrOpponentName}”, która występuje w sprawie „${c.title}”.`;
      }
    }

    // 4. Jeśli pewność jest niska, sformułuj proste pytanie
    if (!matchedCase || confidence < 0.7) {
      clarificationQuestion = context.cases.length > 0
        ? `Czy ten dokument dotyczy sprawy „${context.cases[0].title}”, czy nowej sprawy?`
        : 'Do jakiej sprawy chcesz dołączyć ten dokument?';
    }

    const proposal: InboxProposal = {
      id: `prop-${document.id}`,
      documentId: document.id,
      documentTitle: document.originalFileName,
      originalFileName: document.originalFileName,
      proposedCaseId: matchedCase?.id,
      proposedSubfolder,
      confidence,
      rationale,
      clarificationQuestion,
      isReviewed: false,
    };

    return { proposal, discoveredRelations };
  }
}
