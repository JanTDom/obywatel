# Minimalny model danych i porządek dokumentów

Model jest logiczny. Prywatne rekordy zapisuj lokalnie, a ich wersje
serwerowe jako szyfrogram zgodnie z `PRIVACY.md`. Wszystkie zależności
muszą zachować rozdzielenie publicznych źródeł i prywatnego materiału.

| Encja | Istotne pola / relacje |
|---|---|
| Case | ID, cel, tryb, urząd/właściwość z uzasadnieniem, status, następna czynność, lista braków |
| Document | ID, powiązania ze sprawami, typ, kierunek korespondencji, pochodzenie, oryginalna nazwa, MIME, rozmiar, hash oryginału, lokalny locator |
| DocumentVersion | ID dokumentu, wersja, rodzic, rodzaj: original/OCR/correction/draft/export/redacted, hash, data, narzędzie, autor zatwierdzenia |
| ExtractedField | wartość, status unknown/proposed/confirmed/disputed, dokument+wersja+strona+fragment, metoda, pewność OCR, potwierdzenie |
| Event | rodzaj, data dokumentu/wysłania/doręczenia/zdarzenia, precyzja daty, dowód, potwierdzenie |
| Correspondence | kierunek, dokument, adresat, kanał, podpis jeśli potwierdzony, deklaracja wysłania, dowód złożenia/doręczenia |
| Deadline | zdarzenie bazowe, wersja reguły, źródło prawa, stan prawny, wynik lub unknown, założenia, historia wyliczenia |
| LegalSource / SourceVersion | URL, identyfikator, organ, typ, wersja, obowiązywanie, data pobrania, hash, status aktualizacji |
| LegalAnalysis | problem, ustalone fakty, braki, tezy+źródła, warianty, kontrargumenty, status weryfikacji, zależne wersje |
| Consent / Disclosure | operacja, odbiorca, cel, dokładny zakres, wersja/payload hash, czas zgody i wykonania, stan usunięcia kopii |
| AuditEvent | czynność, lokalny aktor, czas, wersje przed/po; treść szczegółowa zaszyfrowana |
| SyncEnvelope | opaque ID, owner ID, ciphertext, crypto/schema version, revision, konflikt/tombstone; bez czytelnego dossier |

## Organizacja sejfu

Widok sprawy ma kolekcje: **otrzymane**, **wysłane**, **dowody**,
**potwierdzenia**, **projekty pism**, **materiały prawne**. To widoki
metadanych; jeden dowód może występować w kilku sprawach bez niepotrzebnego
kopiowania oryginału. Łącz dokument z korespondencją i potwierdzeniem.

Przenośny eksport zawiera manifest, oryginalne bajty, pochodne,
metadane, relacje, historię wersji i snapshot użytych źródeł w dozwolonym
zakresie. Wszystko objęte szyfrowaniem archiwum. Używaj technicznych ID
w nazwach blobów; nazwy czytelne przechowuj w szyfrowanym manifeście.
Czytelne nazwy eksportu na urządzeniu mogą mieć format
`data-lub-nieznana__typ__document-id__vNN.ext`; nie dodawaj PESEL i nazwiska.

Oryginał po imporcie nie zmienia bajtów. Korekta OCR tworzy nową wersję,
nie modyfikuje dowodu. Odróżniaj dokładny duplikat (hash bajtów) od
podobnego dokumentu lub nowego skanu; nie usuwaj podobnych plików automatycznie.
Sprawdzenie podpisu elektronicznego to osobna operacja z wynikiem i metodą;
hash integralności nie dowodzi autentyczności ani skutecznego doręczenia.

Daty nie są zamienne: sporządzenie, wysłanie, otrzymanie i prawny skutek
doręczenia mogą być różne. Nie wstawiaj daty importu jako daty doręczenia.
Każde pole krytyczne musi zachować źródło i stan potwierdzenia.
