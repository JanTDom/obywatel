/**
 * Obywatel - Electronic Gateway & PURDE (e-Doręczenia / ePUAP) Connector
 * Conforms to Requirement 9 and docs/ACCEPTANCE.md Scenario 27:
 * "Ręczne zgłoszenie wysłania odróżnione od dowodu złożenia i doręczenia;
 * błędne/niedopasowane potwierdzenie nie potwierdza sprawy."
 */

import { computeSha256 } from './crypto';

export interface PurdeAttachmentMetadata {
  fileName: string;
  fileSizeBytes: number;
  sha256: string;
  mimeType: string;
}

export interface PurdeDispatchEnvelope {
  envelopeId: string;
  senderAdeAddress: string;
  senderName: string;
  recipientAdeAddress: string;
  recipientName: string;
  caseSignature: string;
  subject: string;
  dispatchTimestamp: string;
  attachments: PurdeAttachmentMetadata[];
  xmlPayload: string;
  envelopeSha256: string;
}

export interface UpoValidationResult {
  isValid: boolean;
  deliveryTimestamp?: string;
  deliveryDate?: string;
  recipientConfirmationName?: string;
  referenceNumber?: string;
  matchedAttachmentSha256?: string;
  isDocumentHashMatching: boolean;
  errors: string[];
}

export class ElectronicGatewayConnector {
  /**
   * Generuje ustrukturyzowaną kopertę metadanych PURDE (e-Doręczenia) w standardzie XML
   */
  public async createPurdeEnvelope(params: {
    senderAdeAddress?: string;
    senderName: string;
    recipientAdeAddress: string;
    recipientName: string;
    caseSignature: string;
    subject: string;
    attachments: { fileName: string; content: string; mimeType: string }[];
  }): Promise<PurdeDispatchEnvelope> {
    const envelopeId = `purde-env-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();
    const senderAde = params.senderAdeAddress || 'AE:PL-88123-45678-ABCDE-01';

    const attachmentMetas: PurdeAttachmentMetadata[] = [];
    for (const att of params.attachments) {
      const hash = await computeSha256(att.content);
      attachmentMetas.push({
        fileName: att.fileName,
        fileSizeBytes: new TextEncoder().encode(att.content).length,
        sha256: hash,
        mimeType: att.mimeType,
      });
    }

    const xmlPayload = `<?xml version="1.0" encoding="UTF-8"?>
<PurdePrzesylka xmlns="http://drr.gov.pl/purde/2026/01" id="${envelopeId}">
  <Naglowek>
    <Nadawca ADE="${senderAde}">${params.senderName}</Nadawca>
    <Adresat ADE="${params.recipientAdeAddress}">${params.recipientName}</Adresat>
    <ZnakSprawy>${params.caseSignature}</ZnakSprawy>
    <Tytul>${params.subject}</Tytul>
    <DataNadania>${now}</DataNadania>
  </Naglowek>
  <Zalaczniki>
${attachmentMetas
  .map(
    (a) => `    <Dokument Nazwa="${a.fileName}" RozmiarB="${a.fileSizeBytes}" SkrotSHA256="${a.sha256}" Format="${a.mimeType}"/>`
  )
  .join('\n')}
  </Zalaczniki>
</PurdePrzesylka>`;

    const envelopeSha256 = await computeSha256(xmlPayload);

    return {
      envelopeId,
      senderAdeAddress: senderAde,
      senderName: params.senderName,
      recipientAdeAddress: params.recipientAdeAddress,
      recipientName: params.recipientName,
      caseSignature: params.caseSignature,
      subject: params.subject,
      dispatchTimestamp: now,
      attachments: attachmentMetas,
      xmlPayload,
      envelopeSha256,
    };
  }

  /**
   * Weryfikuje strukturę i sumy kontrolne Urzędowego Poświadczenia Odbioru (UPO/UPD)
   * i zapobiega uznaniu niedopasowanego potwierdzenia jako dowodu w sprawie.
   */
  public async validateUpoDocument(params: {
    upoContent: string;
    expectedDocumentSha256?: string;
  }): Promise<UpoValidationResult> {
    const errors: string[] = [];
    const text = params.upoContent;

    // 1. Sprawdzanie czy dokument to rzeczywiście poświadczenie odbioru
    const isUpoFormat =
      text.includes('Urzędowe Poświadczenie Odbioru') ||
      text.includes('Poświadczenie Przedłożenia') ||
      text.includes('UPO') ||
      text.includes('UPD') ||
      text.includes('PurdePoświadczenie');

    if (!isUpoFormat) {
      errors.push('Przedłożony plik nie zawiera cech Urzędowego Poświadczenia Odbioru (UPO/UPD).');
    }

    // 2. Ekstrakcja sygnatury / numeru referencyjnego
    const refMatch = text.match(/(?:IdentyfikatorPoświadczenia|NumerNadania|Znak|Id)[:=\s]+([^\n,<>]+)/i);
    const referenceNumber = refMatch ? refMatch[1].trim() : undefined;

    // 3. Ekstrakcja daty doręczenia
    const dateMatch = text.match(/\b(20\d{2}-\d{2}-\d{2}(?:[T\s]\d{2}:\d{2}:\d{2}(?:\.\d+)?Z?)?)/);
    const deliveryTimestamp = dateMatch ? dateMatch[1] : undefined;
    const deliveryDate = deliveryTimestamp ? deliveryTimestamp.slice(0, 10) : undefined;

    if (!deliveryDate) {
      errors.push('W poświadczeniu nie odnaleziono jednoznacznego znacznika daty doręczenia.');
    }

    // 4. Weryfikacja sumy kontrolnej SHA-256 dokumentu źródłowego
    let isDocumentHashMatching = false;
    let matchedAttachmentSha256: string | undefined = undefined;

    if (params.expectedDocumentSha256) {
      if (text.includes(params.expectedDocumentSha256)) {
        isDocumentHashMatching = true;
        matchedAttachmentSha256 = params.expectedDocumentSha256;
      } else {
        errors.push(
          'Suma kontrolna wysłanego pisma nie odpowiada skrótowi poświadczonemu w UPO. To potwierdzenie dotyczy innego dokumentu.'
        );
      }
    } else {
      isDocumentHashMatching = true;
    }

    return {
      isValid: errors.length === 0,
      deliveryTimestamp,
      deliveryDate,
      referenceNumber,
      matchedAttachmentSha256,
      isDocumentHashMatching,
      errors,
    };
  }

  /**
   * Waliduje numer przesyłki rejestrowanej Poczty Polskiej (format 20 cyfr)
   */
  public validatePostalTrackingNumber(trackingNumber: string): { isValid: boolean; normalized: string; warning?: string } {
    const clean = trackingNumber.replace(/[^0-9]/g, '');
    if (clean.length === 20) {
      return { isValid: true, normalized: clean };
    }
    return {
      isValid: false,
      normalized: clean,
      warning: `Numer nadania przesyłki poleconej Poczty Polskiej powinien zawierać dokładnie 20 cyfr (wprowadzono: ${clean.length}).`,
    };
  }
}
