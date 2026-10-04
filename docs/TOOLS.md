# Narzędzia: agent budujący i działająca aplikacja

Najpierw rozpoznaj dostępne środowisko. Pliki skill opisują sposób pracy;
nie są uprawnieniem do odczytu dysku ani dowodem zainstalowania narzędzia.
Nie kopiuj ustawień z Codex do Antigravity bez sprawdzenia kompatybilności.

## Narzędzia deweloperskie Antigravity

| Narzędzie | Zastosowanie | Konfiguracja / granica |
|---|---|---|
| Terminal, edytor, Git | Kod, zależności, testy | Katalog projektu, wersje i lockfile; bez globalnych zmian jeśli niepotrzebne |
| Przeglądarka Antigravity | Interaktywny przegląd UI i źródeł | Osobny profil testowy, local/staging, bez prywatnych portali użytkownika |
| Context7 MCP | Bieżące docs bibliotek, kompatybilne API | Tylko problemy programistyczne; bez danych spraw; wersja biblioteki jawna |
| Playwright Test | Powtarzalne testy E2E i CI | Zależność deweloperska i zgodne wersje browser binaries; dane syntetyczne |
| Playwright MCP — opcja | Interaktywny przegląd aplikacji | Oficjalny serwer, izolowany profil; nie zastępuje test runnera |
| GitHub MCP — opcja | Repozytorium, PR, CI | Ograniczone repo i uprawnienia; zwykle wystarcza Git/CLI |
| Narzędzie web / fetch | Oficjalne źródła prawa i dokumentacja | Tylko potrzebne publiczne zasoby; bez zapytań zawierających prywatne dossier |

Nie podłączaj automatycznie skrzynek obywatela, mObywatela, e-Doręczeń,
portali podatkowych, banków lub usług podpisu. Do budowy wystarczą lokalna
aplikacja, testowe konto i syntetyczne dokumenty.

Korzystaj z [bieżącej dokumentacji MCP Antigravity](https://www.antigravity.google/docs/mcp).
Najpierw preferuj narzędzie wbudowane, potem sprawdzony MCP gdy daje
potrzebną możliwość. Rejestruj wersję, dostępność, zakres uprawnień i wynik
krótkiego sprawdzenia. Nie instaluj wielu serwerów bez konkretnej potrzeby.

### Przykład Context7

`mcp_config.example.json` zawiera wyłączoną definicję zdalnego Context7.
Przenieś potrzebny wpis do konfiguracji wskazanej przez zainstalowane
Antigravity, zwykle projektowego `.agents/mcp_config.json`, łącząc go
z istniejącym `mcpServers`. Ustaw autoryzację według [instrukcji Context7](https://context7.com/docs/resources/all-clients).
Nie commituj tokenów. Nie zakładaj obsługi interpolacji zmiennych przez
konkretny format; potwierdź ją albo użyj obsługi sekretów/OAuth klienta.
Włącz serwer po sprawdzeniu połączenia i narzędzi. Brak Context7 nie
blokuje pracy — używaj oficjalnych docs bibliotek.

Nazwa „Context7” nie oznacza źródła prawa. Skille domenowe i ELI/CBOSA
stanowią oddzielną warstwę. MCP agenta nie ma być publicznym endpointem
aplikacji ani środkiem odczytu produkcyjnych sejfów.

## Biblioteki i usługi aplikacji

| Warstwa | Punkt wyjścia | Ważne wymaganie |
|---|---|---|
| UI | TypeScript, React/Next.js; prosty system komponentów | UI po polsku, dostępność, lokalne operacje bez serwerowych wywołań zawierających treść |
| Lokalna baza | IndexedDB, adapter plików / OPFS | Szyfrowanie jawnie zaprojektowane; migracje i backup sprawdzone |
| PDF i OCR | Utrzymywana biblioteka PDF, lokalny OCR z polskim modelem | Worker, strony źródłowe, brak wysyłania plików; rzeczywisty test polskich pism |
| Kryptografia | Utrzymywana biblioteka, Web Crypto tam gdzie właściwe | Sprawdzony format sejfu; oddzielny projekt zarządzania kluczami |
| Serwer | Next.js/Node lub małe API; PostgreSQL | Publiczne prawo i wzorce, autoryzowane szyfrogramy struktury; bez odczytu prywatnej treści |
| Wiedza prawna | ELI API, oficjalne bazy i publikatory | Publiczny pipeline źródeł, wersje, relacje, aktualizacja i weryfikacja |
| AI — opcja | Oficjalny Google GenAI SDK / Gemini API | Adapter, kontrola disclosure, walidacja i tryb bez AI |

Nie dodawaj chmurowego object storage dla dokumentów do domyślnego MVP.
Nie przenoś OCR na serwer „dla wygody” bez zmiany zakresu i świadomej decyzji.
Local-first oznacza także lokalny indeks, miniatury, streszczenia i embeddings.
Jeśli lokalny LLM jest potrzebny, dobierz go po sprawdzeniu sprzętu i jakości;
nie obiecuj jednakowej wydajności na telefonie i laptopie.

## Gemini API

Korzystanie z Antigravity do programowania nie zapewnia automatycznie
klucza, budżetu ani uprawnień Gemini API dla użytkowników aplikacji.
Model Gemini w chmurze jest procesorem otrzymanych danych, nie lokalnym
asystentem i nie źródłem aktualnego prawa.

Proponowane konfigurowalne ustawienia: `AI_ENABLED=false`,
`AI_PROVIDER=none`, `GEMINI_API_KEY`, `GEMINI_MODEL`,
`AI_REQUEST_BUDGET`, `AI_TIMEOUT_MS`. To konwencja projektowa do wdrożenia,
a nie istniejąca konfiguracja Google. Nie umieszczaj klucza w bundle klienta
ani zmiennej `NEXT_PUBLIC_*`.

Domyślnie aplikacja nie wywołuje Gemini. Opcjonalna ścieżka to backend
proxy ze swoim sekretem i bez logowania treści albo lokalny klient/bridge
z kluczem użytkownika. W ścieżce proxy treść widzi także backend; interfejs
ma to uczciwie pokazać. Zwykła aplikacja webowa nie ukryje klucza API
dostarczonego do przeglądarki. Nie wdrażaj klucza dostawcy publicznie.

Sprawdź aktualne modele, limity, region, koszty, wymogi wieku i warunki
przetwarzania. Według [warunków Gemini API sprawdzonych 4 października 2026](https://ai.google.dev/gemini-api/terms)
udostępnianie klienta użytkownikom w EOG wymaga Paid Services. Płatność
nie oznacza braku wszelkiej retencji. Sprawdź osobno logi, monitoring,
cache, Files API, przechowywanie interakcji i usuwanie kopii. Bezpłatny
prototyp nie jest podstawą do przetwarzania realnych poufnych dokumentów.

API może ułatwić odczyt trudnego skanu, ekstrakcję ustrukturyzowaną,
porównanie dokumentów i pisanie na podstawie wybranego kontekstu.
Grounding/search jest sposobem znajdowania źródeł; wynik nadal wymaga
sprawdzenia wersji prawa, cytatów i relewantności. Nie stosuj zamiennika
„większy prompt = dogłębna wiedza prawna”.
