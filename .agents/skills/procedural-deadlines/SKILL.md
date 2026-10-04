---
name: procedural-deadlines
description: Projektuje i sprawdza terminy w polskich procedurach urzędowych na podstawie potwierdzonych zdarzeń i wersjonowanych reguł. Używaj przy doręczeniu, odliczaniu, ponagleniach i zmianach dat.
---

# Terminy wymagają reguły i zdarzenia

Najpierw ustal procedurę i stan prawny według `polish-legal-research`.
Przeczytaj model Deadline w [DATA_MODEL.md](../../../docs/DATA_MODEL.md).

1. Zidentyfikuj rodzaj terminu i potwierdzone źródło reguły. Nie traktuj
   szablonowej liczby dni jako uniwersalnej ani aktualnej z definicji.
2. Ustal zdarzenie rozpoczynające: data dokumentu, nadania, odczytu,
   odbioru i prawny skutek doręczenia to różne dane. Sprawdź kanał,
   dowód, pouczenie i właściwe zasady doręczenia, w tym ewentualną fikcję.
3. Dla missing/disputed data pokaż unknown i warianty warunkowe.
   Poproś o konkretny dowód. Nie podstawiaj daty importu i nie daj
   uspokajającego komunikatu „brak terminu”, gdy termin jest nieustalony.
4. Zaimplementuj deterministyczny silnik reguł z wersją podstawy,
   jednostką, zasadą pierwszego/ostatniego dnia, kalendarzem i wyjątkami.
   LLM może pomóc odszukać regułę, ale nie jest kalkulatorem ostatecznym.
5. Przy wyniku pokaż zdarzenie, dane wejściowe, regułę, sposób obliczenia,
   źródło i założenia. Rozróżnij termin prawny i cel organizacyjny użytkownika.
6. Korekta daty lub reguły tworzy nowe obliczenie i widoczny alert;
   starego uzasadnienia nie nadpisuj. Zbadaj wpływ na inne czynności.
7. Testuj wyniki ustalone niezależnie: weekend/święto, miesiące i rok,
   różne doręczenia, błędne pouczenie, brak i spór o datę, procedury szczególne.

Wynik: wersjonowana reguła, czytelne wyliczenie lub unknown, odpowiednie
testy i następny krok. Przypomnienia w lokalnej aplikacji nie są stałym
monitoringiem skrzynki; jasno pokaż działanie przy zamkniętym programie.
