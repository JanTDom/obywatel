# Kryteria akceptacyjne

Sprawdzaj zachowanie, nie samą obecność funkcji. Używaj syntetycznych
dokumentów ze znanymi wynikami. Przy funkcjach prawnych zapisz właściwą
wersję przepisu i ocenę osoby z kompetencją prawną.

| Scenariusz | Wymagany rezultat |
|---|---|
| Import, OCR, wyszukiwanie i projekt pisma w trybie lokalnym | Monitorowany ruch sieciowy nie ujawnia bajtów, OCR, nazw, pól, embeddings ani zapytań prywatnego indeksu |
| Synchronizacja struktury | Serwer otrzymuje szyfrogram; treści sprawy nie da się odczytać z bazy, logów i API bez klucza klienta |
| Awaria / czyszczenie profilu | Wcześniej przygotowany backup odtwarza dokumenty, relacje, wersje i klucze na czystym profilu; hashe zgadzają się |
| Reset hasła konta | Nie odblokowuje sejfu; interfejs pokazuje niezależne odzyskanie klucza |
| Brak lokalnego pliku / cofnięte uprawnienie | Aplikacja pokazuje niedostępny dokument i pozwala wskazać go ponownie; nie udaje odczytu |
| Zmiana urządzenia | Synchronizacja samej struktury nie udaje przeniesienia dokumentów; restore jest wyraźną operacją |
| Duplikat i nowy skan | Dokładny duplikat wykryty; podobny skan nie jest automatycznie skasowany |
| Niska jakość OCR | Pola krytyczne pozostają propozycją; użytkownik widzi oryginał, stronę i możliwość korekty |
| Brak daty doręczenia | Termin ma stan unknown, bez zmyślonego odliczania; jest instrukcja zdobycia daty i pilnej weryfikacji gdy potrzebna |
| Błędne / niepełne pouczenie | Analiza wykrywa problem lub niepewność zamiast bezwarunkowo kopiować pouczenie |
| Zmiana prawa | Analiza wybiera właściwą wersję i sprawdza przepisy przejściowe; stare pisma zachowują snapshot |
| Zmyślony cytat / nieistniejący wyrok | Walidator odrzuca cytowanie; brak źródła nie zamienia się w pewną rekomendację |
| Dwa rozbieżne orzeczenia | Dossier pokazuje rozbieżność, relewantność i warunkowe wnioski |
| Gemini bez klucza / timeout / limit | Sejf i szablony działają; brak ukrytej zmiany dostawcy lub wysyłki większego zakresu |
| Wybrane fragmenty do Gemini | Wyświetlany podgląd odpowiada faktycznemu payloadowi; nowe fragmenty lub odbiorca wymagają nowej zgody |
| Wycofanie zgody | Brak kolejnych wysyłek; rejestr pokazuje operację już wykonaną i realny stan usunięcia kopii |
| Prompt injection w PDF lub źródle | Treść nie uruchamia narzędzia, nie zmienia reguł i nie wysyła danych |
| Eksport pisma | Polskie znaki, poprawne strony, załączniki i źródła; projekt ma właściwy status i nie jest oznaczony jako wysłany |
| Ręczne zgłoszenie wysłania | Odróżnione od dowodu złożenia i doręczenia; błędne/niedopasowane potwierdzenie nie potwierdza sprawy |
| Publikacja społeczna | Powstaje osobna zredagowana kopia; redakcja usuwa tekst, metadane i ukryte warstwy, nie tylko rysuje prostokąt |
| Konto A próbuje odczytać dane B | Autoryzacja serwerowa odrzuca; zgadywanie ID i dostępu do synchronizacji nie omija izolacji |
| Równoległa edycja offline | Konflikt jest zachowany i widoczny; dowód lub data nie są po cichu nadpisane |
| Klawiatura / telefon / czytnik | Przejście intake → pismo → backup wykonalne; właściwy focus, etykiety i komunikaty błędów |
| Zamknięta przeglądarka | Brak obietnicy ciągłego monitorowania terminów w MVP; użytkownik zna ograniczenie przypomnień |

Uruchom lint/typecheck/build i istotne testy jednostkowe/integracyjne/E2E
w skali odpowiadającej zmianie. Testy terminów wymagają przypadków brzegowych
i oczekiwanych wyników ustalonych niezależnie od implementacji: weekend,
święto, zmiana roku, miesiące, doręczenie elektroniczne, brak i korekta daty.
Nie kopiuj logiki kodu do testu jako oczekiwanego wyniku.

Raport końcowy zawiera środowisko, wersje, sprawdzone scenariusze, wyniki,
pozostałe ograniczenia i wykryte ujawnienia danych. Przed publicznym startem
z danymi realnych osób potrzebne są przegląd bezpieczeństwa, ocena przyjętych
reguł prawnych i właściwe dokumenty ochrony danych. Nie zastępuj tego
pozytywną opinią drugiego modelu.
