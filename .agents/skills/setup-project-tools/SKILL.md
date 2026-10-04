---
name: setup-project-tools
description: Przygotowuje narzędzia deweloperskie i opcjonalne MCP dla projektu Obywatel. Używaj przy starcie środowiska lub zmianie integracji, bibliotek i sposobu testowania.
---

# Przygotowanie narzędzi

Przeczytaj [TOOLS.md](../../../docs/TOOLS.md). Celem jest sprawdzone,
minimalne środowisko budowy, z listą działających możliwości i braków.

1. Rozpoznaj repozytorium, istniejące reguły, wersję Antigravity, runtime,
   menedżer pakietów i dostępne narzędzia. Nie nadpisuj konfiguracji.
2. Sprawdź docs wersji stosu. Preferuj oficjalną dokumentację i Context7
   do bibliotek; nie używaj Context7 do prawa i nie wysyłaj treści spraw.
3. Przygotuj zależności w projekcie i lockfile. Utrzymuj skrypty typecheck,
   lint, build i odpowiednie testy. Nie dodawaj zbędnych usług chmurowych.
4. Sprawdź działanie przeglądarki/test runnera na lokalnej aplikacji
   z syntetycznym dokumentem. Potwierdź wersje browser binaries.
5. Jeśli potrzebny MCP, potwierdź oficjalny serwer, uprawnienia, transport
   i sposób podawania sekretu. Połącz wpis z konfiguracją właściwej wersji
   Antigravity. Przykład w pakiecie jest wyłączony i nie zawiera tokenu.
6. Testuj read/search najpierw. Dla przeglądarki używaj osobnego profilu
   i local/staging. Nie korzystaj z produkcyjnych sesji obywatela.
7. Zapisz `docs/tooling-status.md`: narzędzie, wersja, zakres, status,
   wykonane sprawdzenie, potrzebne dane dostępu i użyty zamiennik.

Brak opcjonalnego MCP lub Gemini nie zatrzymuje pracy. Przygotuj mock
i wskaż brak; nie deklaruj instalacji, połączenia lub skutecznego dostępu
bez sprawdzenia. Nie zakładaj ekspansji `${ENV}` w JSON, jeśli klient jej
nie dokumentuje. Nie umieszczaj sekretów w repo ani raporcie.
