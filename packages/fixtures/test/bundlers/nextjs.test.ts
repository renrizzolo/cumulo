import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';
import { buildNextAppRouter, buildNextPagesRouter } from '../../src/helpers/bundler-builders.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Next.js Integration & CSS Extraction', () => {
  it('Next.js App Router (Turbopack) extracts valid CSS for Cumulo components', async () => {
    const outDir = path.resolve(__dirname, '../.temp/next-app-turbopack');
    const result = await buildNextAppRouter(outDir, { turbopack: true });

    expect(result.bundlerName).toBe('Next.js App Router (Turbopack)');
    expect(result.cssContent).toContain('.next-app-box-');
    expect(result.cssContent).toMatch(/display:\s*flex/);
    expect(result.cssContent).toContain('.next-app-btn-base-');
    expect(result.cssContent).toContain('.next-app-btn-intent-primary-');
  }, 60000);

  it('Next.js Pages Router (Turbopack) extracts valid CSS for Cumulo components', async () => {
    const outDir = path.resolve(__dirname, '../.temp/next-pages-turbopack');
    const result = await buildNextPagesRouter(outDir, { turbopack: true });

    expect(result.bundlerName).toBe('Next.js Pages Router (Turbopack)');
    expect(result.cssContent).toContain('.next-pages-box-');
    expect(result.cssContent).toMatch(/display:\s*flex/);
    expect(result.cssContent).toContain('.next-pages-badge-base-');
    expect(result.cssContent).toContain('.next-pages-badge-status-active-');
  }, 60000);

  it('Next.js App Router (Webpack) extracts valid CSS for Cumulo components', async () => {
    const outDir = path.resolve(__dirname, '../.temp/next-app-webpack');
    const result = await buildNextAppRouter(outDir, { turbopack: false });

    expect(result.bundlerName).toBe('Next.js App Router (Webpack)');
    expect(result.cssContent).toContain('.next-app-box-');
    expect(result.cssContent).toMatch(/display:\s*flex/);
    expect(result.cssContent).toContain('.next-app-btn-base-');
    expect(result.cssContent).toContain('.next-app-btn-intent-primary-');
  }, 60000);

  it('Next.js Pages Router (Webpack) extracts valid CSS for Cumulo components', async () => {
    const outDir = path.resolve(__dirname, '../.temp/next-pages-webpack');
    const result = await buildNextPagesRouter(outDir, { turbopack: false });

    expect(result.bundlerName).toBe('Next.js Pages Router (Webpack)');
    expect(result.cssContent).toContain('.next-pages-box-');
    expect(result.cssContent).toMatch(/display:\s*flex/);
    expect(result.cssContent).toContain('.next-pages-badge-base-');
    expect(result.cssContent).toContain('.next-pages-badge-status-active-');
  }, 60000);
});
