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

    // 2. Radius tokens follow shadow tokens
    expect(result.canonicalVars[4]).toBe('--theme-radius-none');
    expect(result.canonicalVars[5]).toBe('--theme-radius-md');
    expect(result.canonicalVars[6]).toBe('--theme-radius-lg');

    // 3. Inspect generated contract code contains keys in source order
    const shadowIndex = result.contractCode.indexOf('shadow: {');
    const radiusIndex = result.contractCode.indexOf('radius: {');
    const sizeIndex = result.contractCode.indexOf('size: {');
    const containerIndex = result.contractCode.indexOf('container: {');
    const spacingIndex = result.contractCode.indexOf('spacing: {');

    expect(shadowIndex).toBeLessThan(radiusIndex);
    expect(radiusIndex).toBeLessThan(sizeIndex);
    expect(sizeIndex).toBeLessThan(containerIndex);
    expect(containerIndex).toBeLessThan(spacingIndex);

    // 4. Nested radius keys in size order (none -> md -> lg -> xl -> 2xl -> full)
    const noneIndex = result.contractCode.indexOf("none: 'var(--theme-radius-none)'");
    const mdIndex = result.contractCode.indexOf("md: 'var(--theme-radius-md)'");
    const lgIndex = result.contractCode.indexOf("lg: 'var(--theme-radius-lg)'");
    const xlIndex = result.contractCode.indexOf("xl: 'var(--theme-radius-xl)'");
    const x2lIndex = result.contractCode.indexOf("'2xl': 'var(--theme-radius-2xl)'");
    const fullIndex = result.contractCode.indexOf("full: 'var(--theme-radius-full)'");

    expect(noneIndex).toBeLessThan(mdIndex);
    expect(mdIndex).toBeLessThan(lgIndex);
    expect(lgIndex).toBeLessThan(xlIndex);
    expect(xlIndex).toBeLessThan(x2lIndex);
    expect(x2lIndex).toBeLessThan(fullIndex);

    // 5. Steps order (50 comes before 100, not alphabetical)
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
        --theme-radius-md: 16px;
        --color-primary-base: #ec4899;
        --theme-font-sans: 'Geist Sans', sans-serif;
        --nonexistent-custom-property: 42px;
      }
    `;

    const result = await generateTheme({
      customCssContent: customCss,
    });

    // Overridden variables should be tracked
    expect(result.overriddenVars).toContain('--theme-radius-md');
    expect(result.overriddenVars).toContain('--color-primary-base');
    expect(result.overriddenVars).toContain('--theme-font-sans');

    // Non-existent variable should be ignored and NOT added to canonical vars
    expect(result.ignoredVars).toContain('--nonexistent-custom-property');
    expect(result.canonicalVars).not.toContain('--nonexistent-custom-property');

    // Contract JSDoc comments should reflect the custom values
    expect(result.contractCode).toContain('/** 16px */');
    expect(result.contractCode).toContain("md: 'var(--theme-radius-md)'");

    expect(result.contractCode).toContain('/** #ec4899 */');
    expect(result.contractCode).toContain("primary: 'var(--color-primary-base)'");

    expect(result.contractCode).toContain("/** 'Geist Sans', sans-serif */");
    expect(result.contractCode).toContain("sans: 'var(--theme-font-sans)'");

    // Non-overridden variables retain default comments
    expect(result.contractCode).toContain('/** 0px */');
    expect(result.contractCode).toContain("none: 'var(--theme-radius-none)'");

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
        --theme-radius-md: 8px;
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
    expect(content).toContain('export const themeTokens = [');
    expect(content).toContain('export const themeVars = {');
    expect(content).toContain('/** 8px */');
    expect(content).toContain("md: 'var(--theme-radius-md)'");

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
        --theme-radius-lg: 24px;
      }
    `,
    );

    await runCli(['generate-theme', `--css=${customCssFile}`, `--out=${outFile}`, '--silent']);

    expect(fs.existsSync(outFile)).toBe(true);
    const content = fs.readFileSync(outFile, 'utf-8');
    expect(content).toContain('/** 24px */');
    expect(content).toContain("lg: 'var(--theme-radius-lg)'");

    fs.rmSync(tempDir, { recursive: true, force: true });
  });
});
