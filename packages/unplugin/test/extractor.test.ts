import path from 'node:path';
import { describe, it, expect } from 'vitest';
import {
  extractCssFromCode,
  extractCssFromFile,
  shouldProcessFile,
} from '../src/core/extractor.js';

describe('unplugin extractor', () => {
  it('should detect cumulo files', () => {
    expect(shouldProcessFile(`import { recipe } from '@cumulo/css';`, 'Button.tsx')).toBe(true);
    expect(shouldProcessFile(`recipe({ base: {} })`, 'App.tsx')).toBe(true);
    expect(shouldProcessFile(`console.log("hello")`, 'plain.ts')).toBe(false);
  });

  it('should extract CSS from style() calls', async () => {
    const code = `
      import { style } from '@cumulo/css';
      export const testClass = style({
        display: 'flex',
        padding: 16,
        color: 'red',
      }, 'test-box');
    `;

    const css = await extractCssFromCode(code, 'TestBox.ts');
    expect(css).toContain('.test-box-');
    expect(css).toContain('display:flex;');
    expect(css).toContain('padding:16px;');
    expect(css).toContain('color:red;');
  });

  it('should extract CSS from recipe() calls', async () => {
    const code = `
      import { recipe } from '@cumulo/css';
      export const buttonRecipe = recipe({
        base: {
          borderRadius: 8,
        },
        variants: {
          size: {
            sm: { fontSize: 12 },
            lg: { fontSize: 18 },
          },
        },
      }, 'custom-btn');
    `;

    const css = await extractCssFromCode(code, 'CustomButton.ts');
    expect(css).toContain('.custom-btn-base-');
    expect(css).toContain('.custom-btn-size-sm-');
    expect(css).toContain('.custom-btn-size-lg-');
  });

  it('should extract CSS from create() and keyframes() calls', async () => {
    const code = `
      import { create, keyframes } from '@cumulo/css';

      export const fadeIn = keyframes({
        from: { opacity: 0 },
        to: { opacity: 1 },
      }, 'fadeIn');

      export const styles = create({
        card: {
          animation: String(fadeIn) + ' 200ms ease',
          backgroundColor: '#fff',
        },
      }, 'my');
    `;

    const css = await extractCssFromCode(code, 'CardStyles.ts');
    expect(css).toContain('@keyframes');
    expect(css).toContain('fadeIn');
    expect(css).toContain('.my-card-');
    expect(css).toContain('background-color:#fff;');
  });

  it('regression: should not drop base styles on consecutive extractions (sheet isolation)', async () => {
    const codeA = `
      import { recipe } from '@cumulo/css';
      export const btnRecipe = recipe({
        base: { display: 'inline-flex', padding: 8 },
        variants: { variant: { primary: { background: 'blue' } } }
      }, 'btn');
    `;

    const codeB = `
      import { recipe } from '@cumulo/css';
      export const cardRecipe = recipe({
        base: { display: 'block', padding: 16 },
        variants: { shadow: { sm: { boxShadow: '0 1px 2px rgba(0,0,0,0.1)' } } }
      }, 'card');
    `;

    // First extraction of Module A
    const cssA1 = await extractCssFromCode(codeA, 'Button.ts');
    expect(cssA1).toContain('.btn-base-');
    expect(cssA1).toContain('.btn-variant-primary-');

    // Extraction of Module B
    const cssB = await extractCssFromCode(codeB, 'Card.ts');
    expect(cssB).toContain('.card-base-');
    expect(cssB).toContain('.card-shadow-sm-');

    // Second extraction of Module A must still contain all base classes
    const cssA2 = await extractCssFromCode(codeA, 'Button.ts');
    expect(cssA2).toContain('.btn-base-');
    expect(cssA2).toContain('.btn-variant-primary-');
  });

  it('regression: should parse and extract from TSX React components with JSX elements', async () => {
    const componentCode = `
      import React from 'react';
      import { recipe } from '@cumulo/css';

      export const badgeRecipe = recipe({
        base: {
          borderRadius: 9999,
          padding: '2px 8px',
          fontWeight: 600,
        },
        variants: {
          intent: {
            success: { background: 'green', color: 'white' },
            error: { background: 'red', color: 'white' },
          },
        },
      }, 'badge');

      export function Badge({ intent = 'success', children, ref }) {
        const className = badgeRecipe({ intent });
        return (
          <span ref={ref} className={className}>
            {children}
          </span>
        );
      }
    `;

    const css = await extractCssFromCode(componentCode, 'Badge.tsx');
    expect(css).toContain('.badge-base-');
    expect(css).toContain('border-radius:9999px;');
    expect(css).toContain('.badge-intent-success-');
    expect(css).toContain('.badge-intent-error-');
  });

  it('regression: should extract complete CSS from @cumulo/core Button component directly', async () => {
    const filePath = path.resolve(process.cwd(), 'packages/core/src/components/Button.tsx');
    const css = await extractCssFromFile(filePath);

    expect(css).toContain('.btn-base-');
    expect(css).toContain('display:inline-flex;');
    expect(css).toContain('.btn-variant-primary-');
    expect(css).toContain('.btn-variant-secondary-');
    expect(css).toContain('.btn-size-base-');
    expect(css).toContain('.btn-size-small-');
    expect(css).toContain('.btn-width-full-');
  });

  it('regression: SSR rendered HTML classes should match extracted CSS selectors exactly', async () => {
    const filePath = path.resolve(process.cwd(), 'packages/core/src/components/Button.tsx');
    const css = await extractCssFromFile(filePath);

    const { buttonRecipe } = await import('../../../packages/core/src/components/Button.js');
    const renderedClasses = buttonRecipe({
      variant: 'primary',
      intent: 'primary',
      size: 'base',
      width: 'auto',
    });
    const classList = renderedClasses.split(' ').filter((cls) => cls && !cls.endsWith('-nf0rvp'));

    expect(classList.length).toBeGreaterThan(0);
    for (const cls of classList) {
      expect(css).toContain(`.${cls}`);
    }
  });

  it('regression: should extract inline styles from component code with styles', async () => {
    const code = `
      import React from 'react';
      import { style } from '@cumulo/css';
      import { vars } from '@cumulo/core';

      export const layoutBodyStyle = style(
        {
          margin: 0,
          minHeight: '100vh',
          backgroundColor: vars.surface.bg.DEFAULT,
        },
        'layout-body',
      );
    `;
    const css = await extractCssFromCode(code, 'Layout.tsx');

    expect(css).toContain('.layout-body-');
    expect(css).toContain('min-height:100vh;');
  });
});
