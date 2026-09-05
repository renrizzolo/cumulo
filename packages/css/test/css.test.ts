import { describe, it, expect, beforeEach } from 'vitest';
import {
  createThemeContract,
  createTheme,
  createGlobalTheme,
  create,
  style,
  recipe,
  keyframes,
  cx,
  props,
  resetSheet,
  getSheetCss,
} from '../src/index.js';

describe('@cumulo/css', () => {
  beforeEach(() => {
    resetSheet();
  });

  describe('createThemeContract & createTheme', () => {
    it('creates theme contract and scoped theme with css variables', () => {
      const contract = createThemeContract({
        color: {
          primary: null,
          background: null,
          nested: {
            deep: null,
          },
        },
        space: {
          sm: null,
          md: null,
        },
      });

      expect(contract.color.primary).toBe('var(--c-color-primary)');
      expect(contract.color.background).toBe('var(--c-color-background)');
      expect(contract.color.nested.deep).toBe('var(--c-color-nested-deep)');
      expect(contract.space.md).toBe('var(--c-space-md)');

      const theme = createTheme(contract, {
        color: {
          primary: '#3b82f6',
          background: '#ffffff',
          nested: {
            deep: '#1d4ed8',
          },
        },
        space: {
          sm: '4px',
          md: '8px',
        },
      });

      expect(theme.className).toMatch(/^theme-/);
      expect(theme.vars['--c-color-primary']).toBe('#3b82f6');
      expect(theme.vars['--c-color-nested-deep']).toBe('#1d4ed8');
      expect(theme.vars['--c-space-md']).toBe('8px');

      const sheetCss = getSheetCss();
      expect(sheetCss).toContain(`.${theme.className}`);
      expect(sheetCss).toContain('--c-color-primary:#3b82f6');
      expect(sheetCss).toContain('--c-color-nested-deep:#1d4ed8');
    });

    it('creates global theme on specified selector', () => {
      const contract = createThemeContract({
        color: { brand: null, accent: null },
      });

      createGlobalTheme(':root', contract, {
        color: { brand: '#6366f1', accent: '#ec4899' },
      });

      const sheetCss = getSheetCss();
      expect(sheetCss).toContain(':root{--c-color-brand:#6366f1;--c-color-accent:#ec4899;}');
    });
  });

  describe('style & create', () => {
    it('serializes CSS properties, handles unit conversions, and unitless properties', () => {
      const cardStyle = style({
        display: 'flex',
        flexDirection: 'column',
        padding: 16,
        margin: 0,
        borderRadius: 8,
        lineHeight: 1.5,
        opacity: 0.9,
        zIndex: 10,
        flex: 1,
        fontWeight: 600,
      });

      expect(cardStyle.className).toMatch(/^c-/);
      expect(String(cardStyle)).toBe(cardStyle.className);

      const sheetCss = getSheetCss();
      expect(sheetCss).toContain(`.${cardStyle.className}`);
      expect(sheetCss).toContain('padding:16px;');
      expect(sheetCss).toContain('border-radius:8px;');
      expect(sheetCss).toContain('line-height:1.5;');
      expect(sheetCss).toContain('opacity:0.9;');
      expect(sheetCss).toContain('z-index:10;');
      expect(sheetCss).toContain('flex:1;');
      expect(sheetCss).toContain('font-weight:600;');
    });

    it('handles pseudo-classes, direct & selectors, and selectors map', () => {
      const interactiveStyle = style({
        color: 'black',
        ':hover': { color: 'blue' },
        ':focus-visible': { outline: '2px solid blue' },
        ':disabled': { opacity: 0.5 },
        selectors: {
          '&[data-state="active"]': { fontWeight: 700 },
          '&:first-child': { marginTop: 0 },
          '& > svg': { width: 16, height: 16 },
        },
      });

      const sheetCss = getSheetCss();
      expect(sheetCss).toContain(`.${interactiveStyle.className}:hover{color:blue;}`);
      expect(sheetCss).toContain(
        `.${interactiveStyle.className}:focus-visible{outline:2px solid blue;}`,
      );
      expect(sheetCss).toContain(`.${interactiveStyle.className}:disabled{opacity:0.5;}`);
      expect(sheetCss).toContain(
        `.${interactiveStyle.className}[data-state="active"]{font-weight:700;}`,
      );
      expect(sheetCss).toContain(`.${interactiveStyle.className}:first-child{margin-top:0;}`);
      expect(sheetCss).toContain(`.${interactiveStyle.className} > svg{width:16px;height:16px;}`);
    });

    it('handles @media, @container, and @supports queries', () => {
      const responsiveStyle = style({
        padding: 8,
        '@media': {
          '(min-width: 600px)': { padding: 16 },
          '@media (min-width: 1024px)': { padding: 24 },
        },
        '@container': {
          '(max-width: 400px)': { padding: 4 },
        },
        '@supports': {
          '(display: grid)': { display: 'grid' },
        },
      });

      const sheetCss = getSheetCss();
      expect(sheetCss).toContain(
        `@media (min-width: 600px){.${responsiveStyle.className}{padding:16px;}}`,
      );
      expect(sheetCss).toContain(
        `@media (min-width: 1024px){.${responsiveStyle.className}{padding:24px;}}`,
      );
      expect(sheetCss).toContain(
        `@container (max-width: 400px){.${responsiveStyle.className}{padding:4px;}}`,
      );
      expect(sheetCss).toContain(
        `@supports (display: grid){.${responsiveStyle.className}{display:grid;}}`,
      );
    });

    it('creates named style mappings with create()', () => {
      const styles = create({
        header: { padding: 12 },
        body: { fontSize: 14 },
      });

      expect(styles.header.className).toMatch(/^c-header-/);
      expect(styles.body.className).toMatch(/^c-body-/);
      expect(getSheetCss()).toContain('padding:12px;');
      expect(getSheetCss()).toContain('font-size:14px;');
    });
  });

  describe('keyframes', () => {
    it('creates keyframe animations and inserts @keyframes rule', () => {
      const pulse = keyframes({
        '0%': { transform: 'scale(1)' },
        '50%': { transform: 'scale(1.05)' },
        '100%': { transform: 'scale(1)' },
      });

      expect(pulse.name).toMatch(/^k-/);
      const sheetCss = getSheetCss();
      expect(sheetCss).toContain(`@keyframes ${pulse.name}`);
      expect(sheetCss).toContain('0%{transform:scale(1);}');
      expect(sheetCss).toContain('50%{transform:scale(1.05);}');
      expect(sheetCss).toContain('100%{transform:scale(1);}');
    });
  });

  describe('cx and props', () => {
    it('merges classnames, compiled styles, themes, and handles falsy values', () => {
      const s1 = style({ color: 'red' });
      const s2 = style({ background: 'blue' });

      expect(cx(s1, s2)).toBe(`${s1.className} ${s2.className}`);
      expect(cx('base', false, null, undefined, '', 'extra')).toBe('base extra');
      expect(
        cx('btn', {
          active: true,
          disabled: false,
          loading: null,
          visible: undefined,
        }),
      ).toBe('btn active');
      const condition = Boolean(false);
      expect(cx(['arr1', ['arr2', condition && 'arr3']])).toBe('arr1 arr2');
    });

    it('merges classNames and style objects with props()', () => {
      const s1 = style({ color: 'green' });
      const result = props(s1, 'extra-class', { style: { zIndex: 5, opacity: 0.8 } });

      expect(result.className).toBe(`${s1.className} extra-class`);
      expect(result.style).toEqual({ zIndex: 5, opacity: 0.8 });

      const plain = props('simple');
      expect(plain.className).toBe('simple');
      expect(plain.style).toBeUndefined();
    });
  });

  describe('recipe (variants, compound variants, default variants, and extend)', () => {
    it('compiles base styles from single rule or array of rules', () => {
      const singleBase = recipe({
        base: { display: 'flex' },
      });
      expect(singleBase()).toContain(singleBase.classNames.base);

      const multiBase = recipe({
        base: [{ display: 'flex' }, { alignItems: 'center' }],
      });
      expect(multiBase()).toContain(multiBase.classNames.base);
      expect(getSheetCss()).toContain('display:flex;align-items:center;');
    });

    it('resolves default variants and allows selective or full overrides', () => {
      const pill = recipe({
        base: { display: 'inline-flex' },
        variants: {
          size: {
            sm: { padding: '4px 8px' },
            lg: { padding: '8px 16px' },
          },
          variant: {
            solid: { background: 'black', color: 'white' },
            outline: { background: 'transparent', borderColor: 'black' },
          },
        },
        defaultVariants: {
          size: 'sm',
          variant: 'solid',
        },
      });

      // Default resolution
      const defaults = pill();
      expect(defaults).toContain(pill.classNames.base);
      expect(defaults).toContain(pill.classNames.variants.size.sm);
      expect(defaults).toContain(pill.classNames.variants.variant.solid);

      // Partial override (overrides size, keeps default variant)
      const overriddenSize = pill({ size: 'lg' });
      expect(overriddenSize).toContain(pill.classNames.variants.size.lg);
      expect(overriddenSize).toContain(pill.classNames.variants.variant.solid);

      // Full override
      const fullOverride = pill({ size: 'lg', variant: 'outline' });
      expect(fullOverride).toContain(pill.classNames.variants.size.lg);
      expect(fullOverride).toContain(pill.classNames.variants.variant.outline);
      expect(fullOverride).not.toContain(pill.classNames.variants.size.sm);
      expect(fullOverride).not.toContain(pill.classNames.variants.variant.solid);
    });

    it('supports boolean variants mapped from boolean and string values', () => {
      const toggle = recipe({
        variants: {
          active: {
            true: { fontWeight: 'bold' },
            false: { fontWeight: 'normal' },
          },
        },
        defaultVariants: {
          active: false,
        },
      });

      expect(toggle()).toContain(toggle.classNames.variants.active.false);
      expect(toggle({ active: true })).toContain(toggle.classNames.variants.active.true);
      expect(toggle({ active: 'true' })).toContain(toggle.classNames.variants.active.true);
      expect(toggle({ active: false })).toContain(toggle.classNames.variants.active.false);
      expect(toggle({ active: 'false' })).toContain(toggle.classNames.variants.active.false);
    });

    it('applies compound variants only when all specified conditions match', () => {
      const badge = recipe({
        variants: {
          color: {
            red: { color: 'red' },
            blue: { color: 'blue' },
          },
          variant: {
            subtle: { opacity: 0.7 },
            solid: { opacity: 1 },
          },
        },
        compoundVariants: [
          {
            variants: { color: 'red', variant: 'solid' },
            style: { border: '2px solid red' },
          },
        ],
      });

      expect(badge.classNames.compoundVariants.length).toBe(1);
      const compoundClass = badge.classNames.compoundVariants[0]?.className;

      // Partial matches do not trigger compound class
      expect(badge({ color: 'red', variant: 'subtle' })).not.toContain(compoundClass);
      expect(badge({ color: 'blue', variant: 'solid' })).not.toContain(compoundClass);

      // Exact match triggers compound class
      expect(badge({ color: 'red', variant: 'solid' })).toContain(compoundClass);
      expect(getSheetCss()).toContain('border:2px solid red;');
    });

    it('supports extend with single parent, multiple parents, and recursive extends', () => {
      // Base layer 1: shared sizing
      const sizing = recipe({
        variants: {
          size: {
            sm: { fontSize: 12, padding: 4 },
            md: { fontSize: 14, padding: 8 },
          },
        },
        defaultVariants: {
          size: 'md',
        },
      });

      // Layer 2: shared intents extending sizing
      const intentStyles = recipe({
        extend: sizing,
        variants: {
          intent: {
            primary: { background: 'blue' },
            danger: { background: 'red' },
          },
        },
        defaultVariants: {
          intent: 'primary',
        },
      });

      // Layer 3: component recipe extending intentStyles with local base and variants
      const button = recipe({
        extend: [intentStyles],
        base: { cursor: 'pointer' },
        variants: {
          shape: {
            square: { borderRadius: 0 },
            round: { borderRadius: 9999 },
          },
        },
        compoundVariants: [
          {
            variants: { size: 'sm', intent: 'danger' },
            style: { outline: '1px solid darkred' },
          },
        ],
      });

      // Check variant keys reported by variants() method
      const allVariantKeys = button.variants();
      expect(allVariantKeys).toContain('size');
      expect(allVariantKeys).toContain('intent');
      expect(allVariantKeys).toContain('shape');

      // Check default resolution inherits from extended recipes
      const defaultClasses = button();
      expect(defaultClasses).toContain(button.classNames.base);
      expect(defaultClasses).toContain(button.classNames.variants.size.md);
      expect(defaultClasses).toContain(button.classNames.variants.intent.primary);

      // Custom invocation combining extended and local variants
      const customClasses = button({
        size: 'sm',
        intent: 'danger',
        shape: 'round',
      });
      expect(customClasses).toContain(button.classNames.base);
      expect(customClasses).toContain(button.classNames.variants.size.sm);
      expect(customClasses).toContain(button.classNames.variants.intent.danger);
      expect(customClasses).toContain(button.classNames.variants.shape.round);

      // Compound variant across extended variants works
      const compoundClass = button.classNames.compoundVariants[0]?.className;
      expect(customClasses).toContain(compoundClass);
      expect(getSheetCss()).toContain('outline:1px solid darkred;');
    });

    it('handles recipe options objects in extend as well as recipe functions', () => {
      const rawOptions = {
        variants: {
          elevation: {
            low: { boxShadow: '0 1px 2px rgba(0,0,0,0.1)' },
            high: { boxShadow: '0 4px 8px rgba(0,0,0,0.2)' },
          },
        },
      };

      const surface = recipe({
        extend: rawOptions,
        base: { background: 'white' },
      });

      expect(surface.variants()).toContain('elevation');
      const highClasses = surface({ elevation: 'high' });
      expect(highClasses).toContain(surface.classNames.variants.elevation.high);
    });

    it('gracefully handles empty options or undefined invocations', () => {
      const simple = recipe({
        base: { margin: 0 },
      });

      expect(simple()).toBe(simple.classNames.base);
      expect(simple(undefined)).toBe(simple.classNames.base);
      expect(simple({})).toBe(simple.classNames.base);
    });
  });
});
