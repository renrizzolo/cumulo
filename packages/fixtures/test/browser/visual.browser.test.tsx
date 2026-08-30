import React from 'react';
import { createRoot } from 'react-dom/client';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { page, commands } from 'vitest/browser';
import { App } from '../../src/shared/App.js';

interface CustomCommands {
  getBundlerBuild(bundler: string): Promise<{ cssContent: string; jsContent: string }>;
}

const customCommands = commands as unknown as CustomCommands;

const bundlers = ['vite', 'rollup', 'esbuild', 'webpack'] as const;

describe('Vitest Native Browser Visual Regression Testing Per Bundler', () => {
  let container: HTMLDivElement | null = null;
  let styleEl: HTMLStyleElement | null = null;

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'root';
    document.body.appendChild(container);

    styleEl = document.createElement('style');
    styleEl.id = 'bundler-injected-styles';
    document.head.appendChild(styleEl);
  });

  afterEach(() => {
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
    if (styleEl && styleEl.parentNode) {
      styleEl.parentNode.removeChild(styleEl);
    }
  });

  for (const bundler of bundlers) {
    describe(`${bundler.toUpperCase()} Visual Regressions & Screenshots`, () => {
      it(`captures full and section screenshots for ${bundler}`, async () => {
        const buildResult = await customCommands.getBundlerBuild(bundler);
        if (styleEl && buildResult.cssContent) {
          styleEl.textContent = buildResult.cssContent;
        }

        const root = createRoot(container!);
        root.render(<App />);

        const appLocator = page.getByTestId('fixture-app');
        await expect.element(appLocator).toBeVisible();

        // 1. Full application screenshot per bundler
        await expect(appLocator).toMatchScreenshot(`${bundler}-full.png`);

        // 2. Basic CSS & Theme section screenshot per bundler
        const basicSection = page.getByTestId('section-basic');
        await expect(basicSection).toMatchScreenshot(`${bundler}-basic.png`);

        // 3. CSS Overrides section screenshot per bundler
        const overridesSection = page.getByTestId('section-overrides');
        await expect(overridesSection).toMatchScreenshot(`${bundler}-overrides.png`);

        // 4. Recipes & Extensions section screenshot per bundler
        const recipesSection = page.getByTestId('section-recipes');
        await expect(recipesSection).toMatchScreenshot(`${bundler}-recipes.png`);
      });

      it(`verifies computed styles in browser DOM for ${bundler}`, async () => {
        const buildResult = await customCommands.getBundlerBuild(bundler);
        if (styleEl && buildResult.cssContent) {
          styleEl.textContent = buildResult.cssContent;
        }

        const root = createRoot(container!);
        root.render(<App />);

        const appLocator = page.getByTestId('fixture-app');
        await expect.element(appLocator).toBeVisible();

        // Basic & Theme checks
        const lightBox = page.getByTestId('basic-box-light').element();
        const lightBoxStyle = window.getComputedStyle(lightBox);
        expect(lightBoxStyle.display).toBe('flex');
        expect(lightBoxStyle.borderRadius).toBe('8px');
        expect(lightBoxStyle.backgroundColor).toBe('rgb(255, 255, 255)');

        const darkBox = page.getByTestId('basic-box-dark').element();
        const darkBoxStyle = window.getComputedStyle(darkBox);
        expect(darkBoxStyle.backgroundColor).toBe('rgb(24, 24, 27)');
        expect(darkBoxStyle.color).toBe('rgb(250, 250, 250)');

        // Overrides checks
        const mergedCard = page.getByTestId('override-merged').element();
        const mergedStyle = window.getComputedStyle(mergedCard);
        expect(mergedStyle.backgroundColor).toBe('rgb(239, 246, 255)');
        expect(mergedStyle.color).toBe('rgb(30, 64, 175)');
        expect(mergedStyle.borderColor).toBe('rgb(59, 130, 246)');

        // Recipes checks
        const primaryBtn = page.getByTestId('btn-default').element();
        const primaryBtnStyle = window.getComputedStyle(primaryBtn);
        expect(primaryBtnStyle.backgroundColor).toBe('rgb(59, 130, 246)');
        expect(primaryBtnStyle.color).toBe('rgb(255, 255, 255)');

        const dangerSmBtn = page.getByTestId('btn-danger-sm').element();
        const dangerSmStyle = window.getComputedStyle(dangerSmBtn);
        expect(dangerSmStyle.backgroundColor).toBe('rgb(239, 68, 68)');
        expect(dangerSmStyle.height).toBe('28px');

        const extPillXlBtn = page.getByTestId('btn-ext-pill-xl').element();
        const extPillXlStyle = window.getComputedStyle(extPillXlBtn);
        expect(extPillXlStyle.borderRadius).toBe('9999px');
        expect(extPillXlStyle.height).toBe('52px');
        expect(extPillXlStyle.textTransform).toBe('uppercase');
      });
    });
  }
});
