/**
 * Obywatel - Zero-Knowledge E2EE Server Sync Route
 * Next.js Route Handler for storing encrypted sync blobs
 * Conforms to docs/PRIVACY.md and docs/ACCEPTANCE.md Scenarios 10 & 29.
 */

import { NextRequest, NextResponse } from 'next/server';
import { SyncRecordPayload } from '@/domain/sync-engine';

// Pamięć serwerowa szyfrogramów (w produkcji: tabela PostgreSQL)
const serverEncryptedStore: Map<string, SyncRecordPayload> = new Map();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const recordId = searchParams.get('recordId');
  const authenticatedUserId = req.headers.get('x-user-id') || 'citizen-user-01';

  if (!recordId) {
    return NextResponse.json({ success: false, error: 'Brak wymaganego recordId' }, { status: 400 });
  }

  const record = serverEncryptedStore.get(recordId);
  if (!record) {
    return NextResponse.json({ success: false, error: 'Rekord nie istnieje' }, { status: 404 });
  }

  // Weryfikacja izolacji kont (Scenariusz 29: Konto A nie odczyta danych konta B)
  if (record.userId !== authenticatedUserId) {
    return NextResponse.json(
      { success: false, error: 'Odmowa dostępu: brak uprawnień do rekordu innego użytkownika' },
      { status: 403 }
    );
  }

  return NextResponse.json({ success: true, record });
}

export async function POST(req: NextRequest) {
  try {
    const payload = (await req.json()) as SyncRecordPayload;
    const authenticatedUserId = req.headers.get('x-user-id') || 'citizen-user-01';

    if (!payload.recordId || !payload.encryptedContainer) {
      return NextResponse.json(
        { success: false, error: 'Nieprawidłowy pakiet synchronizacyjny (brak szyfrogramu)' },
        { status: 400 }
      );
    }

    // Sprawdzenie czy użytkownik nie próbuje nadpisać rekordu należącego do kogoś innego
    const existing = serverEncryptedStore.get(payload.recordId);
    if (existing && existing.userId !== authenticatedUserId) {
      return NextResponse.json(
        { success: false, error: 'Odmowa dostępu: próba modyfikacji rekordu innego użytkownika' },
        { status: 403 }
      );
    }

    // Bezpieczny zapis szyfrogramu
    payload.userId = authenticatedUserId;
    serverEncryptedStore.set(payload.recordId, payload);

    return NextResponse.json({
      success: true,
      recordId: payload.recordId,
      version: payload.version,
      updatedAt: payload.updatedAt,
      serverMessage: 'Szyfrogram zapisany na serwerze bez znajomości kluczy.',
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Błąd synchronizacji serwerowej' },
      { status: 500 }
    );
  }
}
