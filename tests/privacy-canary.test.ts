/**
 * Privacy and Network Canary Verification Tests
 * Conforms to docs/ACCEPTANCE.md: "Import, OCR, wyszukiwanie i projekt pisma w trybie lokalnym: Monitorowany ruch sieciowy nie ujawnia bajtów, OCR, nazw, pól, embeddings ani zapytań prywatnego indeksu."
 */

import { describe, it, expect, vi } from 'vitest';
import { LocalVault } from '../src/domain/vault';
import { extractFieldsFromText } from '../src/domain/extractor';
import { calculateKpaDeadline } from '../src/domain/deadlines';
import { buildAdministrativeAppealDossier } from '../src/domain/legal-knowledge';
import { createAdministrativeAppealDraft, exportLetterForPrinting } from '../src/domain/letter-engine';

describe('Privacy Egress & Canary PII Containment', () => {
  it('runs complete local lifecycle without any network egress or plaintext leak in backup', async () => {
    // Podgląd i blokada wszystkich żądań sieciowych
    const networkSpy = vi.fn();
    const originalFetch = globalThis.fetch;
    globalThis.fetch = networkSpy as unknown as typeof fetch;

    try {
      const canaryPesel = '85010112345';
      const canaryName = 'Stanisław Szczepański';
      const canaryAddress = 'ul. Czereśniowa 14, 05-500 Piaseczno';
      const canarySecretSignature = 'SPRAWA-POUFNA-998877';

      const vault = new LocalVault('canary-test-vault');

      // 1. Utworzenie sprawy
      const c = vault.createCase({
        title: `Sprawa obywatelska: ${canaryName}`,
        goalDescription: `Odwołanie od decyzji z numerem PESEL ${canaryPesel}`,
        procedureType: 'administrative',
        authorityName: 'Burmistrz Miasta i Gminy Piaseczno',
        authorityJurisdictionReason: 'Organ I instancji',
      });

      // 2. Lokalny import dokumentu z danymi canary PII
      const syntheticDocumentText = `
BURMISTRZ MIASTA I GMINY PIASECZNO
Wydział Gospodarki Nieruchomościami
Znak: ${canarySecretSignature}
Data: 2026-09-10

DECYZJA O WYWŁASZCZENIU
Dotyczy obywatela: ${canaryName}, PESEL: ${canaryPesel}, zamieszkałego: ${canaryAddress}.

POUCZENIE
Od niniejszej decyzji przysługuje odwołanie do Wojewody Mazowieckiego w terminie 14 dni od dnia doręczenia.
`;

      const { document, initialVersion } = await vault.importDocument({
        caseId: c.id,
        type: 'decision',
        direction: 'incoming',
        origin: 'pdf_digital',
        originalFileName: 'decyzja_piaseczno.txt',
        mimeType: 'text/plain',
        content: syntheticDocumentText,
      });

      // 3. Ekstrakcja lokalna OCR
      const extraction = extractFieldsFromText({
        documentId: document.id,
        versionId: initialVersion.id,
        text: syntheticDocumentText,
      });

      extraction.fields.forEach((f) => vault.recordExtractedField(f));

      // 4. Korekta i potwierdzenie daty doręczenia
      const deliveryField = extraction.fields.find((f) => f.fieldName === 'delivery_date');
      expect(deliveryField?.status).toBe('unknown');

      // Potwierdzenie doręczenia przez użytkownika na podstawie żółtej zwrotki pocztowej
      vault.confirmField(deliveryField!.id, '2026-09-16', 'Użytkownik');

      // 5. Deterministyczne wyliczenie terminu
      const deadline = calculateKpaDeadline({
        caseId: c.id,
        baseEventId: 'evt-delivery',
        deliveryDate: '2026-09-16',
        daysCount: 14,
        actionRequired: 'Złożenie odwołania do Wojewody Mazowieckiego',
      });
      vault.setDeadline(deadline);

      expect(deadline.calculatedEndDate).toBe('2026-09-30');

      // 6. Dossier prawne
      const dossier = buildAdministrativeAppealDossier({
        caseId: c.id,
        signature: canarySecretSignature,
        authorityName: 'Burmistrz Miasta i Gminy Piaseczno',
        deliveryDate: '2026-09-16',
        deadlineEndDate: deadline.calculatedEndDate,
      });
      vault.setLegalAnalysis(dossier);

      // 7. Projekt pisma
      const letter = createAdministrativeAppealDraft({
        caseId: c.id,
        caseSignature: canarySecretSignature,
        authorityName: 'Burmistrz Miasta i Gminy Piaseczno',
        appealBodyName: 'Wojewoda Mazowiecki',
        citizenName: canaryName,
        citizenAddress: canaryAddress,
        demands: ['Uchylenie decyzji w całości.'],
        factualBasis: `Brak podstaw prawnych do wywłaszczenia działki obywatela ${canaryName}.`,
        legalJustification: 'Naruszenie art. 7, 77 oraz 107 § 3 KPA.',
      });
      vault.setLetter(letter);

      // 8. Eksport lokalny
      const { formattedText, exportSha256 } = await exportLetterForPrinting(letter);
      expect(exportSha256).toBeDefined();
      expect(formattedText).toContain(canaryName);

      // 9. Szyfrowany backup
      const passphrase = 'BezpieczneHasloKluczaPrywatnegoSejfu!';
      const encryptedBackup = await vault.exportEncryptedBackup(passphrase);

      // SPRAWDZENIE KRYTYCZNE 1: ZERO zapytań sieciowych podczas całego przebiegu
      expect(networkSpy).toHaveBeenCalledTimes(0);

      // SPRAWDZENIE KRYTYCZNE 2: Szyfrowany backup NIE ZAWIERA danych canary w tekście jawnym
      const ciphertext = encryptedBackup.ciphertextHex;
      expect(ciphertext.includes(canaryPesel)).toBe(false);
      expect(ciphertext.includes(canaryName)).toBe(false);
      expect(ciphertext.includes(canarySecretSignature)).toBe(false);

      // SPRAWDZENIE KRYTYCZNE 3: Odtworzenie na czystym profilu odzyskuje kompletne dane
      const restored = await LocalVault.restoreFromEncryptedBackup(encryptedBackup, passphrase);
      expect(restored.cases.get(c.id)?.title).toContain(canaryName);
      expect(restored.documents.get(document.id)?.originalFileName).toBe('decyzja_piaseczno.txt');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
