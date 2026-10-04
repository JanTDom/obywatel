/**
 * Unit tests for Procedural Deadlines Engine (KPA art. 57)
 * Conforms to docs/ACCEPTANCE.md: "Terminy wymagają przypadków brzegowych: weekend, święto, zmiana roku, brak i korekta daty."
 */

import { describe, it, expect } from 'vitest';
import {
  calculateKpaDeadline,
  calculateEasterSunday,
  getPolishPublicHolidays,
} from '../src/domain/deadlines';

describe('Procedural Deadlines Engine (KPA art. 57)', () => {
  it('Easter calculation works deterministically for Gregorian calendar', () => {
    // 2026: Wielkanoc to 5 kwietnia 2026 r.
    const easter2026 = calculateEasterSunday(2026);
    expect(easter2026.month).toBe(4);
    expect(easter2026.day).toBe(5);

    // 2027: Wielkanoc to 28 marca 2027 r.
    const easter2027 = calculateEasterSunday(2027);
    expect(easter2027.month).toBe(3);
    expect(easter2027.day).toBe(28);
  });

  it('generates statutory Polish public holidays including fixed and movable', () => {
    const holidays2026 = getPolishPublicHolidays(2026);
    expect(holidays2026.has('2026-01-01')).toBe(true); // Nowy Rok
    expect(holidays2026.has('2026-01-06')).toBe(true); // Trzech Króli
    expect(holidays2026.has('2026-04-06')).toBe(true); // Poniedziałek Wielkanocny (5 kwiecień + 1)
    expect(holidays2026.has('2026-05-01')).toBe(true); // Święto Pracy
    expect(holidays2026.has('2026-05-03')).toBe(true); // Święto Konstytucji 3 Maja
    expect(holidays2026.has('2026-06-04')).toBe(true); // Boże Ciało (5 kwiecień + 60 dni)
    expect(holidays2026.has('2026-08-15')).toBe(true); // Wniebowzięcie NMP
    expect(holidays2026.has('2026-11-01')).toBe(true); // Wszystkich Świętych
    expect(holidays2026.has('2026-11-11')).toBe(true); // Święto Niepodległości
    expect(holidays2026.has('2026-12-25')).toBe(true); // Boże Narodzenie
    expect(holidays2026.has('2026-12-26')).toBe(true); // Boże Narodzenie 2
  });

  it('standard 14-day appeal deadline ending on regular business day (KPA art. 57 § 1)', () => {
    // Doręczenie: środa 2026-09-02
    // Dnia doręczenia się nie liczy (+14 dni):
    // 2 + 14 = 16 września 2026 (środa - zwykły dzień roboczy)
    const result = calculateKpaDeadline({
      caseId: 'test-case-1',
      baseEventId: 'evt-1',
      deliveryDate: '2026-09-02',
      daysCount: 14,
      actionRequired: 'Złożenie odwołania do SKO',
    });

    expect(result.status).toBe('active');
    expect(result.startDate).toBe('2026-09-02');
    expect(result.calculatedEndDate).toBe('2026-09-16');
    expect(result.isWeekendOrHolidayShifted).toBe(false);
  });

  it('shifts deadline ending on Saturday to Monday (KPA art. 57 § 4)', () => {
    // Doręczenie: sobota 2026-09-05
    // Nominalny koniec 14 dni: sobota 2026-09-19
    // Sobota -> niedziela (dzień wolny) -> poniedziałek 2026-09-21
    const result = calculateKpaDeadline({
      caseId: 'test-case-2',
      baseEventId: 'evt-2',
      deliveryDate: '2026-09-05',
      daysCount: 14,
      actionRequired: 'Złożenie odwołania',
    });

    expect(result.calculatedEndDate).toBe('2026-09-21');
    expect(result.isWeekendOrHolidayShifted).toBe(true);
    expect(result.calculationLog.some((l) => l.includes('sobota'))).toBe(true);
  });

  it('shifts deadline ending on statutory Polish holiday (11 listopada)', () => {
    // Doręczenie: środa 2026-10-28
    // 28.10 + 14 dni = 11 listopada 2026 (Święto Niepodległości - środa)
    // 11 listopada to dzień ustawowo wolny -> przesunięcie na czwartek 12 listopada 2026
    const result = calculateKpaDeadline({
      caseId: 'test-case-3',
      baseEventId: 'evt-3',
      deliveryDate: '2026-10-28',
      daysCount: 14,
      actionRequired: 'Złożenie odwołania',
    });

    expect(result.calculatedEndDate).toBe('2026-11-12');
    expect(result.isWeekendOrHolidayShifted).toBe(true);
  });

  it('handles year change across New Year (31 grudnia / 1 stycznia)', () => {
    // Doręczenie: czwartek 2026-12-17
    // 17.12 + 14 dni = 31 grudnia 2026 (czwartek)
    const resultNormal = calculateKpaDeadline({
      caseId: 'test-case-4',
      baseEventId: 'evt-4',
      deliveryDate: '2026-12-17',
      daysCount: 14,
      actionRequired: 'Odwołanie',
    });
    expect(resultNormal.calculatedEndDate).toBe('2026-12-31');

    // Doręczenie: piątek 2026-12-18
    // 18.12 + 14 dni = 1 stycznia 2027 (Nowy Rok - święto państwowe, piątek)
    // 1 stycznia (święto) -> 2 stycznia (sobota) -> 3 stycznia (niedziela) -> poniedziałek 4 stycznia 2027
    const resultOverHoliday = calculateKpaDeadline({
      caseId: 'test-case-5',
      baseEventId: 'evt-5',
      deliveryDate: '2026-12-18',
      daysCount: 14,
      actionRequired: 'Odwołanie',
    });
    expect(resultOverHoliday.calculatedEndDate).toBe('2027-01-04');
    expect(resultOverHoliday.isWeekendOrHolidayShifted).toBe(true);
  });

  it('missing/unknown delivery date returns unknown without guessing or countdown', () => {
    const result = calculateKpaDeadline({
      caseId: 'test-case-unknown',
      baseEventId: 'evt-unknown',
      deliveryDate: 'unknown',
      daysCount: 14,
      actionRequired: 'Złożenie odwołania',
    });

    expect(result.status).toBe('unknown');
    expect(result.startDate).toBe('unknown');
    expect(result.calculatedEndDate).toBe('unknown');
    expect(result.calculationLog.some((l) => l.includes('Zatrzymano kalkulację'))).toBe(true);
    expect(result.assumptions.some((a) => a.includes('Brak potwierdzonej daty doręczenia'))).toBe(true);
  });
});
