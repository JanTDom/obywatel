'use client';

import React, { useState } from 'react';
import {
  HardDrive,
  RefreshCw,
  Folder,
  FolderOpen,
  FileText,
  FileCode,
  ShieldCheck,
  Split,
  Eye,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { DocumentRecord, DocumentVersion, DiskFileInfo, Case } from '../../domain/types';

interface DiskDocumentsViewProps {
  cases: Case[];
  activeCaseId: string | null;
  documents: DocumentRecord[];
  versions: DocumentVersion[];
  diskFiles: DiskFileInfo[];
  onScanDisk: () => Promise<void>;
  onSplitMultiPageScan: (docId: string) => Promise<void>;
  isScanning: boolean;
}

export function DiskDocumentsView({
  cases,
  activeCaseId,
  documents,
  versions,
  diskFiles,
  onScanDisk,
  onSplitMultiPageScan,
  isScanning,
}: DiskDocumentsViewProps) {
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [filterCaseId, setFilterCaseId] = useState<string>(activeCaseId || 'all');

  const filteredDocuments = documents.filter((d) => {
    if (filterCaseId === 'all') return true;
    return d.caseIds.includes(filterCaseId);
  });

  const selectedDoc = documents.find((d) => d.id === selectedDocId);
  const selectedVersions = versions.filter((v) => v.documentId === selectedDocId);
  const activeVersion = selectedVersions.find((v) => v.id === selectedDoc?.activeVersionId);

  // Group documents by subfolder
  const subfolders = [
    '00_Plan_i_opis',
    '01_Otrzymane',
    '02_Wyslane',
    '03_Dowody',
    '04_Potwierdzenia',
    '05_Projekty_pism',
    '06_Prawo_i_analizy',
    '07_Wynik_sprawy',
    'Do_uporzadkowania',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Dokumenty na dysku
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Fizyczny katalog <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-xs text-slate-800">Moje_sprawy/</code>.
            Pliki nie są wysyłane na serwer zewnętrzny; OCR i ekstrakcja działają lokalnie.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onScanDisk}
            disabled={isScanning}
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Skanowanie dysku...' : 'Odśwież stan z dysku'}</span>
          </button>
        </div>
      </div>

      {/* Case filter bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-500 font-medium">Filtruj sprawę:</span>
        <button
          type="button"
          onClick={() => setFilterCaseId('all')}
          className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
            filterCaseId === 'all'
              ? 'bg-slate-900 text-white font-semibold'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          Wszystkie katalogi
        </button>
        {cases.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setFilterCaseId(c.id)}
            className={`px-3 py-1.5 rounded-lg transition-colors font-medium whitespace-nowrap ${
              filterCaseId === c.id
                ? 'bg-slate-900 text-white font-semibold'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {c.id} ({c.folderName})
          </button>
        ))}
      </div>

      {/* Main Split: File Tree / List & Detail Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: List of files & disk structure (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-slate-600" />
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Moje_sprawy/ ({filteredDocuments.length} dokumentów)
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">
                Lokalny system plików
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {filteredDocuments.map((doc) => {
                const isSelected = selectedDocId === doc.id;
                const isMultiPage = doc.originalFileName.includes('wielostronicowy');

                return (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDocId(doc.id)}
                    className={`p-4 cursor-pointer transition-colors ${
                      isSelected ? 'bg-slate-100/80 border-l-4 border-slate-900' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <FileText className="w-4 h-4 text-slate-500 flex-shrink-0 mt-1" />
                        <div>
                          <div className="text-xs font-bold text-slate-900">
                            {doc.originalFileName}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono mt-0.5 break-all">
                            {doc.diskRelativePath || `Moje_sprawy/Do_uporzadkowania/${doc.originalFileName}`}
                          </div>

                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            {doc.caseIds.map((cid) => (
                              <span
                                key={cid}
                                className="text-[10px] uppercase font-bold text-slate-700 bg-slate-200 px-1.5 py-0.5 rounded"
                              >
                                {cid}
                              </span>
                            ))}

                            <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                              {doc.fileSize} B
                            </span>

                            {doc.caseIds.length > 1 && (
                              <span className="text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-1.5 py-0.5 rounded">
                                Dokument powiązany z kilkoma sprawami
                              </span>
                            )}

                            {isMultiPage && (
                              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded">
                                Skan wielostronicowy
                              </span>
                            )}

                            {doc.isMissingOnDisk && (
                              <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded">
                                Brak pliku na dysku
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <span className="text-[10px] font-mono text-slate-400">
                          {doc.originalSha256.substring(0, 10)}...
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredDocuments.length === 0 && (
                <div className="p-8 text-center text-xs text-slate-500">
                  Brak dokumentów w wybranym katalogu.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right column: Document Details and Local Preview (5 cols) */}
        <div className="lg:col-span-5">
          {selectedDoc ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 sticky top-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-slate-700" />
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Podgląd i integralność
                  </h3>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-semibold">
                  <ShieldCheck className="w-3 h-3" />
                  <span>SHA-256 zgodny</span>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Plik
                </span>
                <div className="text-xs font-bold text-slate-900 mt-0.5">
                  {selectedDoc.originalFileName}
                </div>
                <div className="text-[11px] font-mono text-slate-600 mt-1 break-all bg-slate-50 p-2 rounded-lg border border-slate-100">
                  {selectedDoc.diskRelativePath || 'Lokalizacja w skrzynce Do_uporzadkowania'}
                </div>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Suma kontrolna (SHA-256 oryginału)
                </span>
                <div className="text-[11px] font-mono text-slate-700 mt-1 break-all bg-slate-50 p-2 rounded-lg border border-slate-100">
                  {selectedDoc.originalSha256}
                </div>
              </div>

              {/* Multi-page Scan Splitting Action */}
              {selectedDoc.originalFileName.includes('wielostronicowy') && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-950">
                    <Split className="w-4 h-4 text-blue-700" />
                    <span>Logiczny podział skanu wielostronicowego</span>
                  </div>
                  <p className="text-[11px] text-blue-800 leading-relaxed">
                    Plik zawiera jednocześnie umowę oraz protokół zdawczo-odbiorczy.
                    Możesz wyodrębnić dokumenty pochodne z zachowaniem oryginału i numeracji stron.
                  </p>
                  <button
                    type="button"
                    onClick={() => onSplitMultiPageScan(selectedDoc.id)}
                    className="w-full text-xs font-semibold bg-blue-700 hover:bg-blue-800 text-white px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Wyodrębnij dokumenty składowe (str. 1 i str. 2)
                  </button>
                </div>
              )}

              {/* Versions list */}
              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Wersje i pochodne ({selectedVersions.length})
                </span>
                <div className="mt-2 space-y-1.5">
                  {selectedVersions.map((v) => (
                    <div
                      key={v.id}
                      className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs flex items-center justify-between"
                    >
                      <div>
                        <span className="font-semibold text-slate-800">
                          v{v.versionNumber} ({v.kind})
                        </span>
                        <div className="text-[10px] text-slate-500">
                          {v.pageRange ? `${v.pageRange.end - v.pageRange.start + 1} str.` : '1 str.'} | {v.createdAt.slice(0, 10)}
                        </div>
                      </div>
                      {v.id === selectedDoc.activeVersionId && (
                        <span className="text-[10px] font-bold text-slate-700 bg-slate-200 px-1.5 py-0.5 rounded">
                          Aktywna
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Text content preview */}
              {activeVersion && (
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Odczytana treść (tekst lokalny)
                  </span>
                  <div className="mt-1.5 p-3 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px] leading-relaxed max-h-56 overflow-y-auto whitespace-pre-wrap border border-slate-800">
                    {activeVersion.textPayload}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-500 shadow-sm">
              <FileCode className="w-8 h-8 text-slate-400 mx-auto" />
              <h3 className="font-bold text-slate-800 mt-2">Wybierz dokument z listy</h3>
              <p className="mt-1">
                Kliknij dowolny plik po lewej stronie, aby wyświetlić sumę kontrolną SHA-256,
                ścieżkę na dysku oraz podgląd odczytanej treści.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
