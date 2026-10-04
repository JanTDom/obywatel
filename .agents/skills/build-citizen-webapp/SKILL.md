---
name: build-citizen-webapp
description: Implementuje przebiegi aplikacji Obywatel: lokalny sejf, sprawy, oś czasu, źródła, dossier, pismo i zaszyfrowany eksport. Używaj przy zmianach frontendowych, backendowych i danych.
---

# Budowa pełnego przebiegu

Przeczytaj `PRODUCT.md`, `PRIVACY.md`, `DATA_MODEL.md`, `TOOLS.md` i
`ACCEPTANCE.md`. Buduj vertical slice od interfejsu do zapisu/eksportu,
zamiast samej makiety.

1. Zmapuj ekran na stan domeny i źródło danych. Nie przenoś prywatnego
   dossier do Server Component, logu, analytics ani API bez jawnej granicy.
   Po stronie serwera używaj warstwy autoryzacji i minimalnych DTO.
2. Zaimplementuj tryb lokalny jako pierwszą ścieżkę. Serwer otrzymuje
   publiczne źródła i opcjonalny szyfrogram, nie czytelny dokument.
   W razie braku File System Access użyj bezpiecznego fallbacku wyboru pliku.
3. Wprowadź zygzak: import → dokument → OCR → potwierdzone pola → zdarzenie
   → źródło → reguła terminu → wariant działania → draft → eksport.
   Każda operacja może być przerwana i wznowiona bez utraty oryginału.
4. Stany są jawne: `unknown`, `proposed`, `confirmed`, `disputed`, `draft`,
   `prepared`, `sent_by_user`, `receipt_added`, `confirmed_by_receipt`.
   Nie skracaj ich do jednego „załatwione”.
5. UI pokazuje źródło, stan weryfikacji i następny krok. Przy błędzie
   zachowaj lokalną pracę i wyjaśnij, czy operacja miała kontakt z siecią.
6. Wytnij dane z telemetrii, error reports, URL, nagłówków i cache. Stosuj
   ścisłą CSP, brak obcych skryptów w sejfie i allowlistę egress. Dodaj test
   z canary PII, który wykryje każdy nieoczekiwany request.
7. Szyfrowanie, sync i migracje opieraj na utrzymywanej bibliotece oraz
   zapisanej decyzji. Nie pisz własnej kryptografii i nie mieszaj klucza
   odzyskiwania z hasłem sesji konta.
8. Każdy przebieg ma test jednostkowy stanu, integracyjny granicy danych,
   E2E na syntetycznych danych i test klawiatury. Nie twórz testów, które
   tylko powtarzają kod implementacji.

Przed merge uruchom lint/typecheck/build, testy właściwe dla zmiany,
testy przywracania sejfu i scenariusze w `ACCEPTANCE.md`. Odnotuj realne
ograniczenia przeglądarki, quota, offline, AI i produkcyjnych kanałów.
