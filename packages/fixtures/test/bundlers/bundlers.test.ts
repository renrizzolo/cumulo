import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';
import {
  buildWithVite,
  buildWithRollup,
  buildWithEsbuild,
  buildWithWebpack,
} from '../../src/helpers/bundler-builders.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function verifyExtractedCss(rawCss: string, bundlerName: string) {
  const css = rawCss.replace(/\s+/g, ' ');

  // 1. Basic CSS & Keyframes
  expect(css, `[${bundlerName}] basic box style missing`).toContain('.basic-box-');
  expect(css, `[${bundlerName}] basic box flex missing`).toMatch(/display:\s*flex/);
  expect(css, `[${bundlerName}] keyframes pulse missing`).toContain('@keyframes pulse-');
  expect(css, `[${bundlerName}] animated badge missing`).toContain('.animated-badge-');

  // 2. Themes
  expect(css, `[${bundlerName}] root theme vars missing`).toMatch(
    /:root\s*\{\s*--c-color-bg:\s*#(?:ffffff|fff)/,
  );
  expect(css, `[${bundlerName}] dark theme class missing`).toContain('.theme-');

  // 3. Overrides
  expect(css, `[${bundlerName}] override base missing`).toContain('.override-base-');
  expect(css, `[${bundlerName}] override highlight missing`).toContain('.override-highlight-');

  // 4. Recipes & Extensions
  expect(css, `[${bundlerName}] recipe base missing`).toContain('.btn-fixture-base-');
  expect(css, `[${bundlerName}] recipe variant primary missing`).toContain(
    '.btn-fixture-intent-primary-',
  );
  expect(css, `[${bundlerName}] recipe variant danger missing`).toContain(
    '.btn-fixture-intent-danger-',
  );
  expect(css, `[${bundlerName}] recipe compound variant missing`).toContain('.btn-fixture-cv-0-');
  expect(css, `[${bundlerName}] extended recipe base missing`).toContain('.btn-ext-fixture-base-');
  expect(css, `[${bundlerName}] extended recipe variant missing`).toContain(
    '.btn-ext-fixture-shape-pill-',
  );
}

describe('Bundler Integration & CSS Extraction', () => {
  it('Vite extracts valid CSS for all fixture components', async () => {
    const outDir = path.resolve(__dirname, '../.temp/vite');
    const result = await buildWithVite(outDir);
    expect(result.bundlerName).toBe('Vite');
    verifyExtractedCss(result.cssContent, 'Vite');
  }, 20000);

  it('Rollup extracts valid CSS for all fixture components', async () => {
    const outDir = path.resolve(__dirname, '../.temp/rollup');
    const result = await buildWithRollup(outDir);
    expect(result.bundlerName).toBe('Rollup');
    verifyExtractedCss(result.cssContent, 'Rollup');
  }, 20000);

  it('esbuild extracts valid CSS for all fixture components', async () => {
    const outDir = path.resolve(__dirname, '../.temp/esbuild');
    const result = await buildWithEsbuild(outDir);
    expect(result.bundlerName).toBe('esbuild');
    verifyExtractedCss(result.cssContent, 'esbuild');
  }, 20000);

  it('Webpack extracts valid CSS for all fixture components', async () => {
    const outDir = path.resolve(__dirname, '../.temp/webpack');
    const result = await buildWithWebpack(outDir);
    expect(result.bundlerName).toBe('Webpack');
    verifyExtractedCss(result.cssContent, 'Webpack');
  }, 20000);
});
