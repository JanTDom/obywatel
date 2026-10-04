/**
 * Obywatel - Local Workspace API Bridge
 * Next.js Route Handler for physical disk operations under Moje_sprawy/
 */

import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { LocalDiskManager } from '@/domain/disk-manager';

const DEFAULT_WORKSPACE_PATH = path.join(process.cwd(), 'Moje_sprawy');
const diskManager = new LocalDiskManager(DEFAULT_WORKSPACE_PATH);

export async function GET(req: NextRequest) {
  try {
    await diskManager.initializeWorkspace();
    const scan = await diskManager.scanDiskAndDetectChanges([]);
    return NextResponse.json({
      success: true,
      workspacePath: DEFAULT_WORKSPACE_PATH,
      scan,
      history: diskManager.history,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Błąd skanowania katalogu roboczego' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    await diskManager.initializeWorkspace();

    if (action === 'create_case_folder') {
      const { folderName } = body;
      const caseDir = await diskManager.createCaseFolder(folderName);
      return NextResponse.json({ success: true, caseDir });
    }

    if (action === 'write_file') {
      const { folderName, subfolder, fileName, content } = body;
      const result = await diskManager.writeDocumentFile({
        folderName,
        subfolder,
        fileName,
        content,
      });
      return NextResponse.json({ success: true, ...result });
    }

    if (action === 'move_file') {
      const { sourceRelativePath, destinationRelativePath, description, documentId } = body;
      const historyEntry = await diskManager.moveFile({
        sourceRelativePath,
        destinationRelativePath,
        description,
        documentId,
      });
      return NextResponse.json({ success: true, historyEntry });
    }

    if (action === 'undo') {
      const undone = await diskManager.undoLastOperation();
      return NextResponse.json({ success: true, undone });
    }

    if (action === 'scan') {
      const { knownDocuments = [] } = body;
      const scanResult = await diskManager.scanDiskAndDetectChanges(knownDocuments);
      return NextResponse.json({ success: true, scanResult });
    }

    return NextResponse.json({ success: false, error: 'Nieznana akcja' }, { status: 400 });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Błąd operacji dyskowej' },
      { status: 500 }
    );
  }
}
