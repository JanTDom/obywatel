import { describe, it, expect } from 'vitest';
import { ElectronicGatewayConnector } from '../src/domain/electronic-gateway';

describe('ElectronicGatewayConnector (PURDE e-Doręczenia & UPO)', () => {
  const gateway = new ElectronicGatewayConnector();

  it('generuje ustrukturyzowany pakiet nadawczy XML dla węzła PURDE e-Doręczenia', async () => {
    const envelope = await gateway.createPurdeEnvelope({
      senderAdeAddress: 'AE:PL-12345-67890-ABCDE-12',
      senderName: 'Janina Obywatelska',
      recipientAdeAddress: 'AE:PL-99999-00000-URZAD-99',
      recipientName: 'Samorządowe Kolegium Odwoławcze w Warszawie',
      caseSignature: 'WAB.6740.1.2026.JK',
      subject: 'Odwołanie od decyzji architektoniczno-budowlanej',
      attachments: [
        {
          fileName: 'odwolanie.pdf',
          content: 'Treść odwołania od decyzji Prezydenta m.st. Warszawy',
          mimeType: 'application/pdf',
        },
      ],
    });

    expect(envelope.envelopeId).toContain('purde-env-');
    expect(envelope.xmlPayload).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(envelope.xmlPayload).toContain('<PurdePrzesylka');
    expect(envelope.xmlPayload).toContain('AE:PL-12345-67890-ABCDE-12');
    expect(envelope.xmlPayload).toContain('AE:PL-99999-00000-URZAD-99');
    expect(envelope.xmlPayload).toContain('WAB.6740.1.2026.JK');
    expect(envelope.attachments.length).toBe(1);
    expect(envelope.attachments[0].sha256).toHaveLength(64);
  });

  it('weryfikuje urzędowe poświadczenie odbioru (UPO/UPD) po skrócie SHA-256', async () => {
    const expectedHash = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
    const validUpoText = `
      Urzędowe Poświadczenie Odbioru (UPO)
      IdentyfikatorPoświadczenia: UPO-2026-WAW-881293
      DataDoręczenia: 2026-10-04T14:30:00Z
      Skrót dokumentu: ${expectedHash}
      Wystawca: Ministerstwo Cyfryzacji - Węzeł PURDE
    `;

    const validation = await gateway.validateUpoDocument({
      upoContent: validUpoText,
      expectedDocumentSha256: expectedHash,
    });

    expect(validation.isValid).toBe(true);
    expect(validation.isDocumentHashMatching).toBe(true);
    expect(validation.deliveryDate).toBe('2026-10-04');
    expect(validation.errors.length).toBe(0);
  });

  it('odrzuca sfałszowane lub niedopasowane UPO z innym skrótem dokumentu', async () => {
    const expectedHash = '1111111111111111111111111111111111111111111111111111111111111111';
    const mismatchUpoText = `
      Urzędowe Poświadczenie Odbioru (UPO)
      IdentyfikatorPoświadczenia: UPO-INNY-DOKUMENT
      DataDoręczenia: 2026-10-04T14:30:00Z
      Skrót dokumentu: 9999999999999999999999999999999999999999999999999999999999999999
    `;

    const validation = await gateway.validateUpoDocument({
      upoContent: mismatchUpoText,
      expectedDocumentSha256: expectedHash,
    });

    expect(validation.isValid).toBe(false);
    expect(validation.isDocumentHashMatching).toBe(false);
    expect(validation.errors.some((err) => err.includes('To potwierdzenie dotyczy innego dokumentu'))).toBe(true);
  });

  it('weryfikuje 20-cyfrowy numer nadawczy przesyłki poleconej Poczty Polskiej', () => {
    const validNumber = '00359007733456789012';
    const invalidNumber = '12345';

    expect(gateway.validatePostalTrackingNumber(validNumber).isValid).toBe(true);
    expect(gateway.validatePostalTrackingNumber(invalidNumber).isValid).toBe(false);
    expect(gateway.validatePostalTrackingNumber(invalidNumber).warning).toBeDefined();
  });
});
