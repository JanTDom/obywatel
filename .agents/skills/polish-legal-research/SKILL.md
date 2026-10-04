---
name: polish-legal-research
description: Przygotowuje i weryfikuje dossier prawne polskiej sprawy urzędowej na podstawie wersjonowanych przepisów i orzecznictwa. Używaj przy kwalifikacji procedury, właściwości organu, podstaw prawnych i wariantów działania.
---

# Analiza prawna na źródłach

Przeczytaj [LEGAL_KNOWLEDGE.md](../../../docs/LEGAL_KNOWLEDGE.md).
Publiczne źródła badaj dostępnymi narzędziami; prywatne dokumenty pozostają
w lokalnym kontekście zgodnie z polityką ujawnienia danych.

1. Ustal cel, jurysdykcję, charakter działania organu, etap, daty i status
   osoby. Oddziel potwierdzone fakty od twierdzeń, OCR i braków.
2. Rozpoznaj właściwy tryb i przepisy szczególne. Sprawdź pouczenie,
   właściwość rzeczową/miejscową/instancyjną i warunki dopuszczalności.
   Nie zakładaj automatycznie KPA dla każdego organu.
3. Wyszukaj przepisy w oficjalnym publikatorze, przez ELI API albo
   oficjalny serwis. Zapisz identyfikator, wersję, lokalizację, URL,
   datę obowiązywania i pozyskania. Sprawdź zmiany i przepisy przejściowe.
4. Dotrzyj do definicji, wyjątków, odesłań i przepisów szczególnych.
   Jeśli problem jest interpretacyjny, zbadaj właściwe orzecznictwo;
   potwierdź treść, sygnaturę, datę, fakty i znaczenie rozstrzygnięcia.
   Szukaj także rozbieżności i argumentów przeciwnych.
5. Dla każdej istotnej tezy zapisz dowód prawny i powiązanie z faktami.
   Wyjaśnij, co jest treścią przepisu, a co wnioskiem interpretacyjnym.
   Poradnik i grounding modelu nie zastępują weryfikacji źródła.
6. Porównaj możliwe działania: cel, warunki, adresat, dokumenty,
   wymogi, koszty, ryzyka i terminy. Braki kieruj do uzupełnienia;
   termin przekazuj do skilla `procedural-deadlines` po ustaleniu reguły.
7. Zweryfikuj każdy cytat i źródło. Brak źródła lub wersji pozostawia
   analizę niezweryfikowaną; nie wypełniaj luki pamięcią modelu.

Wynik: dossier z faktami i brakami, mapą prawa, orzecznictwem i
kontrargumentami, wariantami działania i źródłami przy tezach. Dodaj
krótkie wyjaśnienie dla obywatela i konkretne czynności weryfikacyjne.
Nie wymuszaj jednej odpowiedzi przy realnej niepewności i nie oceniaj
szans procentem bez odpowiedniej podstawy. Benchmarki i przegląd prawnika
są wymagane, zanim moduł otrzyma oznaczenie zweryfikowanego prawnie.
