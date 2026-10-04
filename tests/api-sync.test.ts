import { describe, it, expect } from 'vitest';
import { GET, POST } from '../src/app/api/sync/route';
import { NextRequest } from 'next/server';
import { SyncRecordPayload } from '../src/domain/sync-engine';

describe('API Route /api/sync (Zero-Knowledge Server Sync & Account Isolation)', () => {
  const dummyPayload: SyncRecordPayload = {
    recordId: 'sync-test-user-a',
    userId: 'user-a',
    clientDeviceId: 'device-test-01',
    encryptedContainer: {
      version: '1.0',
      algorithm: 'AES-GCM-256',
      kdf: 'PBKDF2-SHA-256',
      iterations: 100000,
      ciphertextHex: '0102030405060708',
      ivHex: '0102030405060708090a0b0c',
      saltHex: '0102030405060708090a0b0c0d0e0f10',
      manifestSha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    },
    manifestSha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    version: 1,
    updatedAt: '2026-10-04T12:00:00Z',
  };

  it('zapisuje zaszyfrowany pakiet dla autoryzowanego użytkownika', async () => {
    const postReq = new NextRequest('http://localhost:3000/api/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'user-a',
      },
      body: JSON.stringify(dummyPayload),
    });

    const res = await POST(postReq);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.recordId).toBe('sync-test-user-a');
  });

  it('pozwala użytkownikowi odczytać własny zaszyfrowany rekord', async () => {
    const getReq = new NextRequest('http://localhost:3000/api/sync?recordId=sync-test-user-a', {
      method: 'GET',
      headers: {
        'x-user-id': 'user-a',
      },
    });

    const res = await GET(getReq);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.record.encryptedContainer.ciphertextHex).toBe('0102030405060708');
  });

  it('izoluje konta: użytkownik B otrzymuje odmowę dostępu (403) do rekordu użytkownika A', async () => {
    const getReq = new NextRequest('http://localhost:3000/api/sync?recordId=sync-test-user-a', {
      method: 'GET',
      headers: {
        'x-user-id': 'user-b', // Inny użytkownik
      },
    });

    const res = await GET(getReq);
    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.error).toContain('Odmowa dostępu');
  });

  it('uniemożliwia nadpisanie rekordu użytkownika A przez użytkownika B', async () => {
    const maliciousPayload = {
      ...dummyPayload,
      version: 2,
    };

    const postReq = new NextRequest('http://localhost:3000/api/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'user-b', // Próba ataku podszycia
      },
      body: JSON.stringify(maliciousPayload),
    });

    const res = await POST(postReq);
    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.error).toContain('Odmowa dostępu');
  });
});
