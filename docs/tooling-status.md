# Stan narzędzi i środowiska deweloperskiego

Stan na dzień: 4 października 2026 r.

| Narzędzie | Wersja | Zakres | Status | Wykonane sprawdzenie | Wymagane dane dostępowe | Użyty zamiennik / uwaga |
|---|---|---|---|---|---|---|
| Node.js | v24.14.0 | Środowisko wykonawcze JavaScript / TypeScript | Dostępne | `node -v` | Brak | Brak |
| npm | 11.17.0 | Menedżer pakietów | Dostępne | `npm -v` | Brak | Brak |
| Git | 2.50.1 | Kontrola wersji | Zainicjowane | `git --version`, `git status` | Brak | Brak |
| Context7 MCP | nd. | Dokumentacja bibliotek | Wyłączone (zgodnie ze zleceniem) | Zbadano `mcp_config.example.json` | Opcjonalny token | Oficjalna dokumentacja i lokalne typy |
| Gemini API | nd. | Chmurowa analiza i generowanie | Wyłączone (zgodnie ze zleceniem) | Zweryfikowano brak klucza i wymóg pracy bez AI | Opcjonalny klucz API w chmurze | Tryb bez AI / jawny mock syntetyczny |
| MCP (ogólne) | nd. | Zewnętrzne integracje agenta | Wyłączone (zgodnie ze zleceniem) | Zgodność ze zleceniem użytkownika | Brak | Narzędzia wbudowane i lokalny CLI |
| Prawdziwe dokumenty | nd. | Dane wejściowe | Niedozwolone (zgodnie ze zleceniem) | Zgodność z zaleceniem izolacji danych poufnych | Brak | Zestaw syntetycznych dokumentów i zdarzeń testowych |
| Test runner | Vitest | Testy jednostkowe, integracyjne i brzegowe | W przygotowaniu | Konfiguracja w `package.json` | Brak | Brak |
