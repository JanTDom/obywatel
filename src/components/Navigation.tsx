'use client';

import React from 'react';
import {
  Calendar,
  FolderKanban,
  HardDrive,
  Inbox,
  Clock,
  Scale,
  ListTodo,
  FileText,
  BookOpen,
  ShieldCheck,
} from 'lucide-react';

export type ViewType =
  | 'today'
  | 'cases'
  | 'disk'
  | 'inbox'
  | 'timeline'
  | 'evidence'
  | 'plan'
  | 'letters'
  | 'legal'
  | 'privacy';

interface NavigationProps {
  activeView: ViewType;
  onSelectView: (view: ViewType) => void;
  inboxCount: number;
  urgentCount: number;
}

export function Navigation({
  activeView,
  onSelectView,
  inboxCount,
  urgentCount,
}: NavigationProps) {
  const navItems: { id: ViewType; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'today', label: 'Dziś', icon: <Calendar className="w-4 h-4" />, badge: urgentCount > 0 ? urgentCount : undefined },
    { id: 'cases', label: 'Moje sprawy', icon: <FolderKanban className="w-4 h-4" /> },
    { id: 'disk', label: 'Dokumenty na dysku', icon: <HardDrive className="w-4 h-4" /> },
    { id: 'inbox', label: 'Do uporządkowania', icon: <Inbox className="w-4 h-4" />, badge: inboxCount > 0 ? inboxCount : undefined },
    { id: 'timeline', label: 'Oś czasu', icon: <Clock className="w-4 h-4" /> },
    { id: 'evidence', label: 'Dowody i stanowiska', icon: <Scale className="w-4 h-4" /> },
    { id: 'plan', label: 'Plan działania', icon: <ListTodo className="w-4 h-4" /> },
    { id: 'letters', label: 'Pisma', icon: <FileText className="w-4 h-4" /> },
    { id: 'legal', label: 'Źródła i analiza prawna', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'privacy', label: 'Kopie zapasowe i prywatność', icon: <ShieldCheck className="w-4 h-4" /> },
  ];

  return (
    <nav aria-label="Główne widoki aplikacji" className="bg-white border-b border-slate-200 px-4">
      <ul className="max-w-6xl mx-auto flex items-center gap-1 overflow-x-auto py-2 text-xs font-medium text-slate-600 no-scrollbar">
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <li key={item.id} className="flex-shrink-0">
              <button
                type="button"
                onClick={() => onSelectView(item.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors relative ${
                  isActive
                    ? 'bg-slate-900 text-white font-semibold shadow-sm'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-amber-400 text-slate-950' : 'bg-amber-100 text-amber-900 border border-amber-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
