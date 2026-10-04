# Architektura prywatności: dokumenty lokalnie

## Granice danych

W MVP wybierz wariant **bez synchronizacji prywatnej sprawy**. Serwer
udostępnia tylko publiczne źródła, reguły i wersje aplikacji; konto nie jest
serwerowym sejfem. Opcjonalne E2EE może później synchronizować zaszyfrowaną
strukturę, jeśli użytkownik świadomie wybierze wygodę wielu urządzeń.
Nie używaj szyfrowania tylko do marketingowego hasła: dostawca nadal może
widzieć identyfikator konta, adres IP, rozmiar i czas szyfrogramu. Przyjmij
to jako osobno opisaną granicę prywatności.

| Warstwa | Przechowuje | Zasady |
|---|---|---|
| Urządzenie użytkownika | Oryginały, OCR, miniatury, indeks, prywatne metadane, szkice, klucze | Szyfrowany sejf, kontrola dostępu lokalnego, jawny backup |
| Serwer aplikacji | Publiczne przepisy, źródła, wzorce i reguły; zaszyfrowana struktura spraw | Bez klucza do danych sprawy i bez czytelnego OCR |
| Konto i infrastruktura | Minimum danych logowania, techniczne identyfikatory i metadane połączenia | Minimalna retencja, brak treści spraw w logach; jawny opis ograniczeń |
| Chmurowe AI — opcja | Wyłącznie zakres zatwierdzony dla danej operacji | Podgląd, odbiorca, cel, zasady retencji i informacja o przekazaniu danych |
| Publiczna publikacja — opcja | Odrębny, zatwierdzony materiał | Redakcja danych i kontrola każdej publikowanej wersji |

Zaszyfruj po stronie klienta także tytuł sprawy, urząd, sygnaturę, daty,
prywatne hashe, nazwy dokumentów, relacje, notatki i szczegółowy audyt.
Serwer zna niezbędne ID rekordu, wersję szyfrogramu i stan technicznej
synchronizacji; minimalizuj ujawnione rozmiary i czas modyfikacji, a pozostałe
ujawnienia opisz. Publiczne reguły postępowania nie potrzebują szyfrowania.

## Lokalny sejf w aplikacji webowej

Przeglądarka nie otrzymuje swobodnego dostępu do dysku. Użytkownik wybiera
plik lub katalog i nadaje zakres dostępu. Wspieraj File System Access API
tylko po wykryciu możliwości i uprawnień; nie zakładaj identycznej obsługi
we wszystkich przeglądarkach i na telefonie. Nie zapisuj pełnej ścieżki
użytkownika na serwerze. Ponowne otwarcie może wymagać ponownego wskazania
pliku lub katalogu; sprawdź hash, zanim zwiążesz go z istniejącym rekordem.

Wariant zgodny z szerszą grupą przeglądarek: lokalny import przez wybór
plików, zaszyfrowane OPFS/IndexedDB oraz eksport przenośnego sejfu.
Pamięć przeglądarki może zostać usunięta. Żądanie persistent storage nie
gwarantuje backupu ani ochrony przed ręcznym czyszczeniem profilu.
Utrata lokalnego pliku nie może być ukryta przez istniejącą metadaną.

Pobranie/zapis oryginału oznacza zachowanie jego bajtów, także gdy sejf
przechowuje je jako szyfrogram. Nie „poprawiaj” PDF i nie usuwaj jego podpisu.
Przechowywanie istniejących dokumentów poza sejfem nie szyfruje ich automatycznie;
powiedz użytkownikowi, które kopie są chronione szyfrowaniem aplikacji.

OCR i ekstrakcję PDF uruchamiaj lokalnie, najlepiej w workerze. Biblioteki,
modele i zasoby językowe pobierane przez aplikację nie mogą otrzymywać treści
dokumentu. Wrażliwe indeksy, embeddings, miniatury i cache traktuj jak oryginały.
Zdalne embeddings także są przekazaniem danych i wymagają odrębnej zgody.

## Klucze, backup i wiele urządzeń

Wybierz utrzymywaną bibliotekę i standardowe szyfrowanie uwierzytelnione.
Przeanalizuj generowanie nonce, KDF, przechowywanie kluczy i blokadę sejfu.
Nie buduj własnego algorytmu. Oddziel logowanie do konta od odblokowania
sejfu: reset hasła do konta nie daje serwerowi prawa ani możliwości odczytu.

Zaprojektuj klucz odzyskiwania i zaszyfrowany eksport, sprawdź odtworzenie
na czystym profilu. Pokaż stan ostatniego backupu. Bez klucza i backupu
administrator nie odzyska lokalnych danych; komunikuj to podczas tworzenia
sejfu. Dostęp z drugiego urządzenia wymaga odtworzenia lub jawnego transferu.
Sama synchronizacja struktury nie przenosi oryginałów.

W MVP synchronizuj wyłącznie zaszyfrowaną strukturę. Szyfrowany backup
dokumentów w chmurze to możliwy kolejny, wyraźnie opcjonalny moduł,
z osobnym zakresem i testami — nie uruchamiaj go po cichu.
Konflikty wersji przechowuj, przedstawiaj użytkownikowi i rozwiązuj bez
cichego nadpisania dowodu, daty lub pisma. Usuń także pochodne, indeksy,
cache i przyszłe synchronizacje, gdy użytkownik usuwa dokument.

## Realne ograniczenia i kontrola

Szyfrowanie chroni zamknięty sejf i dane przechowywane na serwerze. Kod
aplikacji w odblokowanej przeglądarce ma dostęp do odczytywanych danych.
XSS, przejęcie dostarczanej aplikacji, złośliwa aktualizacja lub zainfekowany
komputer nadal mogą je ujawnić. Nie reklamuj „100% prywatności”.
Ogranicz skrypty zewnętrzne, CSP, zależności i telemetrię; przypnij wersje,
stosuj kontrolę aktualizacji i przegląd bezpieczeństwa. Wyeliminuj session
replay i analitykę treści sejfu. Bardziej wymagający użytkownicy mogą później
wybrać audytowalny klient desktopowy działający offline.

Test sieciowy ma obejmować pliki, treść OCR, nazwy, daty, wyszukiwanie,
embeddings, raporty błędów i generowanie pism. Zablokuj przesyłanie tych
danych w trybie lokalnym. Nie wystarczy sprawdzić brak endpointu upload.

Interfejs pokazuje trzy osobne stany: **tylko na tym urządzeniu**,
**synchronizowana zaszyfrowana struktura**, **wybrany zakres przekazany do AI**.
Serwer nie policzy prywatnych terminów z szyfrogramu. W MVP przypomnienia
są lokalne po otwarciu aplikacji; nie obiecuj alarmu przy zamkniętej przeglądarce.
Opcjonalny kalendarz/serwerowe przypomnienia wymagają własnego modelu ujawnień.
