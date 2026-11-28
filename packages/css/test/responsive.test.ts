import { describe, it, expect, beforeEach, expectTypeOf } from 'vitest';

import {
  recipe,
  createRecipe,
  configureBreakpoints,
  getBreakpoints,
  resetBreakpoints,
  defineBreakpoints,
  normalizeBreakpointQuery,
  getSheetCss,
  getBaseCss,
  getResponsiveRules,
  formatResponsiveCss,
  resetSheet,
  LAYER_ORDER,
  LAYER_ORDER_STATEMENT,
  type RecipeVariants,
} from '../src/index.js';
import { CUMULO_META_KEY } from '../src/meta.js';
import { runtimeRecipe, type RuntimeRecipeConfig } from '../src/runtime.js';

function isRuntimeRecipeConfig(value: unknown): value is RuntimeRecipeConfig {
  return (
    typeof value === 'object' &&
    value !== null &&
    'variants' in value &&
    typeof value.variants === 'object' &&
    value.variants !== null
  );
}

describe('@cumulo/css responsive variants', () => {
  beforeEach(() => {
    resetSheet();
    resetBreakpoints();
  });

  it('normalizes media queries, container queries, style queries, and length shorthands', () => {
    expect(normalizeBreakpointQuery('640px')).toBe('@media (min-width: 640px)');
    expect(normalizeBreakpointQuery('48rem')).toBe('@media (min-width: 48rem)');
    expect(normalizeBreakpointQuery('(min-width: 768px)')).toBe('@media (min-width: 768px)');
    expect(normalizeBreakpointQuery('@media (min-width: 1024px)')).toBe(
      '@media (min-width: 1024px)',
    );
    expect(normalizeBreakpointQuery('@container (min-width: 400px)')).toBe(
      '@container (min-width: 400px)',
    );
    expect(normalizeBreakpointQuery('@container card (min-width: 600px)')).toBe(
      '@container card (min-width: 600px)',
    );
    expect(
      normalizeBreakpointQuery('@container style(--theme-viewport-md: var(--theme-breakpoint-md))'),
    ).toBe('@container style(--theme-viewport-md: var(--theme-breakpoint-md))');
  });

  it('compiles responsiveVariants on opt-in variants only and resolves responsive objects', () => {
    const stack = recipe(
      {
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
          inline: {
            true: { display: 'inline-flex' },
            false: { display: 'flex' },
          },
        },
        defaultVariants: {
          direction: 'column',
          gap: 'lg',
        },
      },
      'stack',
    );

    // Non-responsive variant must NOT emit responsive classes
    expect(stack.classNames.responsive?.inline).toBeUndefined();
    expect(stack.classNames.responsive?.gap?.md?.xs).toBeDefined();
    expect(stack.classNames.responsive?.direction?.md?.row).toBeDefined();

    // Explicit initial + breakpoint
    const explicit = stack({ gap: { initial: 'lg', md: 'xs' } });
    expect(explicit).toContain(stack.classNames.variants.gap.lg);
    expect(explicit).toContain(stack.classNames.responsive?.gap?.md?.xs ?? '');

    // Omitting initial falls back to defaultVariants
    const inheritedInitial = stack({ direction: { md: 'row' } });
    expect(inheritedInitial).toContain(stack.classNames.variants.direction.column);
    expect(inheritedInitial).toContain(stack.classNames.responsive?.direction?.md?.row ?? '');

    // Scalar value works as before
    const scalar = stack({ gap: 'xs', direction: 'row', inline: true });
    expect(scalar).toContain(stack.classNames.variants.gap.xs);
    expect(scalar).toContain(stack.classNames.variants.direction.row);
    expect(scalar).toContain(stack.classNames.variants.inline.true);

    // Type-level verification
    type StackV = RecipeVariants<typeof stack>;
    expectTypeOf<StackV['gap']>().toEqualTypeOf<
      | 'xs'
      | 'lg'
      | {
          initial?: 'xs' | 'lg';
          sm?: 'xs' | 'lg';
          md?: 'xs' | 'lg';
          lg?: 'xs' | 'lg';
          xl?: 'xs' | 'lg';
          '2xl'?: 'xs' | 'lg';
        }
      | undefined
    >();
    expectTypeOf<StackV['inline']>().toEqualTypeOf<boolean | 'true' | 'false' | undefined>();
  });

  it('supports per-variant breakpoint subsets to avoid generating unused breakpoints', () => {
    const section = recipe(
      {
        layer: 'components',
        responsiveVariants: {
          gap: ['sm', 'md'],
          direction: ['md'],
        },
        variants: {
          gap: {
            sm: { gap: '8px' },
            lg: { gap: '24px' },
          },
          direction: {
            row: { flexDirection: 'row' },
            column: { flexDirection: 'column' },
          },
        },
      },
      'section',
    );

    expect(Object.keys(section.classNames.responsive?.gap ?? {})).toEqual(['sm', 'md']);
    expect(Object.keys(section.classNames.responsive?.direction ?? {})).toEqual(['md']);

    const css = getSheetCss();
    expect(css).toContain('@media (min-width: 640px)');
    expect(css).toContain('@media (min-width: 768px)');
    expect(css).not.toContain('@media (min-width: 1024px)');
    expect(css).not.toContain('@media (min-width: 1280px)');
    expect(css).not.toContain('@media (min-width: 1440px)');

    type SectionV = RecipeVariants<typeof section>;
    expectTypeOf<SectionV['direction']>().toEqualTypeOf<
      'row' | 'column' | { initial?: 'row' | 'column'; md?: 'row' | 'column' } | undefined
    >();
  });

  it('deduplicates identical responsive rules across different recipes and groups them by at-rule', () => {
    const stack = recipe(
      {
        layer: 'components',
        responsiveVariants: { gap: ['md'] },
        variants: {
          gap: {
            xs: { gap: 'var(--theme-spacing-xs)' },
            lg: { gap: 'var(--theme-spacing-lg)' },
          },
        },
      },
      'stack',
    );

    const grid = recipe(
      {
        layer: 'components',
        responsiveVariants: { gap: ['md'] },
        variants: {
          gap: {
            xs: { gap: 'var(--theme-spacing-xs)' },
            lg: { gap: 'var(--theme-spacing-lg)' },
          },
        },
      },
      'grid',
    );

    // Identical responsive rules produce the exact same class name across recipes
    expect(stack.classNames.responsive?.gap?.md?.xs).toBe(grid.classNames.responsive?.gap?.md?.xs);
    expect(stack.classNames.responsive?.gap?.md?.lg).toBe(grid.classNames.responsive?.gap?.md?.lg);

    const rules = getResponsiveRules();
    expect(rules).toHaveLength(2);

    // Grouped into a single @media (min-width: 768px) block inside @layer responsive.bp-md
    const css = getSheetCss();
    const mediaMatches = css.match(/@media \(min-width: 768px\)/g) ?? [];
    expect(mediaMatches).toHaveLength(1);
    expect(css).toContain('@layer responsive.bp-md{@media (min-width: 768px){');
  });

  it('emits valid CSS sub-layer order header including digit-leading breakpoints like 2xl', () => {
    recipe(
      {
        layer: 'components',
        responsiveVariants: { gap: ['2xl', 'sm'] },
        variants: {
          gap: {
            sm: { gap: '8px' },
          },
        },
      },
      'box',
    );

    expect(LAYER_ORDER).toContain('responsive');
    expect(LAYER_ORDER_STATEMENT).toBe('@layer reset, base, components, responsive, utilities;');

    const css = getSheetCss();
    expect(css).toContain(
      '@layer responsive.bp-sm, responsive.bp-md, responsive.bp-lg, responsive.bp-xl, responsive.bp-2xl;',
    );
    // sm block must appear before 2xl block even though '2xl' was listed first in subset
    const smIndex = css.indexOf('@layer responsive.bp-sm{');
    const twoXlIndex = css.indexOf('@layer responsive.bp-2xl{');
    expect(smIndex).toBeGreaterThan(-1);
    expect(twoXlIndex).toBeGreaterThan(smIndex);
  });

  it('supports custom @container size queries, named containers, and Piccalilli @container style() queries', () => {
    const card = recipe(
      {
        layer: 'components',
        breakpoints: {
          compact: '@container card (max-width: 400px)',
          wide: '@container card (min-width: 600px)',
          styleMd: '@container style(--theme-viewport-md: var(--theme-breakpoint-md))',
        },
        responsiveVariants: ['layout'],
        variants: {
          layout: {
            stacked: { flexDirection: 'column' },
            horizontal: { flexDirection: 'row' },
          },
        },
      },
      'card',
    );

    const cls = card({ layout: { initial: 'stacked', wide: 'horizontal', styleMd: 'horizontal' } });
    expect(cls).toContain(card.classNames.variants.layout.stacked);
    expect(cls).toContain(card.classNames.responsive?.layout?.wide?.horizontal ?? '');
    expect(cls).toContain(card.classNames.responsive?.layout?.styleMd?.horizontal ?? '');

    const css = getSheetCss();
    expect(css).toContain('@container card (max-width: 400px)');
    expect(css).toContain('@container card (min-width: 600px)');
    expect(css).toContain('@container style(--theme-viewport-md: var(--theme-breakpoint-md))');

    type CardV = RecipeVariants<typeof card>;
    expectTypeOf<CardV['layout']>().toEqualTypeOf<
      | 'stacked'
      | 'horizontal'
      | {
          initial?: 'stacked' | 'horizontal';
          compact?: 'stacked' | 'horizontal';
          wide?: 'stacked' | 'horizontal';
          styleMd?: 'stacked' | 'horizontal';
        }
      | undefined
    >();
  });

  it('supports configureBreakpoints() and createRecipe() factory', () => {
    configureBreakpoints({
      tablet: '700px',
      desktop: '@media (min-width: 1100px)',
    });

    expect(getBreakpoints()).toEqual({
      tablet: '@media (min-width: 700px)',
      desktop: '@media (min-width: 1100px)',
    });

    const r = recipe({
      responsiveVariants: ['gap'],
      variants: {
        gap: { sm: { gap: '8px' } },
      },
    });
    expect(Object.keys(r.classNames.responsive?.gap ?? {})).toEqual(['tablet', 'desktop']);

    const panelBreakpoints = defineBreakpoints({
      panelSm: '@container panel (min-width: 320px)',
      panelLg: '@container panel (min-width: 640px)',
    });
    const panelRecipe = createRecipe(panelBreakpoints);
    const panel = panelRecipe({
      responsiveVariants: ['padding'],
      variants: {
        padding: {
          sm: { padding: '8px' },
          lg: { padding: '24px' },
        },
      },
    });

    const out = panel({ padding: { initial: 'sm', panelLg: 'lg' } });
    expect(out).toContain(panel.classNames.variants.padding.sm);
    expect(out).toContain(panel.classNames.responsive?.padding?.panelLg?.lg ?? '');
  });

  it('propagates responsiveVariants through extend and handles complex selectors inside responsive rules', () => {
    const parent = recipe({
      layer: 'components',
      responsiveVariants: ['padding'],
      variants: {
        padding: {
          md: {
            padding: '16px',
            selectors: {
              '& > *': {
                '--parent-padding': '16px',
              },
            },
          },
        },
      },
    });

    const child = recipe({
      extend: [parent],
      responsiveVariants: ['direction'],
      variants: {
        direction: {
          row: { flexDirection: 'row' },
          column: { flexDirection: 'column' },
        },
      },
    });

    const cls = child({ padding: { md: 'md' }, direction: { lg: 'row' } });
    expect(cls).toContain(child.classNames.responsive?.padding?.md?.md ?? '');
    expect(cls).toContain(child.classNames.responsive?.direction?.lg?.row ?? '');

    const css = getSheetCss();
    const mdPadClass = child.classNames.responsive?.padding?.md?.md ?? '';
    expect(css).toContain(`.${mdPadClass}{padding:16px;}`);
    expect(css).toContain(`.${mdPadClass} > *{--parent-padding:16px;}`);
  });

  it('serializes responsive config into __CUMULO_META__ for runtimeRecipe() and evaluates compoundVariants against initial', () => {
    const compiled = recipe(
      {
        layer: 'components',
        responsiveVariants: { size: ['md'] },
        variants: {
          size: {
            sm: { fontSize: '12px' },
            lg: { fontSize: '18px' },
          },
          bold: {
            true: { fontWeight: 700 },
            false: { fontWeight: 400 },
          },
        },
        compoundVariants: [
          {
            variants: { size: 'sm', bold: true },
            style: { letterSpacing: '0.02em' },
          },
        ],
        defaultVariants: {
          size: 'sm',
          bold: true,
        },
      },
      'txt',
    );

    const meta: unknown = Reflect.get(compiled, CUMULO_META_KEY);
    if (
      typeof meta !== 'object' ||
      meta === null ||
      !('kind' in meta) ||
      meta.kind !== 'recipe' ||
      !('config' in meta) ||
      !isRuntimeRecipeConfig(meta.config)
    ) {
      throw new Error('Expected recipe metadata with config');
    }

    const rt = runtimeRecipe(meta.config);
    const out = rt({ size: { md: 'lg' } });

    expect(out).toContain(compiled.classNames.variants.size.sm);
    expect(out).toContain(compiled.classNames.responsive?.size?.md?.lg ?? '');
    expect(out).toContain(compiled.classNames.compoundVariants[0]?.className ?? '');

    // Verify getBaseCss vs formatResponsiveCss separation
    expect(getBaseCss()).not.toContain('@media (min-width: 768px)');
    expect(formatResponsiveCss(getResponsiveRules())).toContain('@media (min-width: 768px)');
  });
});
