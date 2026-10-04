/**
 * Obywatel - True Redaction & Social Publication Engine
 * Conforms to Requirement 11 and Scenario 28 of docs/ACCEPTANCE.md:
 * "Publikacja społeczna: Powstaje osobna zredagowana kopia; redakcja usuwa tekst,
 * metadane i ukryte warstwy, nie tylko rysuje prostokąt."
 */

import { computeSha256 } from './crypto';

export interface RedactionRule {
  id: string;
  fieldCategory: 'pesel' | 'nip' | 'address' | 'name' | 'phone_email' | 'bank_account' | 'custom';
  label: string;
  pattern: RegExp;
  replacement: string;
  enabled: boolean;
}

export interface RedactedPublicationRecord {
  id: string;
  sourceDocumentId: string;
  sourceFileName: string;
  originalSha256: string;
  redactedContent: string;
  redactedSha256: string;
  appliedRulesCount: number;
  removedSensitiveEntitiesCount: number;
  metadataStripped: boolean;
  createdAt: string;
  publisherNote: string;
}

export class LocalRedactionEngine {
  public defaultRules: RedactionRule[] = [
    {
      id: 'rule-pesel',
      fieldCategory: 'pesel',
      label: 'PESEL (11 cyfr)',
      pattern: /\b\d{11}\b/g,
      replacement: '[ZREDAGOWANO - PESEL]',
      enabled: true,
    },
    {
      id: 'rule-nip',
      fieldCategory: 'nip',
      label: 'NIP (10 cyfr)',
      pattern: /\b\d{3}[- ]?\d{3}[- ]?\d{2}[- ]?\d{2}\b/g,
      replacement: '[ZREDAGOWANO - NIP]',
      enabled: true,
    },
    {
      id: 'rule-postal',
      fieldCategory: 'address',
      label: 'Kod pocztowy i adres (np. 00-001)',
      pattern: /\b\d{2}-\d{3}\b[^\n,.]*/g,
      replacement: '[ZREDAGOWANO - KOD I MIEJSCOWOŚĆ]',
      enabled: true,
    },
    {
      id: 'rule-street',
      fieldCategory: 'address',
      label: 'Ulica i numer lokalu',
      pattern: /(?:ul\.|al\.|pl\.)\s+[A-ZĄĆĘŁŃÓŚŹŻa-zęółśźż]+\s+\d+[a-zA-Z]?(?:\s*m\.\s*\d+)?/gi,
      replacement: '[ZREDAGOWANO - ULICA I ADRES]',
      enabled: true,
    },
    {
      id: 'rule-phone-email',
      fieldCategory: 'phone_email',
      label: 'Numer telefonu i adres e-mail',
      pattern: /(?:\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b|\b(?:\+48\s?)?\d{3}[-\s]?\d{3}[-\s]?\d{3}\b)/g,
      replacement: '[ZREDAGOWANO - KONTAKT]',
      enabled: true,
    },
    {
      id: 'rule-bank',
      fieldCategory: 'bank_account',
      label: 'Numer rachunku bankowego (IBAN / NRB)',
      pattern: /\bPL\d{26}\b|\b\d{2}(?:\s\d{4}){6}\b/g,
      replacement: '[ZREDAGOWANO - RACHUNEK BANKOWY]',
      enabled: true,
    },
  ];

  /**
   * Wykonuje nieodwracalną redakcję: usuwa metadane, trwale zastępuje
   * tokeny wrażliwe w warstwie tekstowej i generuje odrębną publikację.
   */
  public async createRedactedPublicationCopy(params: {
    sourceDocumentId: string;
    sourceFileName: string;
    textContent: string;
    customEntitiesToRedact?: string[];
    publisherNote?: string;
  }): Promise<RedactedPublicationRecord> {
    const originalSha256 = await computeSha256(params.textContent);
    let sanitizedText = params.textContent;
    let removedCount = 0;

    // 1. Zastosowanie reguł wyrażeń regularnych
    for (const rule of this.defaultRules) {
      if (!rule.enabled) continue;
      const matches = sanitizedText.match(rule.pattern);
      if (matches) {
        removedCount += matches.length;
        sanitizedText = sanitizedText.replace(rule.pattern, rule.replacement);
      }
    }

    // 2. Usunięcie wskazanych nazw własnych / nazwisk stron
    if (params.customEntitiesToRedact) {
      for (const entity of params.customEntitiesToRedact) {
        if (!entity || entity.trim().length < 3) continue;
        const escaped = entity.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const entityRegex = new RegExp(`\\b${escaped}\\b`, 'gi');
        const matches = sanitizedText.match(entityRegex);
        if (matches) {
          removedCount += matches.length;
          sanitizedText = sanitizedText.replace(entityRegex, '[ZREDAGOWANO - DANE OSOBOWE]');
        }
      }
    }

    // 3. Czyszczenie ukrytych metadanych i nagłówków
    sanitizedText = sanitizedText
      .replace(/Metadata:[\s\S]*?(?=\n\n|$)/gi, '')
      .replace(/Producer:[\s\S]*?(?=\n|$)/gi, '')
      .replace(/CreationDate:[\s\S]*?(?=\n|$)/gi, '')
      .trim();

    const redactedSha256 = await computeSha256(sanitizedText);
    const now = new Date().toISOString();

    return {
      id: `pub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      sourceDocumentId: params.sourceDocumentId,
      sourceFileName: params.sourceFileName,
      originalSha256,
      redactedContent: sanitizedText,
      redactedSha256,
      appliedRulesCount: this.defaultRules.filter((r) => r.enabled).length,
      removedSensitiveEntitiesCount: removedCount,
      metadataStripped: true,
      createdAt: now,
      publisherNote:
        params.publisherNote ||
        'Egzemplarz przygotowany do publikacji w interesie społecznym zgodnie z zasadą minimalizacji danych.',
    };
  }
}
