'use client';

import React, { useState } from 'react';
import {
  FolderKanban,
  Plus,
  Building2,
  Briefcase,
  User,
  Users,
  ArrowRight,
  FileText,
  Clock,
  CheckCircle2,
  Scale,
} from 'lucide-react';
import { Case, ProcedureType, OpponentType, CaseStatus } from '../../domain/types';
import { ViewType } from '../Navigation';

interface CasesViewProps {
  cases: Case[];
  activeCaseId: string | null;
  onSelectCase: (caseId: string) => void;
  onCreateCase: (newCase: Omit<Case, 'id' | 'folderName' | 'createdAt' | 'updatedAt' | 'status' | 'nextAction' | 'missingFacts'>) => void;
  onNavigate: (view: ViewType, caseId?: string) => void;
  documentCountByCase: Record<string, number>;
}

export function CasesView({
  cases,
  activeCaseId,
  onSelectCase,
  onCreateCase,
  onNavigate,
  documentCountByCase,
}: CasesViewProps) {
  const [filterType, setFilterType] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [goalDescription, setGoalDescription] = useState('');
  const [procedureType, setProcedureType] = useState<ProcedureType>('administrative');
  const [opponentType, setOpponentType] = useState<OpponentType>('public_authority');
  const [authorityOrOpponentName, setAuthorityOrOpponentName] = useState('');
  const [authorityJurisdictionReason, setAuthorityJurisdictionReason] = useState('');

  const filteredCases = cases.filter((c) => {
    if (filterType === 'all') return true;
    return c.procedureType === filterType;
  });

  const handleSubmitNewCase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !authorityOrOpponentName) return;

    onCreateCase({
      title,
      goalDescription,
      procedureType,
      opponentType,
      authorityOrOpponentName,
      authorityJurisdictionReason,
    });

    setTitle('');
    setGoalDescription('');
    setAuthorityOrOpponentName('');
    setAuthorityJurisdictionReason('');
    setIsModalOpen(false);
  };

  const getOpponentIcon = (type: OpponentType) => {
    switch (type) {
      case 'public_authority':
        return <Building2 className="w-4 h-4 text-indigo-600" />;
      case 'company':
        return <Briefcase className="w-4 h-4 text-emerald-600" />;
      case 'individual':
        return <User className="w-4 h-4 text-amber-600" />;
      case 'institution':
        return <Users className="w-4 h-4 text-purple-600" />;
    }
  };

  const getProcedureLabel = (type: ProcedureType) => {
    switch (type) {
      case 'administrative':
        return 'Postępowanie administracyjne';
      case 'consumer_dispute':
        return 'Spór konsumencki';
      case 'contract_dispute':
        return 'Spór z umowy cywilnej';
      case 'public_information':
        return 'Dostęp do informacji publicznej';
      case 'complaint_or_petition':
        return 'Skarga / petycja';
      case 'social_interest':
        return 'Działanie w interesie społecznym';
      default:
        return 'Inne postępowanie';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Moje sprawy
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Zestawienie spraw prowadzonych z urzędami, firmami, osobami fizycznymi oraz w interesie społecznym.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Utwórz nową sprawę</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-medium border-b border-slate-200">
        {[
          { id: 'all', label: 'Wszystkie sprawy' },
          { id: 'administrative', label: 'Administracyjne' },
          { id: 'consumer_dispute', label: 'Konsumenckie' },
          { id: 'contract_dispute', label: 'Umowy cywilne' },
          { id: 'public_information', label: 'Informacja publiczna' },
          { id: 'social_interest', label: 'Interes społeczny' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilterType(tab.id)}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              filterType === tab.id
                ? 'bg-slate-900 text-white font-semibold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Cases Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredCases.map((c) => {
          const isSelected = activeCaseId === c.id;
          const docCount = documentCountByCase[c.id] || 0;

          return (
            <div
              key={c.id}
              className={`bg-white rounded-2xl border p-5 shadow-sm transition-all flex flex-col justify-between ${
                isSelected
                  ? 'border-slate-900 ring-2 ring-slate-900/10'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      {c.id}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {getProcedureLabel(c.procedureType)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-600">
                    {getOpponentIcon(c.opponentType)}
                  </div>
                </div>

                <h2 className="text-base font-bold text-slate-900 mt-2.5 leading-snug">
                  {c.title}
                </h2>

                <div className="mt-2 text-xs text-slate-600">
                  <span className="font-semibold text-slate-800">Druga strona: </span>
                  <span>{c.authorityOrOpponentName}</span>
                </div>

                <div className="mt-2 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700">
                  <span className="font-semibold text-slate-800">Cel: </span>
                  <span>{c.goalDescription}</span>
                </div>

                {c.nextAction && (
                  <div className="mt-3 text-xs text-slate-600 flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-slate-500 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-slate-800">Najbliższy krok: </strong>
                      {c.nextAction}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3 text-slate-500 font-medium">
                  <span className="flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" />
                    <span>{docCount} {docCount === 1 ? 'dokument' : 'dokumentów'}</span>
                  </span>
                  <span className="text-slate-400">|</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{c.folderName}</span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectCase(c.id);
                      onNavigate('disk', c.id);
                    }}
                    className="font-semibold text-slate-900 hover:text-slate-700 inline-flex items-center gap-1 transition-colors"
                  >
                    <span>Otwórz</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredCases.length === 0 && (
          <div className="col-span-full p-8 text-center bg-white rounded-2xl border border-slate-200">
            <FolderKanban className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800 mt-2">Brak spraw w tej kategorii</h3>
            <p className="text-xs text-slate-500 mt-1">
              Dodaj nową sprawę lub wybierz &quot;Wszystkie sprawy&quot;.
            </p>
          </div>
        )}
      </div>

      {/* Modal: New Case */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900">
              Tworzenie nowej sprawy
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Dla sprawy zostanie utworzony fizyczny katalog w folderze &quot;Moje_sprawy/&quot; wraz ze strukturą podkatalogów.
            </p>

            <form onSubmit={handleSubmitNewCase} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Tytuł sprawy
                </label>
                <input
                  type="text"
                  required
                  placeholder="np. Odwołanie od odmowy pozwolenia na budowę"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Rodzaj procedury
                  </label>
                  <select
                    value={procedureType}
                    onChange={(e) => setProcedureType(e.target.value as ProcedureType)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  >
                    <option value="administrative">Administracyjna (KPA)</option>
                    <option value="consumer_dispute">Reklamacja / Konsumencka</option>
                    <option value="contract_dispute">Spór z umowy (KC)</option>
                    <option value="public_information">Dostęp do informacji publicznej</option>
                    <option value="complaint_or_petition">Skarga lub petycja</option>
                    <option value="social_interest">Działanie w interesie społecznym</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Typ drugiej strony
                  </label>
                  <select
                    value={opponentType}
                    onChange={(e) => setOpponentType(e.target.value as OpponentType)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  >
                    <option value="public_authority">Organ publiczny / Urząd</option>
                    <option value="company">Firma / Przedsiębiorca</option>
                    <option value="individual">Osoba fizyczna</option>
                    <option value="institution">Instytucja / Organizacja</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Nazwa organu lub drugiej strony
                </label>
                <input
                  type="text"
                  required
                  placeholder="np. Prezydent m.st. Warszawy albo Jan Nowak"
                  value={authorityOrOpponentName}
                  onChange={(e) => setAuthorityOrOpponentName(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Cel sprawy (co chcesz osiągnąć?)
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="np. Uchylenie niekorzystnej decyzji i uzyskanie pozwolenia zamiennego"
                  value={goalDescription}
                  onChange={(e) => setGoalDescription(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Uzasadnienie właściwości / rola strony
                </label>
                <input
                  type="text"
                  placeholder="np. Organ I instancji w sprawach architektoniczno-budowlanych"
                  value={authorityJurisdictionReason}
                  onChange={(e) => setAuthorityJurisdictionReason(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-800 px-4 py-2 rounded-lg transition-colors"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  className="text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
                >
                  Utwórz sprawę na dysku
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
