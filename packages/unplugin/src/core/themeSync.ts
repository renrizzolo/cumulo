import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import type { BreakpointMap, BreakpointQuery } from '@cumulo/css';

import type { CumuloPluginOptions, CumuloThemeOptions } from '../types.js';

export interface SyncThemeResult {
  cssPath: string;
  outPath: string;
  written: boolean;
  breakpoints?: BreakpointMap;
}

interface CoreCliModule {
  runThemeGeneration: (options: {
    customCssPath?: string;
    outPath?: string;
    baseCssPath?: string;
    includeCustomVars?: boolean;
    silent?: boolean;
  }) => Promise<boolean>;
  generateTheme?: (options: {
    customCssPath?: string;
    baseCssPath?: string;
    includeCustomVars?: boolean;
    silent?: boolean;
  }) => Promise<{ breakpoints?: Record<string, BreakpointQuery> }>;
}

function isCoreCliModule(value: unknown): value is CoreCliModule {
  return (
    typeof value === 'object' &&
    value !== null &&
    'runThemeGeneration' in value &&
    typeof value.runThemeGeneration === 'function'
  );
}

function readFileStamp(filePath: string): string {
  try {
    const stat = fs.statSync(filePath);
    return `${stat.mtimeMs}:${stat.size}`;
  } catch {
    return 'missing';
  }
}

function resolveCoreCliPath(projectRoot: string): string | undefined {
  const candidates: string[] = [
    path.join(projectRoot, 'package.json'),
    path.join(process.cwd(), 'package.json'),
  ];

  for (const pkgPath of candidates) {
    try {
      const req = createRequire(pkgPath);
      return req.resolve('@cumulo/core/cli');
    } catch {
      // Try next resolution candidate
    }
  }
  return undefined;
}

async function loadCoreCli(projectRoot: string): Promise<CoreCliModule> {
  const resolved = resolveCoreCliPath(projectRoot);
  if (resolved) {
    const loaded: unknown = await import(pathToFileURL(resolved).href);
    if (isCoreCliModule(loaded)) {
      return loaded;
    }
  }

  try {
    const specifier = ['@cumulo/core', 'cli'].join('/');
    const loaded: unknown = await import(specifier);
    if (isCoreCliModule(loaded)) {
      return loaded;
    }
  } catch {
    // Fall through to error
  }

  throw new Error(
    '[@cumulo/unplugin] Could not resolve "@cumulo/core/cli" for automatic theme sync. Ensure "@cumulo/core" is installed.',
  );
}

const lastSyncedStampByOut = new Map<string, string>();
const lastSyncedBreakpointsByOut = new Map<string, BreakpointMap | undefined>();
const inFlightByOut = new Map<string, Promise<SyncThemeResult>>();

/**
 * Synchronizes a standalone generated `vars` contract file from a custom CSS stylesheet.
 * Uses mtime/size stamping and content diffing so unchanged stylesheets incur negligible
 * overhead and never trigger redundant watch-mode rebuild loops.
 */
export function syncThemeContract(
  theme: CumuloThemeOptions,
  projectRoot: string = process.cwd(),
): Promise<SyncThemeResult> {
  const root = path.resolve(projectRoot);
  const cssPath = path.resolve(root, theme.css);
  const outPath = path.resolve(root, theme.out);
  const baseCssPath = theme.baseCss ? path.resolve(root, theme.baseCss) : undefined;
  const includeCustomVars = Boolean(theme.includeCustomVars);

  const stamp = [
    cssPath,
    readFileStamp(cssPath),
    baseCssPath ?? '',
    baseCssPath ? readFileStamp(baseCssPath) : '',
    String(includeCustomVars),
  ].join('|');

  if (lastSyncedStampByOut.get(outPath) === stamp && fs.existsSync(outPath)) {
    return Promise.resolve({
      cssPath,
      outPath,
      written: false,
      breakpoints: lastSyncedBreakpointsByOut.get(outPath),
    });
  }

  const existing = inFlightByOut.get(outPath);
  if (existing) {
    return existing;
  }

  const task = (async (): Promise<SyncThemeResult> => {
    const cli = await loadCoreCli(root);
    const written = await cli.runThemeGeneration({
      customCssPath: cssPath,
      outPath,
      baseCssPath,
      includeCustomVars,
      silent: true,
    });
    let breakpoints: BreakpointMap | undefined;
    if (typeof cli.generateTheme === 'function') {
      const generated = await cli.generateTheme({
        customCssPath: cssPath,
        baseCssPath,
        includeCustomVars,
        silent: true,
      });
      if (generated.breakpoints && Object.keys(generated.breakpoints).length > 0) {
        breakpoints = generated.breakpoints;
      }
    }
    lastSyncedStampByOut.set(outPath, stamp);
    lastSyncedBreakpointsByOut.set(outPath, breakpoints);
    return { cssPath, outPath, written, breakpoints };
  })().finally(() => {
    inFlightByOut.delete(outPath);
  });

  inFlightByOut.set(outPath, task);
  return task;
}

/**
 * Resolves the active breakpoint map for a plugin invocation:
 * explicit `options.breakpoints` takes precedence over breakpoints extracted from `options.theme`.
 */
export async function resolvePluginBreakpoints(
  options?: CumuloPluginOptions,
  projectRoot: string = process.cwd(),
): Promise<BreakpointMap | undefined> {
  if (options?.breakpoints) {
    return options.breakpoints;
  }
  if (options?.theme) {
    const synced = await syncThemeContract(options.theme, projectRoot);
    return synced.breakpoints;
  }
  return undefined;
}
