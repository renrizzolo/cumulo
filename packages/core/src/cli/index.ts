#!/usr/bin/env node
import { parseArgs } from 'node:util';

import { handleGenerateTheme } from './commands/generateTheme.js';

export {
  generateTheme,
  runThemeGeneration,
  extractBreakpointsFromVars,
  type GeneratedThemeResult,
  type GenerateThemeOptions,
} from './themeGenerator.js';

const USAGE = `
Cumulo CLI

Usage:
  npx @cumulo/core <command> [options]

Commands:
  generate-theme     Generate TypeScript theme contract & tokens from CSS

Options for generate-theme:
  --css <path>       Path to custom CSS file (e.g. './src/styles.css') containing theme overrides
  --out <path>       Output path (e.g. './src/vars.ts') for generated standalone TypeScript contract file (required)
  --include-custom   Include custom CSS variables not defined in Cumulo's default theme.css
  --base-css <path>  Path to base canonical theme.css (defaults to Cumulo default theme.css)
  --silent           Suppress informational output
  -h, --help         Show this help message
  -v, --version      Show CLI version
`;

export async function runCli(argv = process.argv.slice(2)): Promise<void> {
  try {
    const { values, positionals } = parseArgs({
      args: argv,
      options: {
        css: { type: 'string' },
        out: { type: 'string' },
        'include-custom': { type: 'boolean', default: false },
        'base-css': { type: 'string' },
        silent: { type: 'boolean', default: false },
        help: { type: 'boolean', short: 'h', default: false },
        version: { type: 'boolean', short: 'v', default: false },
      },
      allowPositionals: true,
      strict: false,
    });

    if (values.help || (positionals.length === 0 && !values.version)) {
      console.log(USAGE);
      return;
    }

    if (values.version) {
      console.log('0.1.0');
      return;
    }

    const command = positionals[0];

    switch (command) {
      case 'generate-theme': {
        await handleGenerateTheme({
          css: typeof values.css === 'string' ? values.css : undefined,
          out: typeof values.out === 'string' ? values.out : undefined,
          'include-custom': Boolean(values['include-custom']),
          'base-css': typeof values['base-css'] === 'string' ? values['base-css'] : undefined,
          silent: Boolean(values.silent),
        });
        break;
      }

      default: {
        console.error(`[cumulo] Unknown command: "${command}"\n`);
        console.log(USAGE);
        process.exitCode = 1;
        break;
      }
    }
  } catch (err) {
    console.error(`[cumulo] Error: ${err instanceof Error ? err.message : String(err)}`);
    process.exitCode = 1;
  }
}

// Direct execution detection
if (process.argv[1]) {
  const normalized = process.argv[1].replace(/\\/g, '/');
  if (
    normalized.endsWith('cli/index.ts') ||
    normalized.endsWith('cli/index.mjs') ||
    normalized.endsWith('dist/cli/index.mjs') ||
    normalized.endsWith('bin/cumulo.mjs')
  ) {
    void runCli();
  }
}
