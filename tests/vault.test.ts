/**
 * Unit and Integration tests for Local Document Vault and Cryptography
 * Conforms to docs/ACCEPTANCE.md: "Awaria / czyszczenie profilu: backup odtwarza dokumenty, relacje, wersje i klucze na czystym profilu; hashe zgadzają się."
 */

import { describe, it, expect } from 'vitest';
import { LocalVault } from '../src/domain/vault';
import { computeSha256 } from '../src/domain/crypto';

describe('Local Document Vault & Cryptography', () => {
  it('computes deterministic SHA-256 checksums', async () => {
    const text = 'Pismo urzędowe testowe';
    const hash = await computeSha256(text);
    expect(hash).toHaveLength(64);
    expect(await computeSha256(text)).toBe(hash);
  });

  it('imports document with immutable original bytes and version v1', async () => {
    const vault = new LocalVault('test-vault-1');
    const newCase = vault.createCase({
      title: 'Wniosek o pozwolenie na budowę',
      goalDescription: 'Uzyskanie decyzji',
      procedureType: 'administrative',
      authorityName: 'Prezydent Miasta Stołecznego Warszawy',
      authorityJurisdictionReason: 'Właściwość rzeczowa i miejscowa organu I instancji',
    });

    const sampleContent = 'DECYZJA NR 123/2026 Prezydenta m.st. Warszawy';
    const { document, initialVersion, isDuplicate } = await vault.importDocument({
      caseId: newCase.id,
      type: 'decision',
      direction: 'incoming',
      origin: 'pdf_digital',
      originalFileName: 'decyzja_123_2026.pdf',
      mimeType: 'application/pdf',
      content: sampleContent,
    });

    expect(isDuplicate).toBe(false);
    expect(document.id).toBeDefined();
    expect(initialVersion.versionNumber).toBe(1);
    expect(initialVersion.kind).toBe('original');
    expect(initialVersion.contentSha256).toBe(await computeSha256(sampleContent));

    // Case status advanced to 'analyzing'
    const updatedCase = vault.cases.get(newCase.id);
    expect(updatedCase?.status).toBe('analyzing');
  });

  it('detects exact duplicate by SHA-256 and does not overwrite existing document', async () => {
    const vault = new LocalVault('test-vault-2');
    const c = vault.createCase({
      title: 'Sprawa 1',
      goalDescription: 'Cel',
      procedureType: 'administrative',
      authorityName: 'Starosta',
      authorityJurisdictionReason: 'Właściwość',
    });

    const identicalContent = 'Unikalna treść dokumentu urzędowego 98765';

    const firstImport = await vault.importDocument({
      caseId: c.id,
      type: 'decision',
      direction: 'incoming',
      origin: 'pdf_digital',
      originalFileName: 'dokument_oryginal.pdf',
      mimeType: 'application/pdf',
      content: identicalContent,
    });
    expect(firstImport.isDuplicate).toBe(false);

    const secondImport = await vault.importDocument({
      caseId: c.id,
      type: 'decision',
      direction: 'incoming',
      origin: 'scan',
      originalFileName: 'dokument_kopia.pdf',
      mimeType: 'application/pdf',
      content: identicalContent,
    });
    expect(secondImport.isDuplicate).toBe(true);
    expect(firstImport.document.id).not.toBe(secondImport.document.id);
    expect(firstImport.document.originalSha256).toBe(secondImport.document.originalSha256);
  });

  it('supports version creation for user corrections and drafts', async () => {
    const vault = new LocalVault('test-vault-3');
    const c = vault.createCase({
      title: 'Sprawa odwoławcza',
      goalDescription: 'Odwołanie',
      procedureType: 'administrative',
      authorityName: 'Burmistrz',
      authorityJurisdictionReason: 'Właściwość',
    });

    const { document, initialVersion } = await vault.importDocument({
      caseId: c.id,
      type: 'decision',
      direction: 'incoming',
      origin: 'scan',
      originalFileName: 'skan.pdf',
      mimeType: 'application/pdf',
      content: 'Błędny odczyt OCR: sygnatura WAB/123/26',
    });

    // Użytkownik koryguje OCR
    const correctedVersion = await vault.addDocumentVersion({
      documentId: document.id,
      kind: 'user_corrected',
      textPayload: 'Poprawna sygnatura po weryfikacji ze skanem: WAB.6740.123.2026.JK',
      toolOrAuthor: 'Użytkownik Jan',
      parentVersionId: initialVersion.id,
    });

    expect(correctedVersion.versionNumber).toBe(2);
    expect(correctedVersion.parentVersionId).toBe(initialVersion.id);
    expect(vault.documents.get(document.id)?.activeVersionId).toBe(correctedVersion.id);
  });

  it('exports encrypted backup and cleanly restores it on a fresh vault profile with matching hashes', async () => {
    const originalVault = new LocalVault('vault-backup-source');
    const c = originalVault.createCase({
      title: 'Informacja publiczna o wydatkach',
      goalDescription: 'Dostęp do rejestru umów',
      procedureType: 'public_information',
      authorityName: 'Wójt Gminy',
      authorityJurisdictionReason: 'Właściwość organu wykonawczego gminy',
    });

    const sampleDoc = 'Treść wniosku o informację publiczną z załącznikami.';
    await originalVault.importDocument({
      caseId: c.id,
      type: 'request',
      direction: 'outgoing',
      origin: 'citizen_draft',
      originalFileName: 'wniosek.txt',
      mimeType: 'text/plain',
      content: sampleDoc,
    });

    const passphrase = 'BardzoBezpieczneHasloSejfu2026!';
    const encryptedBackup = await originalVault.exportEncryptedBackup(passphrase);

    expect(encryptedBackup.algorithm).toBe('AES-GCM-256');
    expect(encryptedBackup.kdf).toBe('PBKDF2-SHA-256');
    expect(encryptedBackup.ciphertextHex).toBeDefined();
    expect(encryptedBackup.manifestSha256).toBeDefined();

    // Odtworzenie na całkowicie czystym profilu
    const restoredVault = await LocalVault.restoreFromEncryptedBackup(encryptedBackup, passphrase);

    expect(restoredVault.vaultId).toBe('vault-backup-source');
    expect(restoredVault.cases.size).toBe(1);
    expect(restoredVault.cases.get(c.id)?.title).toBe('Informacja publiczna o wydatkach');
    expect(restoredVault.documents.size).toBe(1);

    const restoredDoc = Array.from(restoredVault.documents.values())[0];
    expect(restoredDoc.originalSha256).toBe(await computeSha256(sampleDoc));
  });

  it('rejects restoration when wrong passphrase is provided', async () => {
    const vault = new LocalVault('vault-wrong-pass');
    vault.createCase({
      title: 'Prywatna sprawa',
      goalDescription: 'Cel',
      procedureType: 'administrative',
      authorityName: 'Organ',
      authorityJurisdictionReason: 'Właściwość',
    });

    const encrypted = await vault.exportEncryptedBackup('PrawidloweHaslo123');

    await expect(
      LocalVault.restoreFromEncryptedBackup(encrypted, 'ZleHaslo999')
    ).rejects.toThrow('Błąd odszyfrowania: nieprawidłowe hasło lub uszkodzony szyfrogram.');
  });
});
