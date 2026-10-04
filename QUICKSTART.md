# Szybki start

## Jeśli zaczynasz nowy projekt

1. Pobierz i rozpakuj `antigravity-obywatel.zip`.
2. Otwórz rozpakowany katalog `antigravity-obywatel` jako workspace/projekt w Google Antigravity.
3. Upewnij się, że w katalogu projektu widać ukryty folder `.agents`.
4. Otwórz `START.md`, skopiuj sekcję **Prompt startowy — skopiuj do Antigravity** i wklej ją do rozmowy z agentem.
5. Agent najpierw przeczyta `AGENTS.md` i dokumentację, przygotuje plan, a potem zacznie budować aplikację.

Pierwsze polecenie możesz skrócić do:

```text
Przeczytaj QUICKSTART.md, START.md, AGENTS.md oraz docs/. Następnie użyj
skilla setup-project-tools, sprawdź środowisko i przygotuj plan pierwszego
vertical slice. Nie używaj prawdziwych dokumentów ani nie włączaj Gemini.
```

## Jeśli masz już projekt aplikacji

Skopiuj do jego katalogu głównego:

- `AGENTS.md`,
- `.agents/skills/`,
- `docs/`.

Nie kopiuj bez sprawdzenia istniejących reguł, `package.json`, konfiguracji
MCP ani sekretów. Połącz instrukcje z obecnym projektem zamiast nadpisywać
jego ustawienia.

## Co jest aktywne, a co nie

- Skille i `AGENTS.md` są instrukcjami dla agenta.
- `mcp_config.example.json` jest tylko przykładem. Nie aktywuje MCP.
- Gemini jest opisane jako opcjonalny adapter i powinno pozostać wyłączone.
- Pakiet nie zawiera kodu działającej aplikacji, bazy danych ani konta Google.

## Pierwszy cel dla agenta

Poproś o działający lokalnie przebieg na danych syntetycznych:

`utworzenie sprawy → import przykładowego PDF → OCR → korekta → oś czasu → źródło prawne → projekt pisma → eksport → backup → odtworzenie`.

Nie podawaj agentowi prawdziwych pism, PESEL-i, adresów ani danych logowania.
Nie włączaj automatycznego logowania do portali urzędowych i nie wysyłaj
żadnych pism z poziomu prototypu.
