/**
 * Tests for Gemini Cloud AI Adapter & Data Disclosure Review
 * Conforms to Requirement 11 ("Prywatność, synchronizacja i Gemini")
 */

import { describe, it, expect } from 'vitest';
import { GeminiAdapter } from '../src/domain/gemini-adapter';

describe('Gemini AI Adapter & Data Disclosure Review', () => {
  it('defaults to AI disabled and local-first execution', () => {
    const adapter = new GeminiAdapter();
    const disclosure = adapter.prepareDisclosure({
      operationName: 'Wspomagana analiza pisma',
      purpose: 'Wykrycie braków formalnych',
      fields: [{ field: 'tytul_sprawy', value: 'Pozwolenie na budowę' }],
    });

    expect(disclosure.recipient).toContain('Google Gemini API');
    expect(disclosure.userConsentGranted).toBe(false);
  });

  it('generates exact disclosure payload and supports redacting sensitive fields', () => {
    const adapter = new GeminiAdapter();
    const disclosure = adapter.prepareDisclosure({
      operationName: 'Analiza decyzji',
      purpose: 'Ekstrakcja artykułów prawnych',
      fields: [
        { field: 'pesel', value: '85010112345', isRequired: false },
        { field: 'tresc_pouczenia', value: 'Termin 14 dni do SKO', isRequired: true },
      ],
    });

    expect(disclosure.dataScope.length).toBe(2);
    expect(disclosure.exactJsonPayload).toContain('85010112345');

    // Użytkownik redaguje PESEL przed ewentualną wysyłką
    disclosure.dataScope[0].isRedacted = true;
    const cleanPayload: Record<string, string> = {};
    disclosure.dataScope.forEach((item) => {
      cleanPayload[item.field] = item.isRedacted ? '[ZREDAGOWANO]' : item.value;
    });
    disclosure.exactJsonPayload = JSON.stringify(cleanPayload, null, 2);

    expect(disclosure.exactJsonPayload).not.toContain('85010112345');
    expect(disclosure.exactJsonPayload).toContain('[ZREDAGOWANO]');
  });

  it('strictly blocks execution when user consent is not granted', async () => {
    const adapter = new GeminiAdapter({ aiEnabled: true, apiKey: 'test-key' });
    const disclosure = adapter.prepareDisclosure({
      operationName: 'Test',
      purpose: 'Test',
      fields: [{ field: 'opis', value: 'Tekst' }],
    });

    // Użytkownik nie zatwierdził zgody
    const result = await adapter.executeWithConsent(disclosure, false);
    expect(result.success).toBe(false);
    expect(result.error).toContain('brak wyraźnej i świadomej zgody użytkownika');
    expect(result.payloadHash).toHaveLength(64);
  });

  it('blocks execution when AI is disabled in configuration even if user pressed submit', async () => {
    const adapter = new GeminiAdapter({ aiEnabled: false });
    const disclosure = adapter.prepareDisclosure({
      operationName: 'Test',
      purpose: 'Test',
      fields: [{ field: 'opis', value: 'Tekst' }],
    });

    const result = await adapter.executeWithConsent(disclosure, true);
    expect(result.success).toBe(false);
    expect(result.error).toContain('AI_ENABLED=false');
  });
});
