/**
 * Obywatel - End-to-End Encrypted (E2EE) Sync Engine
 * Conforms to docs/PRIVACY.md and docs/ACCEPTANCE.md Scenarios 10, 29, 30:
 * - Server receives only authenticated ciphertext.
 * - Zero knowledge on server: no readable titles, case signatures, OCR or document bytes.
 * - Detects parallel offline edits and preserves conflicts without silent overwrites.
 */

import { computeSha256, encryptVault, decryptVault, EncryptedContainer } from './crypto';
import { VaultManifest } from './types';

export interface SyncRecordPayload {
  recordId: string;
  userId: string;
  clientDeviceId: string;
  encryptedContainer: EncryptedContainer;
  manifestSha256: string;
  version: number;
  updatedAt: string;
}

export interface SyncConflictItem {
  recordId: string;
  localVersion: number;
  serverVersion: number;
  localUpdatedAt: string;
  serverUpdatedAt: string;
  conflictResolution: 'preserve_both' | 'keep_local' | 'accept_server';
}

export class E2EESyncEngine {
  private userId: string;
  private clientDeviceId: string;
  private currentVersion = 1;

  constructor(userId = 'citizen-user-01', clientDeviceId = `device-${Date.now()}`) {
    this.userId = userId;
    this.clientDeviceId = clientDeviceId;
  }

  /**
   * Tworzy szyfrowany pakiet synchronizacyjny dla serwera.
   * Serwer widzi jedynie kryptogram AES-GCM-256 z PBKDF2; nie zna hasła ani klucza.
   */
  public async prepareSyncPayload(
    manifest: VaultManifest,
    userPassphrase: string
  ): Promise<SyncRecordPayload> {
    const rawJson = JSON.stringify(manifest, null, 2);
    const manifestSha256 = await computeSha256(rawJson);
    const encryptedContainer = await encryptVault(rawJson, userPassphrase);
    const now = new Date().toISOString();

    return {
      recordId: `sync-${manifest.vaultId}`,
      userId: this.userId,
      clientDeviceId: this.clientDeviceId,
      encryptedContainer,
      manifestSha256,
      version: this.currentVersion,
      updatedAt: now,
    };
  }

  /**
   * Wykrywa konflikt pomiędzy stanem lokalnym a serwerowym
   * i zapobiega cichemu nadpisaniu dowodów (Scenariusz 30 ACCEPTANCE.md).
   */
  public detectConflict(params: {
    localRecord: SyncRecordPayload;
    serverRecord: SyncRecordPayload;
  }): SyncConflictItem | null {
    if (params.localRecord.manifestSha256 === params.serverRecord.manifestSha256) {
      return null; // Identyczny stan
    }

    if (
      params.serverRecord.version > params.localRecord.version ||
      (params.serverRecord.version === params.localRecord.version &&
        params.serverRecord.clientDeviceId !== params.localRecord.clientDeviceId)
    ) {
      return {
        recordId: params.localRecord.recordId,
        localVersion: params.localRecord.version,
        serverVersion: params.serverRecord.version,
        localUpdatedAt: params.localRecord.updatedAt,
        serverUpdatedAt: params.serverRecord.updatedAt,
        conflictResolution: 'preserve_both',
      };
    }

    return null;
  }

  /**
   * Bezpiecznie odszyfrowuje pakiet synchronizacyjny otrzymany z serwera
   */
  public async decryptSyncPayload(
    payload: SyncRecordPayload,
    userPassphrase: string
  ): Promise<VaultManifest> {
    const decryptedJson = await decryptVault(payload.encryptedContainer, userPassphrase);
    return JSON.parse(decryptedJson) as VaultManifest;
  }
}
