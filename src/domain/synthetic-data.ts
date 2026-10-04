/**
 * Obywatel - Comprehensive Synthetic Test Dataset
 * Conforms to Requirement 13:
 * "Użyj trzech syntetycznych przykładów:
 *  - sprawa z urzędem;
 *  - reklamacja wobec firmy;
 *  - spór wynikający z umowy z inną osobą.
 *  Przykłady zawierają duplikaty, niejasne nazwy, różne wersje,
 *  brakującą datę, skan wielu pism i dokument wspólny dla dwóch spraw."
 */

export interface SyntheticFileDefinition {
  fileName: string;
  suggestedCaseId: string;
  procedureType: 'administrative' | 'consumer_dispute' | 'contract_dispute';
  content: string;
  notes: string;
}

export const SYNTHETIC_DATASET: SyntheticFileDefinition[] = [
  // --- PRZYKŁAD 1: Sprawa z urzędem (S-0001) ---
  {
    fileName: 'decyzja_prezydenta_warszawy_odmowa.txt',
    suggestedCaseId: 'S-0001',
    procedureType: 'administrative',
    content: `PREZYDENT MIASTA STOŁECZNEGO WARSZAWY
Wydział Architektury i Budownictwa dla Dzielnicy Mokotów
Znak: WAB.6740.1.2026.JK
Warszawa, dnia 15 września 2026 r.

DECYZJA NR 142/2026

Na podstawie art. 104 ustawy z dnia 14 czerwca 1960 r. - Kodeks postępowania administracyjnego
po rozpatrzeniu wniosku z dnia 10 czerwca 2026 r. o zmianę pozwolenia na budowę budynku mieszkalnego,
odmawiam zatwierdzenia zamiennego projektu budowlanego.

UZASADNIENIE
Inwestor przedłożył zamienny projekt budowlany, w którym dopuszczalna wysokość kalenicy
przekracza ustalenia Miejscowego Planu Zagospodarowania Przestrzennego dla rejonu Mokotowa.

POUCZENIE
Od niniejszej decyzji służy stronie odwołanie do Samorządowego Kolegium Odwoławczego w Warszawie
za pośrednictwem Prezydenta m.st. Warszawy w terminie 14 dni od dnia jej doręczenia.
W trakcie biegu terminu do wniesienia odwołania strona może zrzec się prawa do wniesienia odwołania.`,
    notes: 'Decyzja odmowna. Data doręczenia nie wynika z treści (status unknown). Wymaga ustalenia terminu 14 dni wg KPA art. 57.',
  },

  {
    fileName: 'zolta_zwrotka_pocztowa_potwierdzenie_odbioru.txt',
    suggestedCaseId: 'S-0001',
    procedureType: 'administrative',
    content: `POCZTA POLSKA S.A.
POTWIERDZENIE ODBIORU PRZESYŁKI POLECONEJ
Numer nadania: (00)359007733445566778

Adresat: Jan Kowalski, ul. Grójecka 45 m. 12, Warszawa
Nadawca: Urząd m.st. Warszawy, Wydział Architektury (WAB.6740.1.2026.JK)

Data doręczenia przesyłki adresatowi: 2026-09-18
Czytelny podpis odbierającego: Jan Kowalski
Stempel placówki oddawczej: UP Warszawa 12, data: 18.09.2026`,
    notes: 'Dokument potwierdza dokładną datę doręczenia decyzji (2026-09-18). Powiązanie: potwierdza_doreczenie decyzji 142/2026.',
  },

  // --- DOKUMENT WSPÓLNY DLA DWÓCH SPRAW (S-0001 oraz S-0003) ---
  {
    fileName: 'wypis_i_wyrys_z_ewidencji_gruntow_dzialka_12.txt',
    suggestedCaseId: 'S-0001',
    procedureType: 'administrative',
    content: `STAROSTWO POWIATOWE / URZĄD MIASTA
Wydział Geodezji i Kartografii
Nr kancelaryjny: G.6620.45.2026

UPROSZCZONY WYPIS Z REJESTRU GRUNTÓW I BUDYNKÓW
Jednostka ewidencyjna: 146501_1 Warszawa
Obręb: 0012, Działka ewidencyjna nr: 12/4
Właściciel: Jan Kowalski (udział 1/1)
Adres nieruchomości: ul. Grójecka 45, 02-031 Warszawa
Przeznaczenie: Tereny zabudowy mieszkaniowej (MN)`,
    notes: 'DOKUMENT WSPÓLNY: Stanowi dowód prawa do dysponowania nieruchomością na cele budowlane (S-0001) oraz dowód lokalizacji prac remontowych (S-0003).',
  },

  // --- PRZYKŁAD 2: Reklamacja wobec firmy (S-0002) ---
  {
    fileName: 'faktura_vat_FV_2026_08_10_zakup_laptopa.txt',
    suggestedCaseId: 'S-0002',
    procedureType: 'consumer_dispute',
    content: `ELEKTRONIKA POLSKA SP. Z O.O.
ul. Towarowa 22, 00-838 Warszawa, NIP: 5271234567

FAKTURA VAT NR FV/2026/08/10/8812
Data wystawienia i sprzedaży: 2026-08-10

Nabywca: Jan Kowalski, ul. Grójecka 45 m. 12, Warszawa

Pozycja:
1. Laptop UltraPro 15 i7/32GB/1TB SSD - 1 szt. - 4 899,00 PLN brutto
Forma płatności: Karta płatnicza (zapłacono)`,
    notes: 'Dowód zakupu w relacji B2C. Podstawa roszczeń reklamacyjnych z Ustawy o prawach konsumenta.',
  },

  {
    fileName: 'faktura_vat_FV_2026_08_10_zakup_laptopa_kopia_duplikat.txt',
    suggestedCaseId: 'S-0002',
    procedureType: 'consumer_dispute',
    content: `ELEKTRONIKA POLSKA SP. Z O.O.
ul. Towarowa 22, 00-838 Warszawa, NIP: 5271234567

FAKTURA VAT NR FV/2026/08/10/8812
Data wystawienia i sprzedaży: 2026-08-10

Nabywca: Jan Kowalski, ul. Grójecka 45 m. 12, Warszawa

Pozycja:
1. Laptop UltraPro 15 i7/32GB/1TB SSD - 1 szt. - 4 899,00 PLN brutto
Forma płatności: Karta płatnicza (zapłacono)`,
    notes: 'DOKŁADNY DUPLIKAT: Identyczna treść i suma kontrolna SHA-256 co plik wyżej. Test wykrywania duplikatów.',
  },

  {
    fileName: 'zgloszenie_reklamacyjne_wada_matrycy.txt',
    suggestedCaseId: 'S-0002',
    procedureType: 'consumer_dispute',
    content: `Zgłoszenie reklamacyjne z tytułu braku zgodności towaru z umową
Złożone w salonie Elektronika Polska Sp. z o.o. w dniu: 2026-09-22

Dotyczy: Laptop UltraPro 15 (Faktura FV/2026/08/10/8812)
Opis wady: Po miesiącu użytkowania matryca wyświetla pionowe kolorowe pasy i gasną piksele.
Żądanie konsumenta (art. 43d Ustawy o prawach konsumenta): Wymiana towaru na nowy, wolny od wad, lub bezpłatna naprawa.

Termin na odpowiedź przedsiębiorcy: 14 dni (do dnia 2026-10-06).
Podpis pracownika salonu: [Pieczęć i podpis - salon Warszawa]`,
    notes: 'Pismo reklamacyjne. Uruchamia 14-dniowy termin na odpowiedź przedsiębiorcy pod rygorem uznania reklamacji (art. 7a UPK).',
  },

  // --- PRZYKŁAD 3: Spór z umowy z osobą fizyczną (S-0003) ---
  {
    fileName: 'umowa_o_dzielo_remont_instalacji.txt',
    suggestedCaseId: 'S-0003',
    procedureType: 'contract_dispute',
    content: `UMOWA O DZIEŁO NR REM/2026/06
Zawarta w Warszawie w dniu 10 czerwca 2026 r. pomiędzy:
Zamawiający: Jan Kowalski
Wykonawca: Marek Wiśniewski, zam. ul. Prosta 10, Warszawa, PESEL: 78051212345

§ 1. Przedmiot umowy
Wykonawca zobowiązuje się do wykonania kompletnej wymiany instalacji wodno-kanalizacyjnej
w lokalu mieszkalnym przy ul. Grójeckiej 45 w Warszawie.

§ 2. Terminy i wynagrodzenie
1. Termin rozpoczęcia prac: 15 czerwca 2026 r.
2. Termin zakończenia prac: 15 sierpnia 2026 r.
3. Wynagrodzenie ryczałtowe: 12 000,00 PLN.
4. Zadatek płatny w dniu podpisania umowy: 5 000,00 PLN (zapłacono gotówką).

§ 3. Kary umowne
W razie zwłoki w wykonaniu dzieła Wykonawca zapłaci karę umowną w wysokości 100 zł za każdy dzień zwłoki.`,
    notes: 'Podstawa roszczeń odszkodowawczych i zwrotu zadatku (art. 471 i art. 394 KC).',
  },

  // --- SKAN ZBIORCZY WIELU PISM W JEDNYM DOKUMENCIE ---
  {
    fileName: 'skan_zbiorczy_protokol_i_wezwanie_do_zaplaty.txt',
    suggestedCaseId: 'S-0003',
    procedureType: 'contract_dispute',
    content: `--- STRONA 1: PROTOKÓŁ STWIERDZENIA WAD I PORZUCENIA PRAC ---
Spisany w dniu 20 sierpnia 2026 r. w lokalu przy ul. Grójeckiej 45.
Obecny: Jan Kowalski (Zamawiający).
Wykonawca Marek Wiśniewski nie stawił się pomimo telefonicznego wezwania.
Stwierdzono: Prace instalacyjne zostały porzucone w stanie surowym, brak podłączenia pionów,
zalana podłoga w łazience. Niewykonanie umowy REM/2026/06.

--- STRONA 2: OSTATECZNE PRZEDSĄDOWE WEZWANIE DO ZAPŁATY ---
Warszawa, dnia 25 sierpnia 2026 r.
Wierzyciel: Jan Kowalski
Dłużnik: Marek Wiśniewski, ul. Prosta 10, Warszawa

Niniejszym wzywam Pana do zapłaty kwoty 8 500,00 PLN (w tym zwrot zadatku 5 000 zł
oraz koszty usunięcia szkód 3 500 zł) w nieprzekraczalnym terminie 7 dni od dnia otrzymania niniejszego wezwania,
na rachunek bankowy nr: 12 1020 1026 0000 1234 5678 9012.
W razie braku wpłaty sprawa zostanie skierowana na drogę postępowania sądowego (art. 471 KC).`,
    notes: 'SKAN ZBIORCZY: Plik zawiera dwa odrębne pisma procesowe (Protokół na str. 1 oraz Przedsądowe wezwanie do zapłaty na str. 2). Test logicznego podziału dokumentów.',
  },
];
