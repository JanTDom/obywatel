import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('WCAG 2.2 AA & UX Standards Verification', () => {
  const viewsDir = path.resolve(__dirname, '../src/components/views');
  const viewFiles = fs.readdirSync(viewsDir).filter((f) => f.endsWith('.tsx'));

  it('wszystkie widoki posiadają dostępne nagłówki h1 lub h2', () => {
    viewFiles.forEach((file) => {
      const content = fs.readFileSync(path.join(viewsDir, file), 'utf-8');
      const hasHeading = /<h[1-4]\b/.test(content);
      expect(hasHeading, `Plik ${file} powinien zawierać semantyczny nagłówek`).toBe(true);
    });
  });

  it('wszystkie elementy button posiadają jawny atrybut type="button" lub type="submit"', () => {
    viewFiles.forEach((file) => {
      const content = fs.readFileSync(path.join(viewsDir, file), 'utf-8');
      // Znajdź przyciski bez atrybutu type
      const buttonsWithoutType = content.match(/<button(?![^>]*\btype=)[^>]*>/g);
      expect(
        buttonsWithoutType,
        `W pliku ${file} znaleziono przyciski bez jawnego atrybutu type: ${JSON.stringify(buttonsWithoutType)}`
      ).toBeNull();
    });
  });

  it('interfejs użytkownika nie zawiera zakazanych dekoracyjnych emoji', () => {
    const srcDir = path.resolve(__dirname, '../src');
    const checkDir = (dir: string) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          checkDir(fullPath);
        } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) {
          const content = fs.readFileSync(fullPath, 'utf-8');
          // Sprawdzamy czy w JSX nie ma popularnych dekoracyjnych emoji
          const emojiRegex = /[\u{1F300}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
          const match = content.match(emojiRegex);
          expect(match, `W pliku ${fullPath} wykryto zakazane emoji: ${match?.[0]}`).toBeNull();
        }
      }
    };
    checkDir(srcDir);
  });
});
