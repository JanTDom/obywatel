# Cel i zakres produktu

Użytkownik często ma kilka pism, fotografie dokumentów, niejasne pouczenie
i poczucie bezradności. Aplikacja ma zmienić ten materiał w uporządkowaną
sprawę: co się wydarzyło, co jest dowodem, czego brakuje, jakie są możliwości
i co zrobić teraz. Obsługuje także działania na rzecz jawności, lokalnej
społeczności i kontroli działania instytucji.

## Doświadczenie użytkownika

1. „Co chcesz osiągnąć?” — własne słowa, bez obowiązku znajomości nazwy procedury.
2. „Dodaj dokumenty ze swojego urządzenia” — wyjaśnij, gdzie zostają zapisane.
3. „Sprawdź, co odczytaliśmy” — oryginał obok OCR, daty i pouczenia do potwierdzenia.
4. „Twoja sprawa” — oś czasu, dokumenty, brakujące fakty i następny krok.
5. „Możliwe działania” — warianty z podstawą, warunkami, kosztami i ryzykiem.
6. „Przygotuj pismo” — edytowalny projekt z załącznikami i listą kontroli.
7. „Jak złożyć?” — aktualny kanał, podpis, adresat, dowód złożenia.
8. „Dodaj potwierdzenie i zrób kopię” — dalsze kroki i odtworzenie sejfu.

W głównym widoku eksponuj następny krok, termin wymagający weryfikacji,
liczbę brakujących informacji oraz stan kopii zapasowej. Panel źródeł
i szczegółowe uzasadnienie muszą być dostępne przy rekomendacji.
Obsłuż mały ekran, klawiaturę, czytnik ekranu i wydruk. Nie używaj samego
koloru do oznaczania ryzyka. Cel jakości: WCAG 2.2 AA sprawdzone odpowiednią
metodą, a nie deklarowane na podstawie jednego automatycznego testu.

## MVP

Lokalny sejf i wyszukiwanie, katalog spraw, OCR z kontrolą, oś czasu,
dossier prawne, wersjonowane reguły terminów, projekty pism, lokalny eksport,
rejestr złożenia i potwierdzeń, backup/restore. Konto jest potrzebne do
opcjonalnej synchronizacji zaszyfrowanej struktury, nie do otwarcia sejfu.
Gemini jest opcjonalne; bez niego pozostają dokumenty, szablony, źródła
i ręczna praca nad sprawą. Offline pokaż datę ostatniej aktualizacji prawa;
nie przedstawiaj rekomendacji jako ponownie zweryfikowanej online.

Uruchamiaj obsługę procedur modułowo. Pierwszy zakres: informacja publiczna
oraz uporządkowanie indywidualnej sprawy administracyjnej. Projekty środków
zaskarżenia wymagają weryfikacji trybu i pouczenia. W razie niepełnych reguł
aplikacja zbiera fakty i daje ścieżkę pomocy, zamiast pozorować gotową analizę.
Zbuduj też moduły skarg/wniosków i petycji z własnymi warunkami. Nie zakładaj,
że sprawy podatkowe, ZUS, sądowe i wszystkie urzędy podlegają tej samej procedurze.

## Rozwój

Kolejne moduły dodawaj po analizie właściwych ustaw i testach przez osobę
z kompetencją prawną. Rozwijaj repozytorium wersjonowanych wzorców,
przekazanie wybranych materiałów pełnomocnikowi, wspólne sprawy i współpracę
organizacji społecznych z kontrolą dostępu. Publiczny moduł społeczny ma
osobne rekordy, przegląd materiałów, moderację i możliwość usunięcia publikacji.
Nie kopiuj do niego całego prywatnego sejfu.

Nie obiecuj wygranej ani uniwersalnego rozwiązania dla każdego urzędu.
Mierz użyteczność: ukończony przebieg, poprawnie odnaleziony dokument,
odtworzony backup, pokrycie rekomendacji zweryfikowanymi źródłami,
wykryte braki i błędy cytowań. Nie używaj liczby wysłanych pism jako celu.
