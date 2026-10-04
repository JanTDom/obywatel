/**
 * Obywatel - Citizen Letter Drafting Engine
 * Conforms to docs/DATA_MODEL.md, docs/PRODUCT.md, and .agents/skills/draft-citizen-letter/SKILL.md
 *
 * Invariants:
 * - Letters are drafts for review. No auto-submission or auto-sending.
 * - Clear distinction between citizen statements, documented facts, and legal grounds.
 * - Pre-submission checklist ensuring compliance before physical/electronic mailing.
 * - Export generates a reproducible snapshot with SHA-256 hash.
 */

import { computeSha256 } from './crypto';
import { LetterDraft, LetterChecklistItem } from './types';

export interface CreateLetterDraftInput {
  caseId: string;
  caseSignature: string;
  authorityName: string;
  appealBodyName?: string;
  citizenName?: string;
  citizenAddress?: string;
  demands: string[];
  factualBasis: string;
  legalJustification: string;
  attachments?: { id: string; title: string; documentId?: string; included: boolean }[];
}

export function createAdministrativeAppealDraft(input: CreateLetterDraftInput): LetterDraft {
  const {
    caseId,
    caseSignature,
    authorityName,
    appealBodyName = 'Samorządowe Kolegium Odwoławcze',
    citizenName = '[Imię i Nazwisko / Nazwa Wnioskodawcy]',
    citizenAddress = '[Adres do korespondencji / Adres e-Doręczeń]',
    demands,
    factualBasis,
    legalJustification,
    attachments = [],
  } = input;

  const checklist: LetterChecklistItem[] = [
    {
      id: 'chk-authority',
      item: 'Prawidłowy adresat i organ pośredniczący',
      checked: false,
      isMandatory: true,
      verificationDetail: `Pismo kierowane do: ${appealBodyName}, składane za pośrednictwem: ${authorityName}.`,
    },
    {
      id: 'chk-signature',
      item: 'Znak zaskarżanej decyzji',
      checked: Boolean(caseSignature),
      isMandatory: true,
      verificationDetail: `Wskazano znak sprawy: ${caseSignature || 'BRAK (wymagane uzupełnienie)'}.`,
    },
    {
      id: 'chk-demands',
      item: 'Zakres żądania odwołania',
      checked: demands.length > 0,
      isMandatory: true,
      verificationDetail: 'Sformułowano żądanie uchylenia lub zmiany zaskarżonej decyzji.',
    },
    {
      id: 'chk-deadline',
      item: 'Zachowanie 14-dniowego terminu',
      checked: false,
      isMandatory: true,
      verificationDetail: 'Sprawdzono datę doręczenia decyzji i wyliczony termin końcowy.',
    },
    {
      id: 'chk-attachments',
      item: 'Kompletność załączników',
      checked: false,
      isMandatory: true,
      verificationDetail: 'Załączono dowody powołane w uzasadnieniu (oraz ewentualne pełnomocnictwo).',
    },
    {
      id: 'chk-hand-signed',
      item: 'Własnoręczny podpis lub podpis elektroniczny',
      checked: false,
      isMandatory: true,
      verificationDetail: 'Pismo musi zostać podpisane (odręcznie lub podpisem zaufanym/kwalifikowanym).',
    },
  ];

  return {
    id: `letter-${caseId}-${Date.now()}`,
    caseId,
    title: `Odwołanie od decyzji z dnia (${caseSignature || 'znak nieznany'})`,
    letterType: 'odwolanie',
    recipient: {
      name: appealBodyName,
      addressOrChannel: `za pośrednictwem: ${authorityName}`,
      intermediaryAuthority: authorityName,
    },
    sender: {
      placeholderName: citizenName,
      contactChannel: citizenAddress,
    },
    caseSignature,
    demands,
    factualBasis,
    legalJustification,
    attachments,
    status: 'draft',
    checklist,
  };
}

export function formatLetterPlainText(letter: LetterDraft): string {
  const lines: string[] = [];

  lines.push('Miejscowość, data: ....................... r.');
  lines.push('');
  lines.push('Wnoszący odwołanie:');
  lines.push(letter.sender.placeholderName);
  lines.push(letter.sender.contactChannel);
  lines.push('');
  lines.push('Do:');
  lines.push(letter.recipient.name);
  if (letter.recipient.intermediaryAuthority) {
    lines.push(`za pośrednictwem: ${letter.recipient.intermediaryAuthority}`);
  }
  lines.push('');
  lines.push(`Dotyczy sprawy znak: ${letter.caseSignature || '[UZUPEŁNIJ ZNAK DECYZJI]'}`);
  lines.push('');
  lines.push('                                ODWOŁANIE');
  lines.push('                   od decyzji administracyjnej');
  lines.push('');
  lines.push('Działając w imieniu własnym, na podstawie art. 127 § 1 i 2 w zw. z art. 129 § 1 i 2');
  lines.push('ustawy z dnia 14 czerwca 1960 r. - Kodeks postępowania administracyjnego,');
  lines.push(`niniejszym wnoszę odwołanie od decyzji ${letter.recipient.intermediaryAuthority || 'organu pierwszej instancji'}`);
  lines.push(`z dnia ....................... r., znak: ${letter.caseSignature || '.......................'}.`);
  lines.push('');
  lines.push('Zaskarżonej decyzji zarzucam:');
  lines.push(letter.factualBasis || '[Wskaż zarzuty i stan faktyczny]');
  lines.push('');
  lines.push('Mając na uwadze powyższe, wnoszę o:');
  letter.demands.forEach((d, idx) => {
    lines.push(`${idx + 1}. ${d}`);
  });
  lines.push('');
  lines.push('                               UZASADNIENIE');
  lines.push('');
  lines.push(letter.legalJustification || '[Uzasadnienie odwołania]');
  lines.push('');
  lines.push('Załączniki:');
  if (letter.attachments.length === 0) {
    lines.push('1. Kopia zaskarżanej decyzji');
  } else {
    letter.attachments.forEach((att, idx) => {
      lines.push(`${idx + 1}. ${att.title}`);
    });
  }
  lines.push('');
  lines.push('                                ............................................');
  lines.push('                                            (własnoręczny podpis)');

  return lines.join('\n');
}

export async function exportLetterForPrinting(letter: LetterDraft): Promise<{
  formattedText: string;
  exportSha256: string;
}> {
  const formattedText = formatLetterPlainText(letter);
  const exportSha256 = await computeSha256(formattedText);
  return { formattedText, exportSha256 };
}
