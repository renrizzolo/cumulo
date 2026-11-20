import readline from 'node:readline';
import { extractCss, type ExtractCssRequest, type ExtractCssResult } from './index.js';

const IPC_PREFIX = '__CUMULO_PARCEL_IPC__';

// Route any user-module console output away from stdout so the IPC protocol stays clean.
console.log = (...args: unknown[]): void => {
  console.error(...args);
};
console.info = (...args: unknown[]): void => {
  console.error(...args);
};
console.debug = (...args: unknown[]): void => {
  console.error(...args);
};

function parseProjectRootArg(argv: string[]): string | undefined {
  const idx = argv.indexOf('--project-root');
  if (idx !== -1 && idx + 1 < argv.length) {
    return argv[idx + 1];
  }
  return undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function parseRequest(line: string, defaultProjectRoot?: string): ExtractCssRequest | null {
  const parsed: unknown = JSON.parse(line);
  if (!isRecord(parsed) || typeof parsed.filePath !== 'string') {
    return null;
  }
  return {
    filePath: parsed.filePath,
    code: typeof parsed.code === 'string' ? parsed.code : undefined,
    projectRoot: typeof parsed.projectRoot === 'string' ? parsed.projectRoot : defaultProjectRoot,
  };
}

function writeResponse(result: ExtractCssResult): void {
  process.stdout.write(`\n${IPC_PREFIX}${JSON.stringify(result)}\n`);
}

async function main(): Promise<void> {
  const defaultProjectRoot = parseProjectRootArg(process.argv.slice(2));
  const rl = readline.createInterface({
    input: process.stdin,
    crlfDelay: Infinity,
  });

  for await (const rawLine of rl) {
    const line = rawLine.trim();
    if (!line) {
      continue;
    }

    try {
      const request = parseRequest(line, defaultProjectRoot);
      if (!request) {
        writeResponse({
          css: '',
          dependencies: [],
          warning: 'Invalid extraction request payload',
        });
        continue;
      }

      const result = await extractCss(request);
      writeResponse(result);
    } catch (err: unknown) {
      const message = err instanceof Error ? (err.stack ?? err.message) : String(err);
      writeResponse({
        css: '',
        dependencies: [],
        warning: `Worker error: ${message}`,
      });
    }
  }
}

void main();
