import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export function isDirectExecution(metaUrl: string): boolean {
  return (
    process.argv[1] !== undefined && pathToFileURL(path.resolve(process.argv[1])).href === metaUrl
  );
}

export function getCliArg(flag: string): string | undefined {
  const index = process.argv.indexOf(flag);
  if (index !== -1 && process.argv[index + 1]) {
    return path.resolve(process.argv[index + 1]);
  }
  return undefined;
}

export function writeCliOutputFile(outPath: string, content: string): void {
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, content, 'utf-8');
}
