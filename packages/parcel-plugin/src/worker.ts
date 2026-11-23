import readline from 'node:readline';

import {
  extractCss,
  syncThemeContract,
  type CumuloThemeOptions,
  type ExtractCssRequest,
  type ExtractCssResult,
} from './index.js';

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

interface SyncThemeIpcRequest {
  type: 'syncTheme';
  theme: CumuloThemeOptions;
  projectRoot?: string;
}

interface ExtractIpcRequest {
  type: 'extract';
  request: ExtractCssRequest;
}

type WorkerRequest = SyncThemeIpcRequest | ExtractIpcRequest;

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

function parseRequest(line: string, defaultProjectRoot?: string): WorkerRequest | null {
  const parsed: unknown = JSON.parse(line);
  if (!isRecord(parsed)) {
    return null;
  }

  if (parsed.type === 'syncTheme') {
    if (typeof parsed.css !== 'string' || typeof parsed.out !== 'string') {
      return null;
    }
    return {
      type: 'syncTheme',
      theme: {
        css: parsed.css,
        out: parsed.out,
        includeCustomVars: parsed.includeCustomVars === true,
        baseCss: typeof parsed.baseCss === 'string' ? parsed.baseCss : undefined,
      },
      projectRoot: typeof parsed.projectRoot === 'string' ? parsed.projectRoot : defaultProjectRoot,
    };
  }

  if (typeof parsed.filePath !== 'string') {
    return null;
  }
  return {
    type: 'extract',
    request: {
      filePath: parsed.filePath,
      code: typeof parsed.code === 'string' ? parsed.code : undefined,
      projectRoot: typeof parsed.projectRoot === 'string' ? parsed.projectRoot : defaultProjectRoot,
    },
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
      const parsed = parseRequest(line, defaultProjectRoot);
      if (!parsed) {
        writeResponse({
          css: '',
          dependencies: [],
          warning: 'Invalid extraction request payload',
        });
        continue;
      }

      if (parsed.type === 'syncTheme') {
        await syncThemeContract(parsed.theme, parsed.projectRoot);
        writeResponse({
          css: '',
          dependencies: [],
        });
        continue;
      }

      const result = await extractCss(parsed.request);
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
