import fs from 'node:fs';
import path from 'node:path';

/**
 * Reads an unbundled source file from `apps/docs/src/` at RSC render time
 * for displaying raw component source in `<ComponentPreview code={...}>`.
 */
export function readSourceFile(relativePath: string): string {
  const candidates = [
    path.resolve(process.cwd(), 'src', relativePath),
    path.resolve(process.cwd(), 'apps/docs/src', relativePath),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return fs.readFileSync(candidate, 'utf-8');
    }
  }

  throw new Error(`Could not locate docs source file "${relativePath}" from "${process.cwd()}"`);
}
