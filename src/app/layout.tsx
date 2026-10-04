import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Obywatel — lokalny sejf spraw i pism urzędowych',
  description: 'Aplikacja local-first wspierająca obywateli w prowadzeniu spraw z urzędami w Polsce.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <body className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
        <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-20">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Lokalny sejf spraw urzędowych
              </span>
              <h1 className="text-xl font-bold tracking-tight text-slate-950">
                Obywatel
              </h1>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                Tryb lokalny (brak połączeń do chmury)
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-medium">
                Prywatność: dane na tym urządzeniu
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 md:p-8">
          {children}
        </main>

        <footer className="bg-white border-t border-slate-200 px-6 py-6 text-xs text-slate-500 text-center">
          <div className="max-w-6xl mx-auto space-y-1">
            <p>
              Aplikacja „Obywatel” przetwarza dokumenty, OCR i szkice wyłącznie lokalnie na Twoim urządzeniu.
            </p>
            <p>
              Stan prawny zweryfikowany z oficjalnymi publikatorami (ELI / ISAP / CBOSA). Informacje nie zastępują porady adwokata lub radcy prawnego.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
