# Oficjalne źródła i dokumentacja

Sprawdzone jako punkty wejścia 4 października 2026 r. Ta lista nie jest
kompletną bazą prawa ani potwierdzeniem podstawy prawnej konkretnej sprawy.
Przed zastosowaniem otwórz źródło, zweryfikuj treść i właściwy stan prawny.

## Google Antigravity

- [Rules](https://www.antigravity.google/docs/rules) — reguły projektu.
- [Agent skills](https://www.antigravity.google/docs/skills) — katalogi i format skilli.
- [MCP](https://www.antigravity.google/docs/mcp) — konfiguracja narzędzi zewnętrznych.
- [Workflows to skills](https://www.antigravity.google/docs/migration/workflows-to-skills) — przejście na skille.

Pakiet używa `AGENTS.md` i `.agents/skills`. Nie zakłada zainstalowanej
wersji Antigravity ani dostępu do konkretnej usługi. Wczytanie pliku
i poprawność formatu nie dowodzą, że serwer MCP jest aktywny.

## Prawo i procedury

- [ELI API — dokumentacja Sejmu](https://api.sejm.gov.pl/eli_pl.html) — dostęp do informacji o aktach i metadanych.
- [ELI: Kodeks postępowania administracyjnego](https://eli.gov.pl/eli/DU/1960/168/ogl) — przykład identyfikacji aktu i powiązanych wersji; ustal wersję właściwą dla sprawy.
- [CBOSA — instrukcja oficjalnej bazy NSA](https://orzeczenia.nsa.gov.pl/instrukcja.html) — orzecznictwo sądów administracyjnych.
- [KPRM: skargi, wnioski i petycje](https://www.gov.pl/web/premier/skargi-wnioski-i-petycje-obywateli) — rozróżnienie ścieżek na przykładzie organu.
- [Uzyskaj informację publiczną](https://www.gov.pl/web/gov/uzyskaj-informacje-publiczna) — punkt wejścia do tej procedury.
- [e-Doręczenia: informacje dla obywatela](https://www.gov.pl/web/e-doreczenia/najwazniejsze-informacje-dla-obywatela) — kanały i informacje użytkowe; zweryfikuj wyjątki dla danej sprawy.

W rozszerzeniach dodaj właściwe publikatory prawa UE, prawa miejscowego
i oficjalne bazy orzecznictwa odpowiednich sądów. Weryfikuj URL i status
źródła, zanim dodasz je do aktywnego pipeline. Nie zakładaj, że poradnik
gov.pl albo baza orzeczeń obejmuje pełne prawo wszystkich procedur.

## Aplikacja i lokalne przechowywanie

- [Next.js: App Router](https://nextjs.org/docs/app).
- [Next.js: authentication](https://nextjs.org/docs/app/guides/authentication).
- [Playwright Test](https://playwright.dev/docs/intro).
- [Context7: konfiguracja klientów](https://context7.com/docs/resources/all-clients).
- [Chrome: File System Access API](https://developer.chrome.com/docs/capabilities/web-apis/file-system-access).
- [MDN: OPFS](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API/Origin_private_file_system).
- [MDN: quotas and eviction](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria).
- [MDN: persistent storage](https://developer.mozilla.org/en-US/docs/Web/API/StorageManager/persist).
- [W3C: Web Cryptography API](https://www.w3.org/TR/webcrypto/).

## Gemini

- [Document understanding](https://ai.google.dev/gemini-api/docs/document-processing).
- [Structured outputs](https://ai.google.dev/gemini-api/docs/structured-output).
- [Grounding with Google Search](https://ai.google.dev/gemini-api/docs/google-search).
- [Files API](https://ai.google.dev/gemini-api/docs/files).
- [Additional Terms](https://ai.google.dev/gemini-api/terms).
- [Data logging and sharing](https://ai.google.dev/gemini-api/docs/logs-policy).
- [Zero data retention — warunki i ograniczenia](https://ai.google.dev/gemini-api/docs/zdr).

## Minimalny zapis źródła w analizie

`source_id`, `source_type`, `official_url`, `publisher`, `act_or_case_id`,
`article_or_page`, `version_id`, `effective_from`, `effective_to`,
`retrieved_at`, `content_hash`, `verification_status`, `supports_claim_id`.
Daty nieustalone mają wartość unknown, a nie fikcyjny przedział.
Link bez potwierdzenia treści i wersji nie jest wystarczającym cytowaniem.
