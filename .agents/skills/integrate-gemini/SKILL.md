---
name: integrate-gemini
description: Dodaje opcjonalny adapter Gemini API do lokalnej aplikacji dokumentowej z podglądem danych, zgodą, walidacją i trybem bez AI. Używaj wyłącznie przy świadomym projektowaniu integracji chmurowej AI.
---

# Gemini jako jawnie zewnętrzna operacja

Przeczytaj [TOOLS.md](../../../docs/TOOLS.md),
[PRIVACY.md](../../../docs/PRIVACY.md) i [ACCEPTANCE.md](../../../docs/ACCEPTANCE.md).
Nie włączaj tego skilla przy zwykłym OCR, wyszukiwaniu lokalnym lub pismach,
jeżeli użytkownik nie wybrał operacji zewnętrznej.

1. Zdefiniuj bezpieczny use case: ekstrakcja wybranych pól, porównanie
   wersji lub szkic językowy. Nie powierzaj modelowi ostatecznego ustalenia
   prawa, terminu, właściwości, autentyczności ani bezpieczeństwa.
2. Przygotuj podgląd: dokładne strony/pola/tekst, odbiorca, cel, model,
   przewidywany koszt, retencja, możliwe logi i tryb usunięcia. Użytkownik
   zatwierdza ten konkretny payload; zmiana zakresu wymaga nowej zgody.
3. Redaguj PESEL, podpis, adres, dane osób trzecich i zbędne informacje,
   o ile nie są konieczne. Redakcja jest widoczna i odwracalna lokalnie;
   nie udawaj, że usunięcie nazwy pliku usuwa dane z PDF.
4. Wyślij przez kontrolowany adapter po stronie serwera lub zatwierdzony
   lokalny bridge. Klucz API jest sekretem; nie trafia do klienta, logów,
   promptu, URL ani commitów. `AI_ENABLED=false` musi działać.
5. Zapisz lokalnie payload hash, zgodę, czas, wynik, wersję modelu i źródło
   wyniku. Waliduj structured output schematem, ale potem sprawdź każdą
   datę, liczbę, cytat i fakt z oryginałem. Błąd parsowania nie może zapisać
   domniemanej wartości jako potwierdzonej.
6. Jeśli używasz groundingu/search, traktuj link jako trop. Pobierz i
   zweryfikuj oficjalny tekst, wersję, obowiązywanie i relewantność zgodnie
   z `polish-legal-research`. Context7 nie jest korpusem prawa.
7. Nie przesyłaj do Files API, logów ani telemetryki więcej niż zatwierdzono.
   Usuń tymczasowe pliki według realnej polityki usługi. Pokaż, że zapytanie
   do chmury jest przekazaniem danych poza urządzenie i nie obiecuj ZDR,
   jeśli nie potwierdzono warunków dla danej konfiguracji.

Wynik: adapter możliwy do wyłączenia, testy z mockiem, wyraźny UI zgody,
obsługa timeout/limit/odmowy oraz lokalny fallback. Nie wykonuj żadnej
wysyłki do realnego Gemini bez danych dostępowych i odrębnego upoważnienia
do tego działania.
