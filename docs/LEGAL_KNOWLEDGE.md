# Dogłębna, sprawdzalna wiedza prawna

To wymaganie dotyczy produktu i procesu tworzenia. Sam rozbudowany prompt
ani mocniejszy model nie tworzą wiarygodnej wiedzy prawnej. Zbuduj warstwę
źródeł, analizy, cytowania, aktualizacji i oceny przez człowieka.

## Dwa oddzielne korpusy

**Publiczny korpus prawa:** akty z urzędowych publikatorów/ELI i ISAP,
orzeczenia z oficjalnych baz, prawo UE i jawne materiały organów. Może być
pobierany i indeksowany na serwerze. ELI API jest adapterem źródłowym,
a nie gotowym silnikiem interpretacji prawa. Sprawdź dokumentację i warunki
każdego źródła; nie zakładaj publicznego API dla każdej bazy orzeczeń.

**Prywatny korpus sprawy:** dokumenty, zeznania/opisy, OCR, pouczenia,
zdarzenia i notatki. Pozostaje lokalnie. Łącz fakty ze źródłami lokalnie;
nie przesyłaj prywatnego dossier jako zapytania do wyszukiwarki.
Zapytania serwerowe redukuj do koniecznego problemu prawnego. Ich treść
również może zdradzać sprawę; pokaż zakres, nie zapisuj pełnych zapytań
w analityce i wspieraj pobranie właściwego pakietu prawa do pracy lokalnej.

## Pipeline źródeł

1. Pobranie z ustalonego oficjalnego źródła; zapisz URL, organ, identyfikator,
   czas pozyskania, checksum i oryginalny tekst lub plik w dozwolonym zakresie.
2. Uporządkowanie: akt → artykuł → paragraf → ustęp → punkt. Nie tnij
   fragmentów tak, by odłączyć definicję, wyjątek albo przepisy odsyłające.
3. Wersjonowanie: daty publikacji, wejścia w życie, zmian, uchylenia i
   przedział obowiązywania normy. Zbadaj przepisy przejściowe. Data pobrania,
   tekst jednolity i stan prawny właściwy dla sprawy nie są tym samym.
4. Wyszukiwanie: identyfikator przepisu i pełny tekst; semantyka opcjonalna.
   Filtruj jurysdykcję, datę i procedurę przed doborem fragmentów.
5. Analiza: przepisy podstawowe i szczególne, właściwość, status uczestnika,
   dopuszczalność działania, wymogi formalne, terminy, koszty i kanał.
6. Orzecznictwo: sprawdź sygnaturę, sąd, datę, treść i dalszy los orzeczenia,
   jeśli można go ustalić. Wyjaśnij podobieństwo i istotne różnice faktów.
   Znajdź także rozbieżności i argumenty przeciwne; jeden wyrok nie dowodzi
   utrwalonej linii. Poradniki organu i orzeczenia nie zastępują przepisu.
7. Weryfikacja: sprawdź istnienie cytatu, zgodność treści, wersję i związek
   z tezą. Walidacja JSON nie weryfikuje prawdziwości analizy.
8. Aktualizacja: zmiana źródła tworzy nową wersję. Oznacz zależne wzorce
   i analizy do ponownego sprawdzenia; nie zmieniaj po cichu archiwalnego pisma.

Materiały wtórne mogą pomagać w interpretacji, jeśli mają legalny dostęp,
autora i datę. Nie kopiuj komentarzy z płatnych baz bez licencji. Nie przedstawiaj
rzadkiego orzeczenia lub stanowiska organu jako bezspornego prawa.

## Dossier dla konkretnej sprawy

Analiza zawiera: ustalone fakty ze stronami dowodów; brakujące fakty;
kwalifikację trybu z uzasadnieniem; właściwy stan prawny; podstawy prawne;
orzecznictwo za i przeciw; warianty działania; warunki, ryzyka i koszty;
reguły terminów; wymagania pisma i złożenia; obszary wymagające oceny prawnika.
Każda istotna teza jest powiązana z `source_id` i dokładną lokalizacją.
Osobno pokazuj interpretację, która z tych źródeł wynika.

Pouczenie w dokumencie jest ważnym materiałem, ale może być niepełne
lub błędne. Sprawdź je na tle właściwych przepisów. Nie przenoś zasad KPA
na podatki, ubezpieczenia, sądy lub procedurę szczególną bez analizy.
Rozróżniaj odwołanie, zażalenie, ponaglenie, skargę proceduralną,
skargę/wniosek, petycję i informację publiczną — według właściwego trybu.

## Brak wiedzy i gotowość modułu

Brak źródła, nieustalona wersja przepisu, sprzeczne rozstrzygnięcia lub
brak istotnego faktu nie mogą kończyć się pewną rekomendacją. Przedstaw
warianty warunkowe i wskaż, co trzeba sprawdzić. Gdy termin może być bliski,
pokaż potrzebę pilnej weryfikacji; brak daty nie oznacza braku ryzyka.

Zestaw benchmarkowy musi obejmować różne procedury, zmiany prawa,
niepełne pouczenia, błędne cytaty i niepodobne wyroki. Oceniaj trafność
kwalifikacji, kompletność źródeł, brak zmyśleń i prawidłowe wykrycie niewiedzy.
Ocena drugiego modelu jest pomocnicza. Zanim nazwiesz moduł zweryfikowanym
prawnie, zapewnij udokumentowaną ocenę przez osobę z kompetencją prawną.
