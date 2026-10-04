---
name: local-document-vault
description: Implementuje lokalny sejf dokumentów obywatela z OCR, wersjami, powiązaniami i wyszukiwaniem. Używaj przy imporcie, organizacji, ekstrakcji, backupie i odtwarzaniu dokumentów sprawy.
---

# Dokumenty jako uporządkowane dowody

Przeczytaj [PRIVACY.md](../../../docs/PRIVACY.md) i
[DATA_MODEL.md](../../../docs/DATA_MODEL.md). Celem jest lokalny materiał,
który da się odnaleźć, zweryfikować i odtworzyć bez utraty dowodów.

1. Otwórz tylko pliki wybrane przez użytkownika. Wykryj możliwości
   przeglądarki; obsłuż cofnięcie uprawnień, quota i brak pliku. Wariant
   folderowy ma odczytywać dowody bez zmieniania ich bajtów.
2. Sprawdź typ, rozmiar i podstawowe ryzyka wejścia. Nadaj trwałe ID,
   policz hash oryginału lokalnie, zachowaj bajty, nazwę i pochodzenie
   w szyfrowanym manifeście. Uszkodzony lub zaszyfrowany PDF ma jawny status.
3. Wykryj dokładne duplikaty, ale nie usuwaj różnych skanów ani stron
   na podstawie podobieństwa. Dołącz dokument do odpowiednich spraw
   i kolekcji; zaproponowaną klasyfikację można poprawić.
4. Ekstrakcja PDF i OCR działają lokalnie. Zachowaj numerację stron
   i odsyłacze do fragmentów; każdą pochodną powiąż z wersją oryginału.
   OCR nie jest dowodem prawdziwości ani weryfikacją podpisu.
5. Daty, sygnatury, kwoty, adresat, pouczenie i numer dokumentu są polami
   krytycznymi. Pokazuj je jako propozycje obok oryginału. Nie wpisuj daty
   importu zamiast doręczenia. Korekta użytkownika ma autora i wersję.
6. Buduj oś czasu i lokalny indeks. Wynik wyszukiwania prowadzi do dokumentu,
   wersji i strony. Prywatne embeddings, miniatury i streszczenia pozostają
   lokalnie. Nie wyślij ich do serwera w ramach „samych metadanych”.
7. Eksportuj zaszyfrowany sejf i sprawdź restore na czystym profilu:
   hashe, relacje, wersje, notatki, źródła i odzyskanie klucza.

Wynik pracy: działający import/przegląd/wyszukiwanie/backup, udokumentowany
format sejfu, obsługa stanów błędu i test ruchu sieciowego. Usunięcie
dokumentu usuwa również pochodne i indeksy zgodnie z modelem retencji,
bez kasowania innych spraw lub plików źródłowych poza aplikacją.
