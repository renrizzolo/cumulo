import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { extractAndRewrite, shouldProcessFile } from '../../../unplugin/src/core/extractor.js';
import {
  buildNextAppRouter,
  buildNextPagesRouter,
  buildWithEsbuild,
  buildWithParcel,
  buildWithRollup,
  buildWithVite,
  buildWithWebpack,
  type BundlerBuildResult,
} from '../../src/helpers/bundler-builders.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CORE_CLI = path.resolve(__dirname, '../../../core/bin/cumulo.mjs');
const SHARED_TEMP = path.resolve(__dirname, '../../src/shared/.temp');
const VARS_FILE = path.resolve(SHARED_TEMP, 'vars.ts');
const STYLE_FILE = path.resolve(__dirname, '../../src/shared/generated-vars-style.ts');
const STANDALONE_FILE = path.resolve(__dirname, '../../src/shared/generated-vars-standalone.ts');
const ENTRY = 'generated-vars-entry.tsx';
const CUSTOM_RADIUS = '0.987rem';

function verifyCss(result: BundlerBuildResult, name: string) {
  const css = result.cssContent.replace(/\s+/g, ' ');
  // Leaves were inlined to their `var(--…)` references in the extracted CSS.
  expect(css, `[${name}] radius`).toContain('var(--theme-radius-md)');
  expect(css, `[${name}] seed`).toContain('var(--color-primary-base)');
}

function verify(result: BundlerBuildResult, name: string, options?: { allowMetaSymbol?: boolean }) {
  verifyCss(result, name);
  // Direct `vars.radius.md` access in generated-vars-style.ts was inlined to the literal string.
  expect(result.jsContent, `[${name}] inlined var string`).toContain('var(--theme-radius-md)');
  // Direct `vars.spacing.lg` access in generated-vars-standalone.ts (no @cumulo/css import) was also inlined.
  expect(result.jsContent, `[${name}] inlined standalone var string`).toContain(
    'var(--theme-spacing-lg)',
  );
  // The generated vars object (and its unreferenced tokens) never reaches the client bundle.
  if (!options?.allowMetaSymbol) {
    expect(result.jsContent, `[${name}] leaked contract meta`).not.toContain('__CUMULO_META__');
  }
  expect(result.jsContent, `[${name}] leaked token value`).not.toContain(CUSTOM_RADIUS);
  expect(result.jsContent, `[${name}] leaked unreferenced vars`).not.toContain(
    '--theme-spacing-md',
  );
}

const cumuloCssPkg = ['@cumulo', 'css'].join('/');
const nextAppPageContent = `
import { style } from '${cumuloCssPkg}';
import { vars } from './vars';

const nextGeneratedBox = style({
  borderRadius: vars.radius.md,
  color: vars.seed.primary,
}, 'next-generated-vars-box');

export default function Page() {
  return <main className={nextGeneratedBox.className} />;
}
`;

const nextPagesContent = nextAppPageContent.replace("from './vars'", "from '../vars'");

describe('Generated `--out` vars file', () => {
  beforeAll(() => {
    fs.mkdirSync(SHARED_TEMP, { recursive: true });
    const customCss = path.resolve(SHARED_TEMP, 'custom.css');
    fs.writeFileSync(customCss, `:root { --theme-radius-md: ${CUSTOM_RADIUS}; }\n`, 'utf-8');
    execFileSync(
      process.execPath,
      [CORE_CLI, 'generate-theme', '--css', customCss, '--out', VARS_FILE, '--silent'],
      { stdio: 'pipe' },
    );
  });

  afterAll(() => {
    fs.rmSync(SHARED_TEMP, { recursive: true, force: true });
  });

  it('carries synced values and contract metadata', () => {
    const code = fs.readFileSync(VARS_FILE, 'utf-8');
    expect(code).toContain(CUSTOM_RADIUS);
    expect(code).toContain('__CUMULO_META__');
  });

  it('the rewriter inlines static vars leaves from the generated file (with or without @cumulo/css)', async () => {
    const styleResult = await extractAndRewrite(fs.readFileSync(STYLE_FILE, 'utf-8'), STYLE_FILE);
    expect(styleResult.code).toBeDefined();
    expect(styleResult.code).toContain('"var(--theme-radius-md)"');
    expect(styleResult.code).not.toMatch(/\bvars\./);
    expect(styleResult.code).not.toContain('.temp/vars');

    const standaloneCode = fs.readFileSync(STANDALONE_FILE, 'utf-8');
    expect(shouldProcessFile(standaloneCode, STANDALONE_FILE)).toBe(true);
    const standaloneResult = await extractAndRewrite(standaloneCode, STANDALONE_FILE);
    expect(standaloneResult.code).toBeDefined();
    expect(standaloneResult.code).toContain('"var(--theme-spacing-lg)"');
    expect(standaloneResult.code).not.toMatch(/\bvars\./);
    expect(standaloneResult.code).not.toContain('.temp/vars');
  });

  it('Vite inlines vars from the generated file', async () => {
    verify(await buildWithVite(path.resolve(__dirname, '../.temp/vars-vite'), ENTRY), 'Vite');
  }, 30000);

  it('Rollup inlines vars from the generated file', async () => {
    verify(await buildWithRollup(path.resolve(__dirname, '../.temp/vars-rollup'), ENTRY), 'Rollup');
  }, 30000);

  it('esbuild inlines vars from the generated file', async () => {
    verify(
      await buildWithEsbuild(path.resolve(__dirname, '../.temp/vars-esbuild'), ENTRY),
      'esbuild',
    );
  }, 30000);

  it('Webpack inlines vars from the generated file', async () => {
    verify(
      await buildWithWebpack(path.resolve(__dirname, '../.temp/vars-webpack'), ENTRY),
      'Webpack',
    );
  }, 30000);

  it('Parcel (v2) inlines vars from the generated file', async () => {
    verify(
      await buildWithParcel(path.resolve(__dirname, '../.temp/vars-parcel'), ENTRY),
      'Parcel',
      // Parcel v2 scope-hoisting retains the bare `Symbol.for("__CUMULO_META__")` call while
      // tree-shaking the entire `vars` object and its tokens.
      { allowMetaSymbol: true },
    );
  }, 60000);

  it('Next.js App Router (Turbopack) extracts CSS using the generated file', async () => {
    verifyCss(
      await buildNextAppRouter(path.resolve(__dirname, '../.temp/vars-next-app-turbopack'), {
        turbopack: true,
        pageContent: nextAppPageContent,
        extraFiles: { 'vars.ts': fs.readFileSync(VARS_FILE, 'utf-8') },
      }),
      'Next.js App Router (Turbopack)',
    );
  }, 60000);

  it('Next.js App Router (Webpack) extracts CSS using the generated file', async () => {
    verifyCss(
      await buildNextAppRouter(path.resolve(__dirname, '../.temp/vars-next-app-webpack'), {
        turbopack: false,
        pageContent: nextAppPageContent,
        extraFiles: { 'vars.ts': fs.readFileSync(VARS_FILE, 'utf-8') },
      }),
      'Next.js App Router (Webpack)',
    );
  }, 60000);

  it('Next.js Pages Router (Turbopack) extracts CSS using the generated file', async () => {
    verifyCss(
      await buildNextPagesRouter(path.resolve(__dirname, '../.temp/vars-next-pages-turbopack'), {
        turbopack: true,
        pageContent: nextPagesContent,
        extraFiles: { 'vars.ts': fs.readFileSync(VARS_FILE, 'utf-8') },
      }),
      'Next.js Pages Router (Turbopack)',
    );
  }, 60000);

  it('Next.js Pages Router (Webpack) extracts CSS using the generated file', async () => {
    verifyCss(
      await buildNextPagesRouter(path.resolve(__dirname, '../.temp/vars-next-pages-webpack'), {
        turbopack: false,
        pageContent: nextPagesContent,
        extraFiles: { 'vars.ts': fs.readFileSync(VARS_FILE, 'utf-8') },
      }),
      'Next.js Pages Router (Webpack)',
    );
  }, 60000);
});
