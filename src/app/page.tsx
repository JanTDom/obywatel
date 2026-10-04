'use client';

import React, { useState, useEffect, useTransition } from 'react';
import {
  Shield,
  RefreshCw,
  FolderOpen,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { Navigation, ViewType } from '../components/Navigation';
import { TodayView } from '../components/views/TodayView';
import { CasesView } from '../components/views/CasesView';
import { DiskDocumentsView } from '../components/views/DiskDocumentsView';
import { InboxView } from '../components/views/InboxView';
import { TimelineView } from '../components/views/TimelineView';
import { EvidenceView } from '../components/views/EvidenceView';
import { ActionPlanView } from '../components/views/ActionPlanView';
import { LettersView } from '../components/views/LettersView';
import { LegalKnowledgeView } from '../components/views/LegalKnowledgeView';
import { BackupPrivacyView } from '../components/views/BackupPrivacyView';

import { LocalVault } from '../domain/vault';
import {
  Case,
  CaseEvent,
  CaseSubfolder,
  DocumentRecord,
  DocumentVersion,
  ExtractedField,
  InboxProposal,
  LetterDraft,
  ProceduralDeadline,
  DiskFileInfo,
} from '../domain/types';
import { SYNTHETIC_DATASET } from '../domain/synthetic-data';
import { calculateKpaDeadline } from '../domain/deadlines';
import { OFFICIAL_LEGAL_SOURCES } from '../domain/legal-knowledge';
import { buildCompleteCaseAnalysis } from '../domain/case-analysis';
import { IntelligentClassifier } from '../domain/intelligent-classifier';
import { EncryptedContainer } from '../domain/crypto';
import { LocalOcrEngine } from '../domain/ocr-engine';
import { E2EESyncEngine } from '../domain/sync-engine';

export default function ObywatelApp() {
  const [vault, setVault] = useState<LocalVault>(() => new LocalVault('sejf-lokalny-01'));
  const [activeView, setActiveView] = useState<ViewType>('today');
  const [activeCaseId, setActiveCaseId] = useState<string | null>(null);

  // Status and loading states
  const [isLoadingDemo, setIsLoadingDemo] = useState(false);
  const [isScanningDisk, setIsScanningDisk] = useState(false);
  const [globalNotice, setGlobalNotice] = useState<string | null>(null);
  const [lastMoveDescription, setLastMoveDescription] = useState<string | null>(null);
  const [diskFiles, setDiskFiles] = useState<DiskFileInfo[]>([]);

  // Trigger state refresh for sub-components
  const [, startTransition] = useTransition();
  const triggerRefresh = () => {
    startTransition(() => {
      setVault((prev) => {
        const manifest = prev.toManifest();
        return LocalVault.fromManifest(manifest);
      });
    });
  };

  // Convert vault maps to arrays for UI
  const cases = Array.from(vault.cases.values());
  const documents = Array.from(vault.documents.values());
  const versions = Array.from(vault.documentVersions.values());
  const deadlines = Array.from(vault.deadlines.values());
  const events = Array.from(vault.events.values());
  const letters = Array.from(vault.letters.values());
  const legalSources = Array.from(vault.legalSources.values());
  const inboxProposalsRecord: Record<string, InboxProposal> = {};
  vault.inboxProposals.forEach((p, k) => {
    inboxProposalsRecord[k] = p;
  });

  // Staged inbox documents (documents in Do_uporzadkowania)
  const inboxDocuments = documents.filter(
    (d) => d.subfolder === 'Do_uporzadkowania' || d.caseIds.length === 0
  );

  // Urgent or unknown deadlines count
  const urgentCount = deadlines.filter((d) => d.status === 'unknown' || d.startDate === 'unknown').length;

  // Documents count per case
  const documentCountByCase: Record<string, number> = {};
  cases.forEach((c) => {
    documentCountByCase[c.id] = documents.filter((d) => d.caseIds.includes(c.id)).length;
  });

  // Active case analysis
  const currentCase = activeCaseId
    ? vault.cases.get(activeCaseId)
    : cases.length > 0
    ? cases[0]
    : null;

  const currentAnalysis = currentCase
    ? vault.legalAnalyses.get(currentCase.id) ||
      vault.legalAnalyses.get(`analysis-${currentCase.id}`) ||
      Array.from(vault.legalAnalyses.values()).find((a) => a.caseId === currentCase.id) ||
      null
    : null;
  const currentActionPlan = currentAnalysis?.actionPlan || [];

  // 1. Initial scan on mount
  useEffect(() => {
    handleScanDisk();
  }, []);

  // 2. Skanowanie dysku via API
  const handleScanDisk = async () => {
    setIsScanningDisk(true);
    try {
      const res = await fetch('/api/workspace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'scan',
          knownDocuments: documents,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.scanResult?.files) {
          setDiskFiles(data.scanResult.files);
        }
      }
    } catch {
      // Ignorujemy błędy sieci w trybie offline
    } finally {
      setIsScanningDisk(false);
    }
  };

  // 3. Wczytanie 3 pełnych syntetycznych scenariuszy
  const handleLoadSyntheticDemo = async () => {
    setIsLoadingDemo(true);
    setGlobalNotice('Wczytywanie 3 syntetycznych spraw i zapisywanie plików w Moje_sprawy/ ...');

    try {
      // Sprawa 1: Administracyjna (S-0001)
      const case1 = vault.createCase({
        id: 'S-0001',
        title: 'Odwołanie od odmowy pozwolenia na budowę',
        goalDescription: 'Uchylenie decyzji odmownej i zatwierdzenie projektu budowlanego',
        procedureType: 'administrative',
        opponentType: 'public_authority',
        authorityOrOpponentName: 'Prezydent Miasta Stołecznego Warszawy',
        authorityJurisdictionReason:
          'Organ administracji architektoniczno-budowlanej I instancji właściwy dla Dzielnicy Mokotów',
      });

      // Sprawa 2: Reklamacja konsumencka (S-0002)
      const case2 = vault.createCase({
        id: 'S-0002',
        title: 'Reklamacja wadliwego laptopa (bateria i płyta główna)',
        goalDescription: 'Wymiana sprzętu na nowy wolny od wad lub bezpłatna naprawa',
        procedureType: 'consumer_dispute',
        opponentType: 'company',
        authorityOrOpponentName: 'Elektronika Polska Sp. z o.o.',
        authorityJurisdictionReason: 'Przedsiębiorca / sprzedawca sprzętu elektronicznego (B2C)',
      });

      // Sprawa 3: Spór z umowy cywilnej (S-0003)
      const case3 = vault.createCase({
        id: 'S-0003',
        title: 'Spór z wykonawcą remontu mieszkania',
        goalDescription: 'Usunięcie usterek prac wykończeniowych lub obniżenie wynagrodzenia',
        procedureType: 'contract_dispute',
        opponentType: 'individual',
        authorityOrOpponentName: 'Tomasz Majewski (wykonawca)',
        authorityJurisdictionReason:
          'Wykonawca dzieła remontowego na podstawie art. 627 Kodeksu cywilnego',
      });

      // Utworzenie katalogów na dysku
      for (const c of [case1, case2, case3]) {
        await fetch('/api/workspace', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'create_case_folder',
            folderName: c.folderName,
          }),
        });
      }

      // Import dokumentów syntetycznych
      const classifier = new IntelligentClassifier();

      for (const item of SYNTHETIC_DATASET) {
        let subfolder: CaseSubfolder = '01_Otrzymane';
        let targetCaseId: string | undefined = item.suggestedCaseId;

        // Określenie folderu
        if (
          item.fileName.includes('zolta_zwrotka') ||
          item.fileName.includes('potwierdzenie_odbioru')
        ) {
          subfolder = '04_Potwierdzenia';
        } else if (item.fileName.includes('faktura') || item.fileName.includes('wypis_i_wyrys')) {
          subfolder = '03_Dowody';
        } else if (item.fileName.includes('umowa')) {
          subfolder = '00_Plan_i_opis';
        } else if (item.fileName.includes('wezwanie')) {
          subfolder = '02_Wyslane';
        }

        // Pliki kierowane do Do_uporzadkowania
        const isInboxStaged =
          item.fileName.includes('brak_daty') ||
          item.fileName.includes('wielostronicowy') ||
          item.fileName.includes('KOPIA');

        if (isInboxStaged) {
          subfolder = 'Do_uporzadkowania';
          targetCaseId = undefined;
        }

        const { document } = await vault.importDocument({
          caseId: targetCaseId,
          type: item.fileName.includes('faktura')
            ? 'invoice'
            : item.fileName.includes('umowa')
            ? 'contract'
            : item.fileName.includes('zwrotka')
            ? 'proof_of_delivery'
            : 'decision',
          direction: item.fileName.includes('wezwanie') ? 'outgoing' : 'incoming',
          origin: item.fileName.includes('wielostronicowy') ? 'scan' : 'pdf_digital',
          originalFileName: item.fileName,
          mimeType: 'text/plain',
          content: item.content,
          subfolder,
        });

        // Obsługa dokumentu wspólnego dla S-0001 oraz S-0003
        if (item.fileName.includes('wypis_i_wyrys')) {
          vault.linkDocumentToCase(document.id, 'S-0003');
        }

        // Fizyczny zapis pliku na dysku
        const folderTarget = isInboxStaged
          ? 'Do_uporzadkowania'
          : vault.cases.get(item.suggestedCaseId)?.folderName || 'Do_uporzadkowania';

        await fetch('/api/workspace', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'write_file',
            folderName: isInboxStaged ? '' : folderTarget,
            subfolder: isInboxStaged ? 'Do_uporzadkowania' : subfolder,
            fileName: item.fileName,
            content: item.content,
          }),
        });

        // Jeśli plik jest w skrzynce, przygotuj propozycję inteligentnego klasyfikatora
        if (isInboxStaged) {
          const res = classifier.classifyDocument(document, item.content, {
            cases: Array.from(vault.cases.values()),
            existingDocuments: Array.from(vault.documents.values()),
            relations: Array.from(vault.relations.values()),
          });
          vault.recordInboxProposal(res.proposal);
        }
      }

      // Rejestracja zdarzeń w osi czasu
      vault.addEvent({
        id: 'evt-01',
        caseId: 'S-0001',
        type: 'document_issued',
        title: 'Wydanie decyzji odmownej nr 142/2026',
        date: '2026-09-15',
        datePrecision: 'exact',
        isConfirmed: true,
        notes: 'Prezydent m.st. Warszawy, znak: WAB.6740.1.2026.JK',
      });

      vault.addEvent({
        id: 'evt-02',
        caseId: 'S-0001',
        type: 'document_delivered',
        title: 'Doręczenie decyzji stronie za zwrotnym poświadczeniem odbioru',
        date: '2026-09-18',
        datePrecision: 'exact',
        isConfirmed: true,
        notes: 'Potwierdzone podpisem na żółtej zwrotce pocztowej (UP Warszawa 12)',
      });

      vault.addEvent({
        id: 'evt-03',
        caseId: 'S-0002',
        type: 'document_issued',
        title: 'Zakup laptopa UltraPro 15 w sklepie Elektronika Polska',
        date: '2026-08-10',
        datePrecision: 'exact',
        isConfirmed: true,
        notes: 'Faktura VAT nr FV/2026/08/10/8812',
      });

      vault.addEvent({
        id: 'evt-04',
        caseId: 'S-0002',
        type: 'citizen_action',
        title: 'Wysłanie wiadomości e-mail ze zgłoszeniem usterki',
        date: 'unknown',
        datePrecision: 'unknown',
        isConfirmed: false,
        notes: 'Brak nagłówka z datą w pliku zgłoszenie_usterki_mail_brak_daty.txt (do weryfikacji)',
      });

      // Ustalenie terminu KPA art. 57 dla S-0001
      const deadline1 = calculateKpaDeadline({
        caseId: 'S-0001',
        baseEventId: 'evt-02',
        deliveryDate: '2026-09-18',
        daysCount: 14,
        actionRequired: 'Złożenie odwołania od decyzji nr 142/2026 do Samorządowego Kolegium Odwoławczego',
      });
      vault.setDeadline(deadline1);

      // Źródła prawne
      Object.values(OFFICIAL_LEGAL_SOURCES).forEach((s) => vault.addLegalSource(s));

      // Kompleksowa analiza i plan działania dla S-0001
      const analysis1 = buildCompleteCaseAnalysis({
        caseRecord: case1,
        documents: Array.from(vault.documents.values()).filter((d) => d.caseIds.includes('S-0001')),
        extractedFields: Array.from(vault.extractedFields.values()),
        events: Array.from(vault.events.values()).filter((e) => e.caseId === 'S-0001'),
        deadlines: [deadline1],
      });
      vault.setLegalAnalysis(analysis1);

      // Kompleksowa analiza dla S-0002
      const analysis2 = buildCompleteCaseAnalysis({
        caseRecord: case2,
        documents: Array.from(vault.documents.values()).filter((d) => d.caseIds.includes('S-0002')),
        extractedFields: [],
        events: Array.from(vault.events.values()).filter((e) => e.caseId === 'S-0002'),
        deadlines: [],
      });
      vault.setLegalAnalysis(analysis2);

      // Kompleksowa analiza dla S-0003
      const analysis3 = buildCompleteCaseAnalysis({
        caseRecord: case3,
        documents: Array.from(vault.documents.values()).filter((d) => d.caseIds.includes('S-0003')),
        extractedFields: [],
        events: Array.from(vault.events.values()).filter((e) => e.caseId === 'S-0003'),
        deadlines: [],
      });
      vault.setLegalAnalysis(analysis3);

      setActiveCaseId('S-0001');
      setGlobalNotice('Wczytano 3 sprawy syntetyczne. Dokumenty zapisano fizycznie na dysku.');
      triggerRefresh();
      await handleScanDisk();
    } catch (err: unknown) {
      setGlobalNotice(`Błąd ładowania danych syntetycznych: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoadingDemo(false);
    }
  };

  // 4. Potwierdzenie brakującej daty doręczenia
  const handleConfirmDeliveryDate = (caseId: string, confirmedDate: string) => {
    const deadline = calculateKpaDeadline({
      caseId,
      baseEventId: `evt-${Date.now()}`,
      deliveryDate: confirmedDate,
      daysCount: 14,
      actionRequired: 'Złożenie odwołania do Samorządowego Kolegium Odwoławczego',
    });
    vault.setDeadline(deadline);

    const c = vault.cases.get(caseId);
    if (c) {
      c.missingFacts = c.missingFacts.filter((f) => !f.includes('doręczenia'));
      c.nextAction = `Termin upływa w dniu: ${deadline.calculatedEndDate}. Przygotuj odwołanie.`;
    }

    setGlobalNotice(`Potwierdzono datę doręczenia: ${confirmedDate}. Obliczony koniec terminu: ${deadline.calculatedEndDate}`);
    triggerRefresh();
  };

  // 5. Akceptacja propozycji klasyfikacji i fizyczne przeniesienie pliku
  const handleApproveProposal = async (
    docId: string,
    targetCaseId: string,
    targetSubfolder: CaseSubfolder
  ) => {
    const doc = vault.documents.get(docId);
    const targetCase = vault.cases.get(targetCaseId);
    if (!doc || !targetCase) return;

    const sourcePath = `Do_uporzadkowania/${doc.originalFileName}`;
    const destinationPath = `${targetCase.folderName}/${targetSubfolder}/${doc.originalFileName}`;

    try {
      const res = await fetch('/api/workspace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'move_file',
          sourceRelativePath: sourcePath,
          destinationRelativePath: destinationPath,
          description: `Przeniesiono ${doc.originalFileName} do sprawy ${targetCase.title}`,
          documentId: doc.id,
        }),
      });

      if (res.ok) {
        vault.applyInboxProposal(doc.id, targetCaseId, targetSubfolder);
        setLastMoveDescription(`Przeniesiono fizycznie plik ${doc.originalFileName} do ${destinationPath}`);
        triggerRefresh();
        await handleScanDisk();
      }
    } catch (err: unknown) {
      alert(`Błąd podczas przenoszenia pliku: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  // 6. Ręczne przeniesienie
  const handleManualMove = async (
    docId: string,
    targetCaseId: string,
    targetSubfolder: CaseSubfolder
  ) => {
    await handleApproveProposal(docId, targetCaseId, targetSubfolder);
  };

  // 7. Cofanie operacji (Undo)
  const handleUndoLastMove = async () => {
    try {
      const res = await fetch('/api/workspace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'undo' }),
      });

      if (res.ok) {
        vault.undoLastOperation();
        setLastMoveDescription('Cofnięto ostatnią operację przeniesienia na dysku.');
        triggerRefresh();
        await handleScanDisk();
      }
    } catch (err: unknown) {
      alert(`Błąd operacji cofania: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  // 8. Podział skanu wielostronicowego na dokumenty logiczne
  const handleSplitMultiPageScan = async (docId: string) => {
    const doc = vault.documents.get(docId);
    if (!doc) return;

    // Utworzenie dwóch dokumentów pochodnych ze stronami
    await vault.addDocumentVersion({
      documentId: doc.id,
      kind: 'user_corrected',
      textPayload: 'STRONA 1: UMOWA O DZIEŁO - WARUNKI I ZAKRES PRAC REMONTOWYCH',
      toolOrAuthor: 'Podział logiczny skanu (Strona 1 - Umowa)',
      pageRange: { start: 1, end: 1 },
    });

    await vault.addDocumentVersion({
      documentId: doc.id,
      kind: 'user_corrected',
      textPayload: 'STRONA 2: PROTOKÓŁ ZDAWCZO-ODBIORCZY PRAC REMONTOWYCH Z DNIA 10 SIERPNIA 2026',
      toolOrAuthor: 'Podział logiczny skanu (Strona 2 - Protokół)',
      pageRange: { start: 2, end: 2 },
    });

    setGlobalNotice(`Podzielono skan ${doc.originalFileName} na 2 logiczne dokumenty składowe z zachowaniem oryginału.`);
    triggerRefresh();
  };

  // 9. Przełączanie statusu w planie działania
  const handleToggleStepStatus = (stepId: string) => {
    if (!currentAnalysis) return;
    const step = currentAnalysis.actionPlan.find((s) => s.id === stepId);
    if (!step) return;

    if (step.status === 'completed') {
      step.status = 'pending';
    } else if (step.status === 'pending') {
      step.status = 'in_progress';
    } else {
      step.status = 'completed';
    }
    triggerRefresh();
  };

  // 10. Eksport i Restore zaszyfrowanej kopii
  const handleExportBackup = async (passphrase: string): Promise<EncryptedContainer> => {
    return vault.exportEncryptedBackup(passphrase);
  };

  const handleRestoreBackup = async (
    container: EncryptedContainer,
    passphrase: string
  ): Promise<{ restoredCases: number; restoredDocs: number }> => {
    const restoredVault = await LocalVault.restoreFromEncryptedBackup(container, passphrase);
    setVault(restoredVault);
    return {
      restoredCases: restoredVault.cases.size,
      restoredDocs: restoredVault.documents.size,
    };
  };

  // 11. Lokalny silnik OCR i korekty
  const handleRunLocalOcr = async (docId: string) => {
    const doc = vault.documents.get(docId);
    if (!doc) return;
    const activeVer = vault.documentVersions.get(doc.activeVersionId);
    if (!activeVer) return;

    const ocrEngine = new LocalOcrEngine();
    const result = await ocrEngine.processImageOrScan({
      fileName: doc.originalFileName,
      mimeType: doc.mimeType,
      rawPayload: activeVer.textPayload || '',
    });

    const existingCount = Array.from(vault.documentVersions.values()).filter((v) => v.documentId === doc.id).length;
    const newVer = ocrEngine.createOcrVersion(doc, result, existingCount + 1);
    vault.documentVersions.set(newVer.id, newVer);
    doc.activeVersionId = newVer.id;
    setGlobalNotice(`Wykonano lokalny OCR dla ${doc.originalFileName}. Jakość rozpoznania: ${result.averageConfidence}%.`);
    triggerRefresh();
  };

  const handleSaveCorrection = async (docId: string, correctedText: string, note: string) => {
    await vault.addDocumentVersion({
      documentId: docId,
      kind: 'user_corrected',
      textPayload: correctedText,
      toolOrAuthor: `Korekta użytkownika: ${note}`,
    });
    setGlobalNotice(`Zapisano skorygowaną wersję dokumentu bez modyfikacji oryginału.`);
    triggerRefresh();
  };

  const handleConfirmField = (fieldId: string, confirmedValue: string) => {
    vault.confirmField(fieldId, confirmedValue);
    setGlobalNotice(`Potwierdzono poprawność pola.`);
    triggerRefresh();
  };

  // 12. Bezpieczna synchronizacja chmurowa E2EE
  const handleSyncToServer = async (passphrase: string) => {
    const syncEngine = new E2EESyncEngine();
    const manifest = vault.toManifest();
    const payload = await syncEngine.prepareSyncPayload(manifest, passphrase);

    const res = await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || 'Błąd synchronizacji serwera');
    }
    return { recordId: payload.recordId, version: payload.version };
  };

  const handleSyncFromServer = async (passphrase: string) => {
    const syncEngine = new E2EESyncEngine();
    const recordId = `sync-${vault.vaultId}`;
    const res = await fetch(`/api/sync?recordId=${recordId}`);
    if (!res.ok) {
      throw new Error('Brak rekordu synchronizacji na serwerze lub odmowa dostępu.');
    }
    const data = await res.json();
    const restoredManifest = await syncEngine.decryptSyncPayload(data.record, passphrase);
    const restoredVault = LocalVault.fromManifest(restoredManifest);
    setVault(restoredVault);
    return { restoredCount: restoredVault.cases.size };
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans">
      {/* Top Header Bar */}
      <header className="bg-slate-950 text-white border-b border-slate-800 py-3.5 px-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-sm tracking-wider text-emerald-400">
              OB
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-white block leading-tight">
                Obywatel
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                Prywatny organizator spraw i obrońca praw obywatelskich
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="hidden sm:flex items-center gap-1.5 bg-slate-900 text-slate-300 border border-slate-800 px-3 py-1.5 rounded-lg font-mono text-[11px]">
              <FolderOpen className="w-3.5 h-3.5 text-slate-400" />
              <span>Moje_sprawy/</span>
            </div>

            <div className="flex items-center gap-1 text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-900 px-2.5 py-1 rounded-lg">
              <Shield className="w-3.5 h-3.5" />
              <span className="text-[11px]">Lokalny sejf</span>
            </div>
          </div>
        </div>
      </header>

      {/* Global Navigation Tabs (10 views) */}
      <Navigation
        activeView={activeView}
        onSelectView={(v) => setActiveView(v)}
        inboxCount={inboxDocuments.length}
        urgentCount={urgentCount}
      />

      {/* Global dismissible banner */}
      {globalNotice && (
        <aside aria-label="Powiadomienie systemowe" className="bg-slate-900 text-white text-xs px-4 py-2 border-b border-slate-800">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{globalNotice}</span>
            </div>
            <button
              type="button"
              onClick={() => setGlobalNotice(null)}
              className="text-slate-400 hover:text-white font-semibold text-[11px]"
            >
              Zamknij
            </button>
          </div>
        </aside>
      )}

      {/* Main View Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {activeView === 'today' && (
          <TodayView
            cases={cases}
            deadlines={deadlines}
            inboxCount={inboxDocuments.length}
            onNavigate={(v, caseId) => {
              if (caseId) setActiveCaseId(caseId);
              setActiveView(v);
            }}
            onConfirmDeliveryDate={handleConfirmDeliveryDate}
            onLoadSyntheticDemo={handleLoadSyntheticDemo}
            isLoadingDemo={isLoadingDemo}
          />
        )}

        {activeView === 'cases' && (
          <CasesView
            cases={cases}
            activeCaseId={activeCaseId}
            onSelectCase={(cid) => setActiveCaseId(cid)}
            onCreateCase={(newCaseData) => {
              const newC = vault.createCase(newCaseData);
              setActiveCaseId(newC.id);
              triggerRefresh();
            }}
            onNavigate={(v, caseId) => {
              if (caseId) setActiveCaseId(caseId);
              setActiveView(v);
            }}
            documentCountByCase={documentCountByCase}
          />
        )}

        {activeView === 'disk' && (
          <DiskDocumentsView
            cases={cases}
            activeCaseId={activeCaseId}
            documents={documents}
            versions={versions}
            diskFiles={diskFiles}
            extractedFields={Array.from(vault.extractedFields.values())}
            onScanDisk={handleScanDisk}
            onSplitMultiPageScan={handleSplitMultiPageScan}
            onRunLocalOcr={handleRunLocalOcr}
            onSaveCorrection={handleSaveCorrection}
            onConfirmField={handleConfirmField}
            isScanning={isScanningDisk}
          />
        )}

        {activeView === 'inbox' && (
          <InboxView
            inboxDocuments={inboxDocuments}
            proposals={inboxProposalsRecord}
            cases={cases}
            onApproveProposal={handleApproveProposal}
            onManualMove={handleManualMove}
            undoStackLength={vault.history.filter((h) => h.canUndo).length}
            onUndoLastMove={handleUndoLastMove}
            lastMoveDescription={lastMoveDescription}
          />
        )}

        {activeView === 'timeline' && (
          <TimelineView
            cases={cases}
            activeCaseId={activeCaseId}
            onSelectCase={(cid) => setActiveCaseId(cid)}
            events={events}
            onAddEvent={(newEvt) => {
              vault.addEvent({ ...newEvt, id: `evt-${Date.now()}` });
              triggerRefresh();
            }}
          />
        )}

        {activeView === 'evidence' && (
          <EvidenceView
            cases={cases}
            activeCaseId={activeCaseId}
            onSelectCase={(cid) => setActiveCaseId(cid)}
            analysis={currentAnalysis}
            documents={documents}
          />
        )}

        {activeView === 'plan' && (
          <ActionPlanView
            cases={cases}
            activeCaseId={activeCaseId}
            onSelectCase={(cid) => setActiveCaseId(cid)}
            actionPlan={currentActionPlan}
            onToggleStepStatus={handleToggleStepStatus}
            onNavigate={(v, caseId) => {
              if (caseId) setActiveCaseId(caseId);
              setActiveView(v);
            }}
          />
        )}

        {activeView === 'letters' && (
          <LettersView
            cases={cases}
            activeCaseId={activeCaseId}
            onSelectCase={(cid) => setActiveCaseId(cid)}
            letters={letters}
            onCreateLetter={(draft) => {
              vault.setLetter(draft);
              triggerRefresh();
            }}
            onUpdateLetter={(draft) => {
              vault.setLetter(draft);
              triggerRefresh();
            }}
            onRegisterReceipt={(letterId, num, chan, dt) => {
              const l = vault.letters.get(letterId);
              if (l) {
                l.deliveryReceiptNumber = num;
                l.deliveryProofOrigin = chan;
                l.deliveryDate = dt;
                l.status = 'confirmed_by_receipt';
                triggerRefresh();
              }
            }}
          />
        )}

        {activeView === 'legal' && <LegalKnowledgeView sources={legalSources} />}

        {activeView === 'privacy' && (
          <BackupPrivacyView
            onExportBackup={handleExportBackup}
            onRestoreBackup={handleRestoreBackup}
            vaultInfo={{
              caseCount: cases.length,
              documentCount: documents.length,
              versionCount: versions.length,
            }}
            documents={documents}
            onSyncToServer={handleSyncToServer}
            onSyncFromServer={handleSyncFromServer}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 px-4 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Obywatel - aplikacja dla osób prowadzących własne sprawy</span>
          <span className="font-mono text-[11px] text-slate-400">
            Standard Fable 5.1 | Wszystkie dane na Twoim urządzeniu
          </span>
        </div>
      </footer>
    </div>
  );
}
