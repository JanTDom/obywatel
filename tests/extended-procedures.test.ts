import { describe, it, expect } from 'vitest';
import {
  createModularLetterDraft,
  formatLetterPlainText,
} from '../src/domain/letter-engine';
import { OFFICIAL_LEGAL_SOURCES } from '../src/domain/legal-knowledge';

describe('Extended Procedures (Podatki, ZUS, Kodeks Pracy)', () => {
  it('weryfikuje obecność oficjalnych źródeł prawnych dla podatków, ZUS i prawa pracy', () => {
    const taxSource = OFFICIAL_LEGAL_SOURCES['OP-ART-220'];
    expect(taxSource).toBeDefined();
    expect(taxSource.supportsClaim).toContain('Dyrektora Izby Administracji Skarbowej');
    expect(taxSource.articleOrPage).toContain('art. 220');
    expect(taxSource.contentHash).toHaveLength(64);

    const zusSource = OFFICIAL_LEGAL_SOURCES['ZUS-ART-83'];
    expect(zusSource).toBeDefined();
    expect(zusSource.supportsClaim).toContain('decyzji ZUS');
    expect(zusSource.articleOrPage).toContain('art. 83');

    const laborSource = OFFICIAL_LEGAL_SOURCES['KP-ART-97'];
    expect(laborSource).toBeDefined();
    expect(laborSource.supportsClaim).toContain('świadectwa pracy');
    expect(laborSource.articleOrPage).toContain('art. 97');
  });

  it('generuje odwołanie podatkowe z checklistą 14 dni zgodnie z Ordynacją podatkową', () => {
    const draft = createModularLetterDraft({
      caseId: 'case-tax-01',
      letterType: 'odwolanie_podatkowe',
      title: 'Odwołanie od decyzji Naczelnika US w sprawie PIT',
      recipientName: 'Dyrektor Izby Administracji Skarbowej w Warszawie',
      recipientAddressOrChannel: 'ul. Felińskiego 2B, 01-513 Warszawa',
      intermediaryAuthority: 'Naczelnik Urzędu Skarbowego Warszawa-Mokotów',
      caseSignature: '1412-SPV.4100.12.2026',
      demands: [
        'Uchylenie zaskarżonej decyzji w całości',
        'Umorzenie postępowania podatkowego',
      ],
      factualBasis: 'Błędne zakwalifikowanie przychodu ze sprzedaży nieruchomości',
      legalJustification: 'Naruszenie art. 120, art. 121 § 1 oraz art. 122 w zw. z art. 187 § 1 Ordynacji podatkowej.',
    });

    expect(draft.letterType).toBe('odwolanie_podatkowe');
    expect(draft.status).toBe('draft');
    expect(draft.demands.length).toBe(2);

    const checklistItems = draft.checklist.map((c) => c.item);
    expect(checklistItems.some((item) => item.includes('Dyrektor Izby Administracji Skarbowej'))).toBe(true);
    expect(checklistItems.some((item) => item.includes('14 dni'))).toBe(true);

    const formatted = formatLetterPlainText(draft);
    expect(formatted).toContain('Dyrektor Izby Administracji Skarbowej w Warszawie');
    expect(formatted).toContain('za pośrednictwem: Naczelnik Urzędu Skarbowego Warszawa-Mokotów');
    expect(formatted).toContain('1412-SPV.4100.12.2026');
  });

  it('generuje odwołanie od decyzji ZUS do Sądu Pracy i Ubezpieczeń Społecznych z terminem 1 miesiąca', () => {
    const draft = createModularLetterDraft({
      caseId: 'case-zus-01',
      letterType: 'odwolanie_zus',
      title: 'Odwołanie od decyzji odmawiającej prawa do zasiłku chorobowego',
      recipientName: 'Sąd Rejonowy dla m.st. Warszawy - Sąd Pracy i Ubezpieczeń Społecznych',
      recipientAddressOrChannel: 'ul. Marszałkowska 82, 00-517 Warszawa',
      intermediaryAuthority: 'Zakład Ubezpieczeń Społecznych I Oddział w Warszawie',
      caseSignature: 'ZUS-2026-CH-99123',
      demands: [
        'Zmiana zaskarżonej decyzji i przyznanie prawa do zasiłku chorobowego',
      ],
      factualBasis: 'Spełnienie warunku okresu wyczekiwania i terminowe opłacenie składek',
      legalJustification: 'Zgodnie z art. 83 ust. 2 ustawy o s.u.s. oraz przepisami ustawy zasiłkowej',
    });

    expect(draft.letterType).toBe('odwolanie_zus');
    const checklistItems = draft.checklist.map((c) => c.item);
    expect(checklistItems.some((item) => item.includes('Sądu Pracy i Ubezpieczeń Społecznych'))).toBe(true);
    expect(checklistItems.some((item) => item.includes('1 miesiąca'))).toBe(true);
    expect(checklistItems.some((item) => item.includes('Brak opłaty sądowej'))).toBe(true);
  });

  it('generuje wezwanie pracownicze z terminem 14 dni na sprostowanie świadectwa pracy', () => {
    const draft = createModularLetterDraft({
      caseId: 'case-labor-01',
      letterType: 'wezwanie_pracownicze',
      title: 'Wniosek o sprostowanie świadectwa pracy',
      recipientName: 'Przedsiębiorstwo Alfa Sp. z o.o.',
      recipientAddressOrChannel: 'ul. Przemysłowa 5, 00-001 Warszawa',
      demands: [
        'Sprostowanie punktu 3 świadectwa pracy w zakresie trybu rozwiązania umowy',
      ],
      factualBasis: 'Umowa została rozwiązana za porozumieniem stron, a nie z winy pracownika',
      legalJustification: 'Na podstawie art. 97 § 2[1] Kodeksu pracy',
    });

    expect(draft.letterType).toBe('wezwanie_pracownicze');
    const checklistItems = draft.checklist.map((c) => c.item);
    expect(checklistItems.some((item) => item.includes('Oznaczenie pracodawcy'))).toBe(true);
    expect(checklistItems.some((item) => item.includes('14 dni'))).toBe(true);
  });
});
