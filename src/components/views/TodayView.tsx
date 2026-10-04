'use client';

import React, { useState } from 'react';
import {
  AlertCircle,
  Calendar,
  Clock,
  ArrowRight,
  CheckCircle2,
  FolderKanban,
  HardDrive,
  Inbox,
  AlertTriangle,
  Play,
  RotateCcw,
} from 'lucide-react';
import { Case, ProceduralDeadline } from '../../domain/types';
import { ViewType } from '../Navigation';

interface TodayViewProps {
  cases: Case[];
  deadlines: ProceduralDeadline[];
  inboxCount: number;
  onNavigate: (view: ViewType, caseId?: string) => void;
  onConfirmDeliveryDate: (caseId: string, date: string) => void;
  onLoadSyntheticDemo: () => void;
  isLoadingDemo: boolean;
}

export function TodayView({
  cases,
  deadlines,
  inboxCount,
  onNavigate,
  onConfirmDeliveryDate,
  onLoadSyntheticDemo,
  isLoadingDemo,
}: TodayViewProps) {
  const [selectedCaseForDate, setSelectedCaseForDate] = useState<string>('');
  const [dateInput, setDateInput] = useState<string>('2026-09-18');

  // Filter deadlines that are active or missing dates
  const activeDeadlines = deadlines.filter((d) => d.status === 'active' || d.status === 'unknown');
  const unknownDateDeadlines = deadlines.filter(
    (d) => d.status === 'unknown' || d.startDate === 'unknown' || d.calculatedEndDate === 'unknown'
  );

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
              Centrum bieżących działań
            </span>
            <h1 className="text-2xl font-bold tracking-tight mt-1 text-white">
              Dziś w Twoich sprawach
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Aplikacja wspiera Cię w terminach, kompletowaniu dowodów i pismach procesowych.
              Wszystkie dokumenty, OCR i dane pozostają wyłącznie na Twoim komputerze.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onLoadSyntheticDemo}
              disabled={isLoadingDemo}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm disabled:opacity-50"
            >
              <Play className="w-4 h-4" />
              <span>{isLoadingDemo ? 'Ładowanie...' : 'Wczytaj 3 przykładowe sprawy'}</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('inbox')}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border border-slate-700"
            >
              <Inbox className="w-4 h-4" />
              <span>Do uporządkowania ({inboxCount})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Alert for Unknown Delivery Dates */}
      {unknownDateDeadlines.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h2 className="text-sm font-bold text-amber-950">
                Wymagane potwierdzenie daty doręczenia pisma
              </h2>
              <p className="text-xs text-amber-800 mt-1">
                Wykryto decyzję lub wezwanie bez potwierdzonej daty odbioru. Termin procesowy nie może
                zostać bezpiecznie obliczony domysłem modelu. Wprowadź datę z żółtej zwrotki pocztowej,
                koperty ze stemplem lub ePUAP.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <select
                  aria-label="Wybierz sprawę do uzupełnienia daty doręczenia"
                  value={selectedCaseForDate || unknownDateDeadlines[0].caseId}
                  onChange={(e) => setSelectedCaseForDate(e.target.value)}
                  className="text-xs bg-white border border-amber-300 rounded-lg px-3 py-1.5 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {unknownDateDeadlines.map((d) => (
                    <option key={d.id} value={d.caseId}>
                      {d.actionRequired} ({d.caseId})
                    </option>
                  ))}
                </select>
                <input
                  type="date"
                  aria-label="Data doręczenia"
                  value={dateInput}
                  onChange={(e) => setDateInput(e.target.value)}
                  className="text-xs bg-white border border-amber-300 rounded-lg px-3 py-1.5 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    const cid = selectedCaseForDate || unknownDateDeadlines[0].caseId;
                    onConfirmDeliveryDate(cid, dateInput);
                  }}
                  className="text-xs bg-amber-700 hover:bg-amber-800 text-white font-semibold px-3 py-1.5 rounded-lg transition-colors"
                >
                  Potwierdź datę doręczenia
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grid of Key Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Pilne terminy */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Terminy procesowe
              </span>
              <Clock className="w-4 h-4 text-slate-400" />
            </div>
            <div className="mt-3">
              <div className="text-3xl font-bold text-slate-900">
                {activeDeadlines.length}
              </div>
              <p className="text-xs text-slate-600 mt-1">
                {activeDeadlines.length === 1 ? 'aktywny termin w toku' : 'aktywne terminy w toku'}
              </p>
            </div>

            <div className="mt-4 space-y-2">
              {activeDeadlines.slice(0, 2).map((d) => (
                <div
                  key={d.id}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                >
                  <div className="font-semibold text-slate-800 line-clamp-1">
                    {d.actionRequired}
                  </div>
                  <div className="text-slate-500 mt-0.5 flex items-center justify-between">
                    <span>
                      {d.calculatedEndDate ? `Koniec: ${d.calculatedEndDate}` : 'Data niepotwierdzona'}
                    </span>
                    <span
                      className={`font-semibold ${
                        d.status === 'unknown'
                          ? 'text-rose-600'
                          : d.isWeekendOrHolidayShifted
                          ? 'text-amber-600'
                          : 'text-emerald-600'
                      }`}
                    >
                      {d.status === 'unknown' ? 'Wymaga daty' : 'W toku'}
                    </span>
                  </div>
                </div>
              ))}
              {activeDeadlines.length === 0 && (
                <p className="text-xs text-slate-400 italic">Brak zarejestrowanych terminów.</p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('timeline')}
            className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-slate-900 hover:text-slate-700 transition-colors"
          >
            <span>Zobacz oś czasu</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 2: Skrzynka do uporządkowania */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Do uporządkowania
              </span>
              <Inbox className="w-4 h-4 text-slate-400" />
            </div>
            <div className="mt-3">
              <div className="text-3xl font-bold text-slate-900">{inboxCount}</div>
              <p className="text-xs text-slate-600 mt-1">
                {inboxCount === 1 ? 'plik oczekuje na decyzję' : 'pliki oczekują na decyzję'}
              </p>
            </div>
            <p className="text-xs text-slate-600 mt-4 leading-relaxed">
              Pliki umieszczone w folderze roboczym analizowane są pod kątem sygnatur,
              stron i dat, po czym sugerowane jest ich przyporządkowanie do właściwej sprawy.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('inbox')}
            className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-slate-900 hover:text-slate-700 transition-colors"
          >
            <span>Przejdź do klasyfikacji</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 3: Twoje aktywne sprawy */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Aktywne sprawy
              </span>
              <FolderKanban className="w-4 h-4 text-slate-400" />
            </div>
            <div className="mt-3">
              <div className="text-3xl font-bold text-slate-900">{cases.length}</div>
              <p className="text-xs text-slate-600 mt-1">
                {cases.length === 1 ? 'prowadzona sprawa' : 'prowadzone sprawy'}
              </p>
            </div>

            <div className="mt-4 space-y-2">
              {cases.slice(0, 2).map((c) => (
                <div
                  key={c.id}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                >
                  <div className="font-semibold text-slate-800 line-clamp-1">{c.title}</div>
                  <div className="text-slate-500 mt-0.5 flex items-center justify-between">
                    <span>{c.authorityOrOpponentName}</span>
                    <span className="text-[10px] uppercase font-bold text-slate-600 bg-slate-200 px-1.5 py-0.5 rounded">
                      {c.id}
                    </span>
                  </div>
                </div>
              ))}
              {cases.length === 0 && (
                <p className="text-xs text-slate-400 italic">Brak utworzonych spraw.</p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('cases')}
            className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-slate-900 hover:text-slate-700 transition-colors"
          >
            <span>Przeglądaj wszystkie sprawy</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Guide Card: "Co powinienem zrobić teraz?" */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-700" />
          <span>Najbliższy zalecany krok procesowy</span>
        </h2>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Dla sprawy z urzędem (S-0001)
            </span>
            <h3 className="text-sm font-bold text-slate-900 mt-1">
              Sporządzenie odwołania od decyzji Prezydenta m.st. Warszawy
            </h3>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              Doręczenie nastąpiło 18 września 2026 r. Termin 14 dni mija 2 października 2026 r.
              Przed wysłaniem pisma sprawdź checklistę formalną i wygeneruj sumę kontrolną SHA-256 wydruku.
            </p>
            <div className="mt-3">
              <button
                type="button"
                onClick={() => onNavigate('letters', 'S-0001')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 px-3 py-1.5 rounded-lg transition-colors"
              >
                <span>Otwórz generator pism</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Dla reklamacji wobec firmy (S-0002)
            </span>
            <h3 className="text-sm font-bold text-slate-900 mt-1">
              Wezwanie przedsiębiorcy do naprawy lub wymiany laptopa
            </h3>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              Podstawa: art. 43d Ustawy o prawach konsumenta. Przedsiębiorca ma 14 dni na odpowiedź.
              Brak odpowiedzi w terminie oznacza uznanie reklamacji z mocy prawa.
            </p>
            <div className="mt-3">
              <button
                type="button"
                onClick={() => onNavigate('letters', 'S-0002')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 px-3 py-1.5 rounded-lg transition-colors"
              >
                <span>Przygotuj reklamację</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
