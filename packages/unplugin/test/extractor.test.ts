import path from 'node:path';

import { describe, it, expect } from 'vitest';

import {
  extractAndRewrite,
  extractCssFromCode,
  extractCssFromFile,
  shouldProcessFile,
} from '../src/core/extractor.js';

describe('unplugin extractor', () => {
  it('should detect cumulo files without matching unrelated function names', () => {
    expect(shouldProcessFile(`import { recipe } from '@cumulo/css';`, 'Button.tsx')).toBe(true);
    expect(shouldProcessFile(`import { style } from "@cumulo/css";`, 'Card.tsx')).toBe(true);
    expect(
      shouldProcessFile(
        `import { vars } from '@cumulo/core';\nexport const w = vars.size.xl;`,
        'Box.tsx',
      ),
    ).toBe(true);
    expect(
      shouldProcessFile(
        `import { vars as tokens } from '@cumulo/core/contract';\nexport const w = tokens.size.xl;`,
        'Box.tsx',
      ),
    ).toBe(true);
    expect(
      shouldProcessFile(
        `import { vars } from './vars';\nexport const r = vars.radius.md;`,
        'Box.tsx',
      ),
    ).toBe(true);
    expect(
      shouldProcessFile(
        `import {\n  vars as tokens,\n} from '../theme-vars';\nexport const r = tokens.radius.md;`,
        'Box.tsx',
      ),
    ).toBe(true);
    expect(shouldProcessFile(`import type { vars } from './vars';`, 'Types.ts')).toBe(false);
    expect(shouldProcessFile(`import { myvars } from './utils';`, 'Box.tsx')).toBe(false);
    expect(
      shouldProcessFile(`import { runtimeStyle } from '@cumulo/css/runtime';`, 'Button.tsx'),
    ).toBe(false);
    expect(shouldProcessFile(`export function recipe() {}\nrecipe({ base: {} });`, 'App.tsx')).toBe(
      false,
    );
    expect(shouldProcessFile(`const obj = Object.create(null);`, 'utils.ts')).toBe(false);
    expect(shouldProcessFile(`import { Button } from '@cumulo/core';`, 'Page.tsx')).toBe(false);
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
    expect(css).toContain('.btn-size-md-');
    expect(css).toContain('.btn-size-sm-');
    expect(css).toContain('.btn-width-full-');
  });

  it('regression: SSR rendered HTML classes should match extracted CSS selectors exactly', async () => {
    const filePath = path.resolve(process.cwd(), 'packages/core/src/components/Button.tsx');
    const css = await extractCssFromFile(filePath);

    const { buttonRecipe } = await import('../../../packages/core/src/components/Button.js');
    const renderedClasses = buttonRecipe({
      variant: 'primary',
      intent: 'primary',
      size: 'md',
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

  it('extractAndRewrite rewrites style/recipe/keyframes/theme calls and prunes build-time imports', async () => {
    const code = `"use client";

import { vars } from '@cumulo/core';
import {
  create,
  createGlobalTheme,
  createTheme,
  createThemeContract,
  cx,
  keyframes,
  recipe,
  style,
} from '@cumulo/css';

const localContract = createThemeContract({
  surface: { bg: null, fg: null },
});

createGlobalTheme(':root', localContract, {
  surface: { bg: '#ffffff', fg: '#111111' },
});

export const darkSurface = createTheme(localContract, {
  surface: { bg: '#111111', fg: '#ffffff' },
});

export const spin = keyframes(
  {
    from: { transform: 'rotate(0deg)' },
    to: { transform: 'rotate(360deg)' },
  },
  'rw-spin',
);

export const boxStyle = style(
  {
    padding: vars.spacing.md,
    backgroundColor: localContract.surface.bg,
  },
  'rw-box',
);

export const slots = create(
  {
    inner: { color: localContract.surface.fg },
  },
  'rw-slot',
);

const baseBtn = recipe(
  {
    base: { cursor: 'pointer' },
    variants: {
      size: {
        sm: { fontSize: 12 },
        md: { fontSize: 14 },
      },
      level: {
        0: { opacity: 1 },
        1: { opacity: 0.9 },
      },
    },
    defaultVariants: { size: 'md', level: 0 },
  },
  'rw-base',
);

export const extendedBtn = recipe(
  {
    extend: baseBtn,
    variants: {
      pill: {
        true: { borderRadius: 9999 },
      },
    },
  },
  'rw-ext',
);

export function getClasses(extra?: string): string {
  return cx(boxStyle, slots.inner, extendedBtn({ pill: true }), extra);
}
`;

    const result = await extractAndRewrite(code, 'RewriteDemo.tsx');

    expect(result.css).toContain('.rw-box-');
    expect(result.css).toContain('.rw-slot-inner-');
    expect(result.css).toContain('@keyframes rw-spin-');
    expect(result.css).toContain('.rw-ext-pill-true-');
    expect(result.css).toContain('--c-surface-bg:#111111;');

    expect(result.code).toBeDefined();
    const rewritten = result.code ?? '';

    // Directive prologue must remain on line 1
    expect(rewritten.startsWith('"use client";')).toBe(true);

    // Build-time calls replaced by @cumulo/css/runtime helpers
    expect(rewritten).toContain("from '@cumulo/css/runtime'");
    expect(rewritten).toContain('__cumuloStyle(');
    expect(rewritten).toContain('__cumuloKeyframes(');
    expect(rewritten).toContain('__cumuloTheme(');
    expect(rewritten).toContain('__cumuloRecipe(');
    expect(rewritten).toContain('"defaultVariants":{"size":"md","level":0}');
    expect(rewritten).toContain('void 0');

    // Runtime-safe `cx` redirected to @cumulo/css/runtime; compiler & build-time-only `vars` pruned
    expect(rewritten).not.toContain("from '@cumulo/css'");
    expect(rewritten).not.toContain("from '@cumulo/core'");
    expect(rewritten).not.toContain('createThemeContract(');
  });

  it('extractAndRewrite inlines static ThemeContract (vars) member accesses outside style() calls', async () => {
    const code = `
import { vars } from '@cumulo/core';
import { style } from '@cumulo/css';

export const box = style({ padding: vars.spacing.md }, 'inline-vars-box');

export function getInlineStyle() {
  return {
    width: vars.size.xl,
    gap: vars.spacing['2xs'],
    background: vars.bg[0],
  };
}
`;

    const result = await extractAndRewrite(code, 'InlineVarsDemo.tsx');
    expect(result.code).toBeDefined();
    const rewritten = result.code ?? '';

    expect(rewritten).toContain('"var(--theme-size-xl)"');
    expect(rewritten).toContain('"var(--theme-spacing-2xs)"');
    expect(rewritten).toContain('"var(--theme-bg-0)"');
    expect(rewritten).not.toContain("from '@cumulo/core'");
  });

  it('extractAndRewrite does not inline ThemeContract accesses when the binding is shadowed', async () => {
    const code = `
import { vars } from '@cumulo/core';
import { style } from '@cumulo/css';

export const box = style({ padding: vars.spacing.md }, 'shadow-vars-box');

export function read(vars: { size: { xl: string } }) {
  return vars.size.xl;
}
`;

    const result = await extractAndRewrite(code, 'ShadowedVarsDemo.tsx');
    expect(result.code).toBeDefined();
    const rewritten = result.code ?? '';

    expect(rewritten).toContain('return vars.size.xl;');
  });

  it('extractAndRewrite inlines aliased contract imports, JSX style props, and template literals', async () => {
    const code = `
import { vars as tokens } from '@cumulo/core/contract';

export function Box() {
  return (
    <div style={{ gap: tokens.spacing.md, width: \`calc(\${tokens.size.xl} * 2)\` }} />
  );
}
`;

    const result = await extractAndRewrite(code, 'AliasedJsxVars.tsx');
    expect(result.code).toBeDefined();
    const rewritten = result.code ?? '';

    expect(rewritten).toContain('"var(--theme-spacing-md)"');
    expect(rewritten).toContain('"var(--theme-size-xl)"');
    expect(rewritten).not.toContain('@cumulo/core/contract');
  });

  it('extractAndRewrite preserves vars import when destructured or accessed as a non-leaf group', async () => {
    const code = `
import { vars } from '@cumulo/core/contract';

export function readSpacing() {
  const { spacing } = vars;
  return {
    group: vars.spacing,
    md: vars.spacing.md,
    fromDestructure: spacing.sm,
  };
}
`;

    const result = await extractAndRewrite(code, 'NonLeafVars.tsx');
    expect(result.code).toBeDefined();
    const rewritten = result.code ?? '';

    expect(rewritten).toContain('md: "var(--theme-spacing-md)"');
    expect(rewritten).toContain('group: vars.spacing');
    expect(rewritten).toContain('const { spacing } = vars;');
    expect(rewritten).toContain("from '@cumulo/core/contract'");
  });

  it('extractAndRewrite preserves directive prologue with CRLF line endings and leading comments', async () => {
    const code = [
      '// Copyright header with unicode: 🚀 café',
      '"use client";',
      "import { style } from '@cumulo/css';",
      "export const card = style({ padding: 12 }, 'crlf-card');",
    ].join('\r\n');

    const result = await extractAndRewrite(code, 'CrlfDirective.tsx');
    expect(result.css).toContain('.crlf-card-');
    expect(result.code).toBeDefined();
    const rewritten = result.code ?? '';

    const directiveIdx = rewritten.indexOf('"use client";');
    const runtimeImportIdx = rewritten.indexOf("from '@cumulo/css/runtime'");
    expect(directiveIdx).toBeGreaterThan(-1);
    expect(runtimeImportIdx).toBeGreaterThan(directiveIdx);
    expect(rewritten).toContain('__cumuloStyle(');
  });

  it('extractAndRewrite registers custom breakpoints and serializes responsive recipe config', async () => {
    const code = `
import { recipe } from '@cumulo/css';

export const layout = recipe({
  layer: 'components',
  responsiveVariants: ['gap', 'direction'],
  variants: {
    gap: {
      xs: { gap: '4px' },
      lg: { gap: '24px' },
    },
    direction: {
      row: { flexDirection: 'row' },
      column: { flexDirection: 'column' },
    },
  },
  defaultVariants: {
    direction: 'column',
  },
}, 'resp-test');
`;

    const result = await extractAndRewrite(code, 'ResponsiveDemo.tsx', {
      tablet: '@media (min-width: 720px)',
      cardWide: '@container card (min-width: 520px)',
    });

    expect(result.css).toContain('@media (min-width: 720px)');
    expect(result.css).toContain('@container card (min-width: 520px)');
    expect(result.css).toContain('@layer responsive.bp-tablet, responsive.bp-cardWide;');
    expect(result.responsiveRules?.length).toBe(8);
    expect(result.code).toBeDefined();
    const rewritten = result.code ?? '';
    expect(rewritten).toContain('__cumuloRecipe(');
    expect(rewritten).toContain('"responsive":');
    expect(rewritten).toContain('"tablet":');
    expect(rewritten).toContain('"cardWide":');
    expect(rewritten).not.toContain("from '@cumulo/css'");
  });
});
