import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { runCli } from '../src/cli/index.js';
import { generateTheme, runThemeGeneration } from '../src/cli/themeGenerator.js';

describe('Theme Generator & CLI', () => {
  it('extracts canonical CSS variables and structures contract in strict source order', async () => {
    const result = await generateTheme();

    // 1. First variables in theme.css are shadow tokens
    expect(result.canonicalVars[0]).toBe('--shadow-color');
    expect(result.canonicalVars[1]).toBe('--theme-shadow-0');
    expect(result.canonicalVars[2]).toBe('--theme-shadow-1');
    expect(result.canonicalVars[3]).toBe('--theme-shadow-2');

    // 2. Inspect generated contract code contains keys in source order
    const shadowIndex = result.contractCode.indexOf('shadow: {');
    const sizeIndex = result.contractCode.indexOf('size: {');
    const containerIndex = result.contractCode.indexOf('container: {');
    const spacingIndex = result.contractCode.indexOf('spacing: {');

    expect(shadowIndex).toBeLessThan(sizeIndex);
    expect(sizeIndex).toBeLessThan(containerIndex);
    expect(containerIndex).toBeLessThan(spacingIndex);

    // 3. Nested spacing keys in size order (none -> 3xs -> 2xs -> xs -> sm -> md -> lg -> xl -> 2xl)
    const noneIndex = result.contractCode.indexOf("none: 'var(--theme-spacing-none)'");
    const xsIndex = result.contractCode.indexOf("xs: 'var(--theme-spacing-xs)'");
    const smIndex = result.contractCode.indexOf("sm: 'var(--theme-spacing-sm)'");
    const mdIndex = result.contractCode.indexOf("md: 'var(--theme-spacing-md)'");
    const lgIndex = result.contractCode.indexOf("lg: 'var(--theme-spacing-lg)'");
    const xlIndex = result.contractCode.indexOf("xl: 'var(--theme-spacing-xl)'");

    expect(noneIndex).toBeLessThan(xsIndex);
    expect(xsIndex).toBeLessThan(smIndex);
    expect(smIndex).toBeLessThan(mdIndex);
    expect(mdIndex).toBeLessThan(lgIndex);
    expect(lgIndex).toBeLessThan(xlIndex);

    // 4. Steps order (50 comes before 100, not alphabetical)
    const step50Index = result.contractCode.indexOf("'50': 'var(--theme-error-50)'");
    const step100Index = result.contractCode.indexOf("'100': 'var(--theme-error-100)'");
    const step200Index = result.contractCode.indexOf("'200': 'var(--theme-error-200)'");

    expect(step50Index).toBeGreaterThan(0);
    expect(step100Index).toBeGreaterThan(0);
    expect(step200Index).toBeGreaterThan(0);
    expect(step50Index).toBeLessThan(step100Index);
    expect(step100Index).toBeLessThan(step200Index);
  });

  it('overlays custom consumer CSS overrides onto doc comments without adding new vars', async () => {
    const customCss = `
      :root {
        --theme-spacing-md: 16px;
        --color-primary-base: #ec4899;
        --theme-font-sans: 'Geist Sans', sans-serif;
        --nonexistent-custom-property: 42px;
      }
    `;

    const result = await generateTheme({
      customCssContent: customCss,
    });

    // Overridden variables should be tracked
    expect(result.overriddenVars).toContain('--theme-spacing-md');
    expect(result.overriddenVars).toContain('--color-primary-base');
    expect(result.overriddenVars).toContain('--theme-font-sans');

    // Non-existent variable should be ignored and NOT added to canonical vars
    expect(result.ignoredVars).toContain('--nonexistent-custom-property');
    expect(result.canonicalVars).not.toContain('--nonexistent-custom-property');

    // Contract JSDoc comments should reflect the custom values
    expect(result.contractCode).toContain('/** 16px */');
    expect(result.contractCode).toContain("md: 'var(--theme-spacing-md)'");

    expect(result.contractCode).toContain('/** #ec4899 */');
    expect(result.contractCode).toContain("primary: 'var(--color-primary-base)'");

    expect(result.contractCode).toContain("/** 'Geist Sans', sans-serif */");
    expect(result.contractCode).toContain("sans: 'var(--theme-font-sans)'");

    // Non-overridden variables retain default comments
    expect(result.contractCode).toContain('/** 0px */');
    expect(result.contractCode).toContain("none: 'var(--theme-spacing-none)'");

    // Standalone code should also reflect overrides
    expect(result.standaloneCode).toContain('/** 16px */');
    expect(result.standaloneCode).toContain('/** #ec4899 */');
    expect(result.standaloneCode).not.toContain('--nonexistent-custom-property');
  });

  it('writes standalone output file when outPath is specified', async () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cumulo-test-'));
    const outFile = path.join(tempDir, 'custom-contract.ts');

    const customCss = `
      [data-theme='brand'] {
        --theme-spacing-md: 8px;
      }
    `;

    await runThemeGeneration({
      customCssContent: customCss,
      outPath: outFile,
      silent: true,
    });

    expect(fs.existsSync(outFile)).toBe(true);
    const content = fs.readFileSync(outFile, 'utf-8');
    expect(content).toContain('export const vars = {');
    expect(content).toContain('/** 8px */');
    expect(content).toContain("md: 'var(--theme-spacing-md)'");

    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('runs CLI command via runCli successfully', async () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cumulo-cli-test-'));
    const customCssFile = path.join(tempDir, 'my-theme.css');
    const outFile = path.join(tempDir, 'output-theme.ts');

    fs.writeFileSync(
      customCssFile,
      `
      :root {
        --theme-spacing-lg: 24px;
      }
    `,
    );

    await runCli(['generate-theme', `--css=${customCssFile}`, `--out=${outFile}`, '--silent']);

    expect(fs.existsSync(outFile)).toBe(true);
    const content = fs.readFileSync(outFile, 'utf-8');
    expect(content).toContain('/** 24px */');
    expect(content).toContain("lg: 'var(--theme-spacing-lg)'");

    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('includes custom CSS variables when includeCustomVars / --include-custom is enabled', async () => {
    const customCss = `
      :root {
        --theme-spacing-md: 18px;
        --brand-accent: #ff5500;
        --brand-sidebar-width: 280px;
      }
      [data-theme='alt'] {
        --brand-accent: #0055ff;
      }
    `;

    const result = await generateTheme({
      customCssContent: customCss,
      includeCustomVars: true,
    });

    expect(result.overriddenVars).toEqual(['--theme-spacing-md']);
    expect(result.customVars).toEqual(['--brand-accent', '--brand-sidebar-width']);
    expect(result.ignoredVars).toEqual([]);
    expect(result.standaloneCode).toContain("accent: 'var(--brand-accent)'");
    expect(result.standaloneCode).toContain('/** #0055ff */');
    expect(result.standaloneCode).toContain("width: 'var(--brand-sidebar-width)'");
    expect(result.standaloneCode).toContain('/** 280px */');

    // Verify CLI flag `--include-custom` works end-to-end
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cumulo-custom-cli-'));
    const cssFile = path.join(tempDir, 'theme.css');
    const outFile = path.join(tempDir, 'vars.ts');
    try {
      fs.writeFileSync(cssFile, customCss, 'utf-8');
      await runCli([
        'generate-theme',
        `--css=${cssFile}`,
        `--out=${outFile}`,
        '--include-custom',
        '--silent',
      ]);

      const content = fs.readFileSync(outFile, 'utf-8');
      expect(content).toContain("accent: 'var(--brand-accent)'");
      expect(content).toContain("width: 'var(--brand-sidebar-width)'");
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('skips rewriting output file when content is unchanged and requires --out', async () => {
    await expect(runThemeGeneration({ silent: true })).rejects.toThrow('--out');

    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cumulo-noop-write-'));
    const outFile = path.join(tempDir, 'vars.ts');
    try {
      const firstWrite = await runThemeGeneration({
        customCssContent: ':root { --theme-spacing-md: 14px; }',
        outPath: outFile,
        silent: true,
      });
      expect(firstWrite).toBe(true);

      const secondWrite = await runThemeGeneration({
        customCssContent: ':root { --theme-spacing-md: 14px; }',
        outPath: outFile,
        silent: true,
      });
      expect(secondWrite).toBe(false);
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('stores resolved breakpoint values directly on vars.breakpoint matching Container sizes', async () => {
    const result = await generateTheme();

    expect(result.breakpoints).toEqual({
      sm: '@media (min-width: 640px)',
      md: '@media (min-width: 768px)',
      lg: '@media (min-width: 1024px)',
      xl: '@media (min-width: 1280px)',
      '2xl': '@media (min-width: 1440px)',
    });

    expect(result.contractCode).toContain('breakpoint: {');
    expect(result.contractCode).toContain('/** @media (min-width: 768px) */');
    expect(result.contractCode).toContain("md: '768px'");
    expect(result.contractCode).not.toContain('var(--theme-breakpoint-md)');
    expect(result.contractCode).not.toContain('export const breakpoints =');
    expect(result.contractCode).toContain(
      "export type ThemeBreakpoints = ThemeVars['breakpoint'];",
    );
    // Default theme without overrides should not emit CustomBreakpoints augmentation
    expect(result.contractCode).not.toContain("declare module '@cumulo/css'");
  });

  it('resolves custom breakpoint overrides, var() aliases, quoted @container queries, and emits CustomBreakpoints augmentation', async () => {
    const customCss = `
      :root {
        --theme-container-md: 800px;
        --theme-breakpoint-md: var(--theme-container-md);
        --theme-breakpoint-3xl: 1920px;
        --theme-breakpoint-card: '@container card (min-width: 500px)';
      }
    `;

    const result = await generateTheme({
      customCssContent: customCss,
      includeCustomVars: true,
    });

    expect(result.breakpoints.md).toBe('@media (min-width: 800px)');
    expect(result.breakpoints['3xl']).toBe('@media (min-width: 1920px)');
    expect(result.breakpoints.card).toBe('@container card (min-width: 500px)');
    expect(result.standaloneCode).toContain("md: '800px'");
    expect(result.standaloneCode).toContain("'3xl': '1920px'");
    expect(result.standaloneCode).toContain("card: '@container card (min-width: 500px)'");
    expect(result.standaloneCode).toContain("declare module '@cumulo/css'");
    expect(result.standaloneCode).toContain('interface CustomBreakpoints');
    expect(result.standaloneCode).toContain("'3xl': true;");
    expect(result.standaloneCode).toContain('card: true;');
  });
});
