import { describe, it, expect } from 'vitest';
import { LocalRedactionEngine } from '../src/domain/redaction-engine';

describe('LocalRedactionEngine (Social Publication Redaction)', () => {
  const engine = new LocalRedactionEngine();

  const originalText = `Wnioskodawca Jan Kowalski, PESEL 85031212345, NIP 525-234-45-12, zamieszkały ul. Marszałkowska 10/12, 00-001 Warszawa.
Tel. 500-600-700, e-mail: jan.kowalski@przyklad.pl.
Konto bankowe: PL12345678901234567890123456.
Sprawa dotyczy naruszenia norm środowiskowych przez Zakład Przemysłowy sp. z o.o.`;

  it('nieodwracalnie usuwa numery PESEL, NIP, adresy, kontakty oraz rachunki bankowe', async () => {
    const publication = await engine.createRedactedPublicationCopy({
      sourceDocumentId: 'doc-redact-01',
      sourceFileName: 'decyzja.pdf',
      textContent: originalText,
      customEntitiesToRedact: ['Jan Kowalski'],
      publisherNote: 'Publikacja w interesie społecznym mieszkańców Warszawy',
    });

    // Sprawdzenie anonimizacji
    expect(publication.redactedContent).not.toContain('85031212345');
    expect(publication.redactedContent).toContain('[ZREDAGOWANO - PESEL]');

    expect(publication.redactedContent).not.toContain('525-234-45-12');
    expect(publication.redactedContent).toContain('[ZREDAGOWANO - NIP]');

    expect(publication.redactedContent).not.toContain('00-001 Warszawa');
    expect(publication.redactedContent).toContain('[ZREDAGOWANO - KOD I MIEJSCOWOŚĆ]');

    expect(publication.redactedContent).not.toContain('ul. Marszałkowska 10/12');
    expect(publication.redactedContent).toContain('[ZREDAGOWANO - ULICA I ADRES]');

    expect(publication.redactedContent).not.toContain('jan.kowalski@przyklad.pl');
    expect(publication.redactedContent).toContain('[ZREDAGOWANO - KONTAKT]');

    expect(publication.redactedContent).not.toContain('PL12345678901234567890123456');
    expect(publication.redactedContent).toContain('[ZREDAGOWANO - RACHUNEK BANKOWY]');

    expect(publication.redactedContent).not.toContain('Jan Kowalski');
    expect(publication.redactedContent).toContain('[ZREDAGOWANO - DANE OSOBOWE]');

    // Merytoryczna treść sprawy pozostaje zachowana
    expect(publication.redactedContent).toContain('Zakład Przemysłowy sp. z o.o.');
    expect(publication.redactedContent).toContain('naruszenia norm środowiskowych');
    expect(publication.metadataStripped).toBe(true);
    expect(publication.removedSensitiveEntitiesCount).toBeGreaterThan(0);
  });

  it('generuje oddzielny skrót SHA-256 dla wersji publicznej i zachowuje powiązanie z oryginałem', async () => {
    const publication = await engine.createRedactedPublicationCopy({
      sourceDocumentId: 'doc-redact-01',
      sourceFileName: 'decyzja.pdf',
      textContent: originalText,
    });

    expect(publication.sourceDocumentId).toBe('doc-redact-01');
    expect(publication.originalSha256).toHaveLength(64);
    expect(publication.redactedSha256).toHaveLength(64);
    expect(publication.redactedSha256).not.toBe(publication.originalSha256);
  });
});
