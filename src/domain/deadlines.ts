/**
 * Obywatel - Procedural Deadlines Engine (KPA art. 57)
 * Strictly conforms to docs/ACCEPTANCE.md and .agents/skills/procedural-deadlines/SKILL.md
 *
 * Requirements:
 * - KPA art. 57 § 1: Day of the event does not count towards the deadline.
 * - KPA art. 57 § 4: If deadline ends on Saturday or statutory public holiday,
 *   it extends to the next business day (neither Saturday nor statutory holiday).
 * - Polish public holidays per Dz.U. 1951 nr 4 poz. 28 z późn. zm.
 * - Easter movable holidays calculated deterministically (Meeus/Jones/Butcher algorithm).
 * - Missing/disputed dates yield 'unknown' without guessing or silent countdowns.
 */

import { ProceduralDeadline } from './types';

export function calculateEasterSunday(year: number): { month: number; day: number } {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31); // 3 = March, 4 = April
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return { month, day };
}

export function getPolishPublicHolidays(year: number): Set<string> {
  const holidays = new Set<string>();

  // Stałe dni ustawowo wolne od pracy
  const fixed = [
    `${year}-01-01`, // Nowy Rok
    `${year}-01-06`, // Święto Trzech Króli
    `${year}-05-01`, // Święto Pracy
    `${year}-05-03`, // Święto Narodowe Trzeciego Maja
    `${year}-08-15`, // Wniebowzięcie NMP
    `${year}-11-01`, // Wszystkich Świętych
    `${year}-11-11`, // Narodowe Święto Niepodległości
    `${year}-12-25`, // Pierwszy dzień Bożego Narodzenia
    `${year}-12-26`, // Drugi dzień Bożego Narodzenia
  ];
  fixed.forEach((d) => holidays.add(d));

  // Ruchome święta wielkanocne
  const easter = calculateEasterSunday(year);
  const easterDate = new Date(Date.UTC(year, easter.month - 1, easter.day));

  // Poniedziałek Wielkanocny (+1)
  const easterMonday = new Date(easterDate.getTime() + 1 * 24 * 60 * 60 * 1000);
  holidays.add(easterMonday.toISOString().slice(0, 10));

  // Zielone Świątki (+49 dni) - zawsze niedziela, ale też święto
  const pentecost = new Date(easterDate.getTime() + 49 * 24 * 60 * 60 * 1000);
  holidays.add(pentecost.toISOString().slice(0, 10));

  // Boże Ciało (+60 dni - zawsze czwartek)
  const corpusChristi = new Date(easterDate.getTime() + 60 * 24 * 60 * 60 * 1000);
  holidays.add(corpusChristi.toISOString().slice(0, 10));

  return holidays;
}

export function isSaturdayOrSunday(date: Date): boolean {
  const day = date.getUTCDay();
  return day === 0 || day === 6; // 0 = Niedziela, 6 = Sobota
}

export function isNonWorkingDay(date: Date, holidays: Set<string>): boolean {
  if (isSaturdayOrSunday(date)) return true;
  const iso = date.toISOString().slice(0, 10);
  return holidays.has(iso);
}

export interface DeadlineCalculationInput {
  caseId: string;
  baseEventId: string;
  deliveryDate: string | 'unknown'; // ISO string YYYY-MM-DD or 'unknown'
  daysCount: number; // np. 14 dni na odwołanie
  actionRequired: string; // np. "Złożenie odwołania do SKO"
  legalBasisText?: string;
  ruleVersion?: string;
}

export function calculateKpaDeadline(input: DeadlineCalculationInput): ProceduralDeadline {
  const {
    caseId,
    baseEventId,
    deliveryDate,
    daysCount,
    actionRequired,
    legalBasisText = 'art. 57 § 1 i § 4 w zw. z art. 129 § 2 ustawy z dnia 14 czerwca 1960 r. - Kodeks postępowania administracyjnego',
    ruleVersion = 'KPA-1960-V2026',
  } = input;

  const id = `deadline-${caseId}-${baseEventId}`;

  // Przypadek brzegowy: brak potwierdzonej daty doręczenia
  if (!deliveryDate || deliveryDate === 'unknown') {
    return {
      id,
      caseId,
      baseEventId,
      ruleVersion,
      legalBasisId: 'KPA-ART-57',
      legalStateDate: '2026-10-04',
      daysCount,
      startDate: 'unknown',
      calculatedEndDate: 'unknown',
      status: 'unknown',
      assumptions: [
        'Brak potwierdzonej daty doręczenia pisma / decyzji.',
        'Zgodnie z art. 57 § 1 KPA bieg terminu rozpoczyna się od dnia następującego po dniu doręczenia.',
        'Wymagane niezwłoczne ustalenie daty doręczenia (np. z żółtej zwrotki pocztowej lub elektronicznego UPO).',
      ],
      calculationLog: [
        'Krok 1: Weryfikacja daty początkowej zdarzenia.',
        'BŁĄD: Data doręczenia ma status nieustalony (unknown).',
        'Zatrzymano kalkulację: aplikacja nie zgaduje daty doręczenia ani nie podstawia daty dzisiejszej.',
      ],
      isWeekendOrHolidayShifted: false,
      actionRequired,
    };
  }

  const log: string[] = [];
  const assumptions: string[] = [];

  const [y, m, d] = deliveryDate.split('-').map(Number);
  const delivery = new Date(Date.UTC(y, m - 1, d));
  log.push(`Krok 1: Zdarzenie początkowe (doręczenie): ${deliveryDate}.`);
  log.push(`Krok 2: Zgodnie z art. 57 § 1 KPA dnia zdarzenia (${deliveryDate}) nie wlicza się do biegu terminu.`);

  // Dodanie wyznaczonej liczby dni
  const nominalEndDate = new Date(delivery.getTime() + daysCount * 24 * 60 * 60 * 1000);
  const nominalIso = nominalEndDate.toISOString().slice(0, 10);
  log.push(`Krok 3: Nominalny koniec terminu (${daysCount} dni): ${nominalIso}.`);

  // Sprawdzenie przesunięcia na podstawie art. 57 § 4 KPA
  let currentTarget = new Date(nominalEndDate.getTime());
  let shifted = false;

  // Cache świąt dla bieżącego i kolejnego roku (na wypadek przełomu roku)
  const holidaysYear1 = getPolishPublicHolidays(currentTarget.getUTCFullYear());
  const holidaysYear2 = getPolishPublicHolidays(currentTarget.getUTCFullYear() + 1);
  const combinedHolidays = new Set<string>([...holidaysYear1, ...holidaysYear2]);

  while (isNonWorkingDay(currentTarget, combinedHolidays)) {
    const currentIso = currentTarget.toISOString().slice(0, 10);
    const dayOfWeek = currentTarget.getUTCDay();
    const dayName = dayOfWeek === 6 ? 'sobota' : dayOfWeek === 0 ? 'niedziela' : 'dzień ustawowo wolny od pracy';
    log.push(`Krok 4: Data ${currentIso} to ${dayName}. Zgodnie z art. 57 § 4 KPA termin przesuwa się na kolejny dzień roboczy.`);
    currentTarget = new Date(currentTarget.getTime() + 24 * 60 * 60 * 1000);
    shifted = true;
  }

  const finalIso = currentTarget.toISOString().slice(0, 10);
  if (shifted) {
    log.push(`Krok 5: Ostateczny koniec terminu po uwzględnieniu dni wolnych: ${finalIso}.`);
    assumptions.push(`Termin przesunięty z dnia wolnego od pracy / soboty z ${nominalIso} na ${finalIso} (art. 57 § 4 KPA).`);
  } else {
    log.push(`Krok 5: Dzień nominalny ${finalIso} jest zwykłym dniem roboczym. Brak przesunięcia.`);
  }

  assumptions.push(`Podstawa prawna: ${legalBasisText}`);

  return {
    id,
    caseId,
    baseEventId,
    ruleVersion,
    legalBasisId: 'KPA-ART-57',
    legalStateDate: '2026-10-04',
    daysCount,
    startDate: deliveryDate,
    calculatedEndDate: finalIso,
    status: 'active',
    assumptions,
    calculationLog: log,
    isWeekendOrHolidayShifted: shifted,
    actionRequired,
  };
}
