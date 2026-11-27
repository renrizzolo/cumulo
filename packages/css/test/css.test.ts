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
  resetSheet,
  getSheetCss,
  LAYER_ORDER,
  LAYER_ORDER_STATEMENT,
} from '../src/index.js';
import { runtimeKeyframes, runtimeRecipe, runtimeStyle, runtimeTheme } from '../src/runtime.js';

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

    it('sets theme contract values via contract.$set() with proper prefix', () => {
      const contract = createThemeContract(
        {
          th: {
            bg: null,
            color: null,
          },
        },
        'table',
      );

      const vars = contract.$set({
        th: {
          bg: '#ffffff',
        },
      });

      expect(vars).toEqual({
        '--table-th-bg': '#ffffff',
      });
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

    it('handles @starting-style and selector-nested @starting-style and @media rules', () => {
      const dialogStyle = style({
        opacity: 0,
        transitionBehavior: 'allow-discrete',
        '@starting-style': {
          opacity: 0,
        },
        selectors: {
          '&[open]': {
            opacity: 1,
            transform: 'scale(1)',
            '@starting-style': {
              opacity: 0,
              transform: 'scale(0.96)',
            },
          },
          '&::backdrop': {
            opacity: 0,
            transition: 'opacity 200ms ease, display 200ms ease allow-discrete',
            '@media': {
              '(prefers-reduced-motion: reduce)': {
                transition: 'none',
              },
            },
          },
          '&[open]::backdrop': {
            opacity: 1,
            '@starting-style': {
              opacity: 0,
            },
          },
        },
      });

      const sheetCss = getSheetCss();
      expect(sheetCss).toContain(
        `.${dialogStyle.className}{opacity:0;transition-behavior:allow-discrete;}`,
      );
      expect(sheetCss).toContain(`@starting-style{.${dialogStyle.className}{opacity:0;}}`);
      expect(sheetCss).toContain(`.${dialogStyle.className}[open]{opacity:1;transform:scale(1);}`);
      expect(sheetCss).toContain(
        `@starting-style{.${dialogStyle.className}[open]{opacity:0;transform:scale(0.96);}}`,
      );
      expect(sheetCss).toContain(
        `@media (prefers-reduced-motion: reduce){.${dialogStyle.className}::backdrop{transition:none;}}`,
      );
      expect(sheetCss).toContain(
        `@starting-style{.${dialogStyle.className}[open]::backdrop{opacity:0;}}`,
      );
    });

    it('deep-merges overlapping selectors and @starting-style across recipe base rules', () => {
      const transitionPreset = {
        opacity: 0,
        selectors: {
          '&:popover-open': {
            opacity: 1,
            transform: 'scale(1)',
            '@starting-style': {
              opacity: 0,
              transform: 'scale(0.96)',
            },
          },
        },
      };

      const menu = recipe({
        base: [
          transitionPreset,
          {
            selectors: {
              '&:popover-open': {
                display: 'flex',
              },
            },
          },
        ],
        variants: {
          size: {
            sm: { padding: 4 },
          },
        },
      });

      const baseClass = menu.classNames.base;
      const sheetCss = getSheetCss();
      expect(sheetCss).toContain(
        `.${baseClass}:popover-open{opacity:1;transform:scale(1);display:flex;}`,
      );
      expect(sheetCss).toContain(
        `@starting-style{.${baseClass}:popover-open{opacity:0;transform:scale(0.96);}}`,
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

  describe('cx', () => {
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
      const condition: boolean = false;
      expect(cx(['arr1', ['arr2', condition && 'arr3']])).toBe('arr1 arr2');
    });
  });

  describe('runtime helpers (@cumulo/css/runtime)', () => {
    it('constructs lightweight style, keyframes, theme, and recipe helpers without touching sheet', () => {
      const s = runtimeStyle('box-abc');
      expect(s.className).toBe('box-abc');
      expect(String(s)).toBe('box-abc');
      expect(cx(s, 'extra')).toBe('box-abc extra');

      const kf = runtimeKeyframes('spin-xyz');
      expect(kf.name).toBe('spin-xyz');
      expect(String(kf)).toBe('spin-xyz');

      const th = runtimeTheme('theme-123', { '--c-bg': '#fff' });
      expect(th.className).toBe('theme-123');
      expect(th.vars).toEqual({ '--c-bg': '#fff' });
      expect(String(th)).toBe('theme-123');

      const btn = runtimeRecipe({
        base: 'btn-base',
        variants: {
          variant: { primary: 'btn-primary', ghost: 'btn-ghost' },
          active: { true: 'btn-active', false: 'btn-inactive' },
          level: { 0: 'btn-l0', 1: 'btn-l1' },
        },
        compoundVariants: [
          { variants: { variant: 'primary', active: true }, className: 'btn-cv' },
          { variants: { level: 1, active: true }, className: 'btn-l1-active' },
        ],
        defaultVariants: { variant: 'primary', active: false, level: 0 },
      });

      expect(btn.variants()).toEqual(['variant', 'active', 'level']);
      expect(btn.classNames.base).toBe('btn-base');
      expect(btn()).toBe('btn-base btn-primary btn-inactive btn-l0');
      expect(btn({ active: true })).toBe('btn-base btn-primary btn-active btn-l0 btn-cv');
      expect(btn({ variant: 'ghost', active: true, level: 1 })).toBe(
        'btn-base btn-ghost btn-active btn-l1 btn-l1-active',
      );
      expect(getSheetCss()).toBe('');
    });

    it('attaches non-enumerable Symbol.for(__CUMULO_META__) metadata on build-time APIs', () => {
      const META = Symbol.for('__CUMULO_META__');

      const s = style({ color: 'red' }, 'meta-s');
      expect(Reflect.get(s, META)).toEqual({ kind: 'style', className: s.className });
      expect(Object.keys(s)).not.toContain(META);

      const c = create({ box: { padding: 8 } }, 'meta-c');
      expect(Reflect.get(c, META)).toEqual({
        kind: 'create',
        entries: { box: c.box.className },
      });
      expect(Object.keys(c)).toEqual(['box']);

      const kf = keyframes({ from: { opacity: 0 }, to: { opacity: 1 } }, 'meta-kf');
      expect(Reflect.get(kf, META)).toEqual({ kind: 'keyframes', name: kf.name });

      const contract = createThemeContract({ bg: null }, 'meta');
      expect(Reflect.get(contract, META)).toEqual({ kind: 'contract' });
      const th = createTheme(contract, { bg: '#000' });
      expect(Reflect.get(th, META)).toEqual({
        kind: 'theme',
        className: th.className,
        vars: { '--meta-bg': '#000' },
      });

      const glob = createGlobalTheme(':root', contract, { bg: '#fff' });
      expect(Reflect.get(glob, META)).toEqual({
        kind: 'global',
        vars: { '--meta-bg': '#fff' },
      });

      const rec = recipe(
        {
          base: { display: 'flex' },
          variants: { level: { 0: { opacity: 1 }, 1: { opacity: 0.5 } } },
          defaultVariants: { level: 0 },
        },
        'meta-rec',
      );
      expect(Reflect.get(rec, META)).toEqual({
        kind: 'recipe',
        config: {
          base: rec.classNames.base,
          variants: rec.classNames.variants,
          defaultVariants: { level: 0 },
        },
      });
    });
  });

  describe('recipe (variants, compound variants, default variants, and extend)', () => {
    it('compiles base styles from single rule or array of rules', () => {
      const singleBase = recipe({
        base: { display: 'flex' },
        variants: {
          variant: { default: {} },
        },
      });
      expect(singleBase()).toContain(singleBase.classNames.base);

      const multiBase = recipe({
        base: [{ display: 'flex' }, { alignItems: 'center' }],
        variants: {
          variant: { default: {} },
        },
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

    it('inherits compound variants from extended recipes and applies them on child recipe invocations', () => {
      const parent = recipe({
        variants: {
          checked: { true: {}, false: {} },
          intent: { default: {}, error: { borderColor: 'red' } },
        },
        compoundVariants: [
          {
            variants: { checked: true, intent: 'error' },
            style: { backgroundColor: 'red', borderColor: 'red' },
          },
        ],
        defaultVariants: {
          intent: 'default',
        },
      });

      const child = recipe({
        extend: [parent],
        variants: {
          checked: {
            true: { backgroundColor: 'blue', borderColor: 'blue' },
            false: {},
          },
        },
        defaultVariants: {
          checked: false,
        },
      });

      // Default: unchecked, default intent -> no compound variant class
      expect(child()).not.toContain('child-cv-0');

      // Checked with default intent: blue -> no compound variant class
      const checkedDefault = child({ checked: true });
      expect(checkedDefault).toContain(child.classNames.variants.checked.true);
      expect(checkedDefault).not.toContain(child.classNames.compoundVariants[0]?.className);

      // Checked with error intent: compound variant applies and compiles red styles
      const checkedError = child({ checked: true, intent: 'error' });
      const compoundClass = child.classNames.compoundVariants[0]?.className;
      expect(compoundClass).toBeDefined();
      expect(checkedError).toContain(compoundClass);
      expect(getSheetCss()).toContain('background-color:red;border-color:red;');
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
        variants: {
          variant: { default: {} },
        },
      });

      expect(simple()).toBe(simple.classNames.base);
      expect(simple(undefined)).toBe(simple.classNames.base);
      expect(simple({})).toBe(simple.classNames.base);
    });

    it('matches runtimeRecipe behavior for null, undefined, booleans, numbers, and compoundVariants', () => {
      const compiled = recipe(
        {
          base: { display: 'flex' },
          variants: {
            size: {
              sm: { padding: 4 },
              md: { padding: 8 },
              null: { padding: 99 },
            },
            active: {
              true: { opacity: 1 },
              false: { opacity: 0.5 },
            },
            level: {
              0: { zIndex: 0 },
              1: { zIndex: 1 },
            },
          },
          compoundVariants: [
            {
              variants: { size: 'sm', active: true },
              style: { fontWeight: 700 },
            },
          ],
          defaultVariants: { size: 'sm', active: true, level: 0 },
        },
        'parity',
      );

      const rt = runtimeRecipe({
        base: compiled.classNames.base,
        variants: compiled.classNames.variants,
        compoundVariants: compiled.classNames.compoundVariants.map((cv) => ({
          variants: {
            ...(cv.variants.size !== undefined ? { size: cv.variants.size } : {}),
            ...(cv.variants.active !== undefined ? { active: cv.variants.active } : {}),
            ...(cv.variants.level !== undefined ? { level: cv.variants.level } : {}),
          },
          className: cv.className,
        })),
        defaultVariants: { size: 'sm', active: true, level: 0 },
      });

      expect(rt()).toBe(compiled());
      expect(rt({ size: undefined, active: true, level: 1 })).toBe(
        compiled({ size: undefined, active: true, level: 1 }),
      );
      expect(rt({ size: 'md', active: false, level: 0 })).toBe(
        compiled({ size: 'md', active: false, level: 0 }),
      );

      // null must clear defaultVariants without stringifying to the "null" variant key or matching compoundVariants
      const nullResult = rt({ size: null, active: true, level: 0 });
      expect(nullResult).not.toContain(compiled.classNames.variants.size.null);
      expect(nullResult).not.toContain(compiled.classNames.variants.size.sm);
      expect(nullResult).not.toContain(compiled.classNames.compoundVariants[0]?.className ?? 'cv');
      expect(nullResult).toContain(compiled.classNames.base ?? '');
      expect(nullResult).toContain(compiled.classNames.variants.active.true);
    });
  });

  describe('cascade layers (@layer)', () => {
    it('wraps style(), create(), createTheme(), and recipe() rules in @layer and isolates hashes', () => {
      const unlayered = style({ padding: '16px' }, 'box');
      const layered = style({ padding: '16px' }, { prefix: 'box', layer: 'components' });

      expect(layered.className).not.toBe(unlayered.className);
      expect(layered.css).toBe(`@layer components{.${layered.className}{padding:16px;}}`);
      expect(unlayered.css).toBe(`.${unlayered.className}{padding:16px;}`);

      const map = create(
        { a: { color: 'red' }, b: { color: 'blue' } },
        { prefix: 'm', layer: 'utilities' },
      );
      expect(map.a.css).toContain('@layer utilities{');
      expect(map.b.css).toContain('@layer utilities{');

      const contract = createThemeContract({ bg: null }, 't');
      const unlayeredTheme = createTheme(contract, { bg: 'white' });
      const layeredTheme = createTheme(contract, { bg: 'white' }, { layer: 'components' });
      expect(layeredTheme.className).not.toBe(unlayeredTheme.className);
      expect(layeredTheme.css).toBe(`@layer components{.${layeredTheme.className}{--t-bg:white;}}`);
    });

    it('propagates layer through recipe() extend and allows child override', () => {
      const parent = recipe(
        {
          layer: 'components',
          variants: {
            size: {
              sm: { padding: 4 },
            },
          },
        },
        'p',
      );

      const inherited = recipe(
        {
          extend: [parent],
          base: { display: 'flex' },
        },
        'c1',
      );

      const overridden = recipe(
        {
          layer: 'utilities',
          extend: [parent],
          base: { display: 'grid' },
        },
        'c2',
      );

      const css = getSheetCss();
      expect(css).toContain(`@layer components{.${inherited.classNames.base}{display:flex;}}`);
      expect(css).toContain(`@layer utilities{.${overridden.classNames.base}{display:grid;}}`);
    });
  });

  describe('responsive variants (@media and @container)', () => {
    it('compiles @media responsive variants in breakpoint order with selectors and layer support', () => {
      const box = recipe(
        {
          layer: 'components',
          breakpoints: {
            sm: '@media (min-width: 640px)',
            md: '@media (min-width: 768px)',
          },
          responsiveVariants: ['padding'],
          variants: {
            padding: {
              sm: {
                padding: '8px',
                selectors: {
                  '& > *': { '--parent-padding': '8px' },
                },
              },
              lg: {
                padding: '24px',
                selectors: {
                  '& > *': { '--parent-padding': '24px' },
                },
              },
            },
          },
        },
        'resp',
      );

      const css = getSheetCss();
      const smClass = box.classNames.responsiveVariants?.padding?.sm?.lg;
      const mdClass = box.classNames.responsiveVariants?.padding?.md?.lg;

      expect(smClass).toBeDefined();
      expect(mdClass).toBeDefined();
      expect(css).toContain(
        `@layer components{@media (min-width: 640px){.${smClass}{padding:24px;}}}`,
      );
      expect(css).toContain(
        `@layer components{@media (min-width: 640px){.${smClass} > *{--parent-padding:24px;}}}`,
      );
      expect(css).toContain(
        `@layer components{@media (min-width: 768px){.${mdClass}{padding:24px;}}}`,
      );

      // Breakpoint order: sm must be emitted before md
      expect(css.indexOf(`.${smClass}`)).toBeLessThan(css.indexOf(`.${mdClass}`));

      // Runtime resolution for primitive and responsive object props
      expect(box({ padding: 'sm' })).toBe(box.classNames.variants.padding.sm);
      const responsiveClasses = box({ padding: { initial: 'sm', md: 'lg' } });
      expect(responsiveClasses).toBe(`${box.classNames.variants.padding.sm} ${mdClass}`);
      expect(box({ padding: { md: 'lg' } })).toBe(mdClass);
    });

    it('supports custom @container query breakpoints', () => {
      const card = recipe(
        {
          breakpoints: {
            compact: '@container card (min-width: 400px)',
            wide: '@container card (min-width: 640px)',
          },
          responsiveVariants: ['layout'],
          variants: {
            layout: {
              stack: { flexDirection: 'column' },
              row: { flexDirection: 'row' },
            },
          },
        },
        'cq',
      );

      const css = getSheetCss();
      const wideRow = card.classNames.responsiveVariants?.layout?.wide?.row;
      expect(wideRow).toBeDefined();
      expect(css).toContain(`@container card (min-width: 640px){.${wideRow}{flex-direction:row;}}`);
      expect(card({ layout: { initial: 'stack', wide: 'row' } })).toBe(
        `${card.classNames.variants.layout.stack} ${wideRow}`,
      );
    });

    it('inherits breakpoints and responsiveVariants through extend and matches runtimeRecipe', () => {
      const paddingRecipe = recipe(
        {
          breakpoints: {
            md: '@media (min-width: 768px)',
          },
          responsiveVariants: ['padding'],
          variants: {
            padding: {
              sm: { padding: '8px' },
              lg: { padding: '24px' },
            },
          },
        },
        'ext-pad',
      );

      const surface = recipe(
        {
          extend: [paddingRecipe],
          base: { display: 'flex' },
          variants: {
            bordered: {
              true: { borderWidth: 1 },
              false: { borderWidth: 0 },
            },
          },
        },
        'ext-surface',
      );

      const result = surface({ padding: { initial: 'sm', md: 'lg' }, bordered: true });
      const mdLg = surface.classNames.responsiveVariants?.padding?.md?.lg;
      expect(mdLg).toBeDefined();
      expect(result).toContain(surface.classNames.variants.padding.sm);
      expect(result).toContain(mdLg);
      expect(result).toContain(surface.classNames.variants.bordered.true);

      const rt = runtimeRecipe({
        base: surface.classNames.base,
        variants: surface.classNames.variants,
        responsiveVariants: surface.classNames.responsiveVariants,
      });
      expect(rt({ padding: { initial: 'sm', md: 'lg' }, bordered: true })).toBe(result);
    });

    it('falls back to the default variant when a responsive object omits `initial`', () => {
      const box = recipe(
        {
          breakpoints: { md: '@media (min-width: 768px)' },
          responsiveVariants: ['gap'],
          variants: { gap: { sm: { gap: 4 }, lg: { gap: 16 } } },
          defaultVariants: { gap: 'sm' },
        },
        'dflt',
      );
      const mdLg = box.classNames.responsiveVariants?.gap?.md?.lg;
      expect(box({ gap: { md: 'lg' } })).toBe(`${box.classNames.variants.gap.sm} ${mdLg}`);
    });

    it('does not apply compound variants to responsive values and rejects them at the type level', () => {
      const button = recipe(
        {
          breakpoints: { md: '@media (min-width: 768px)' },
          responsiveVariants: ['size'],
          variants: {
            size: { sm: { fontSize: 12 }, lg: { fontSize: 18 } },
            tone: { loud: { color: 'red' }, quiet: { color: 'grey' } },
          },
          compoundVariants: [
            { variants: { tone: 'loud' }, style: { fontWeight: 700 } },
            // @ts-expect-error `size` is responsive, so it cannot appear in a compound variant
            { variants: { size: 'lg' }, style: { textTransform: 'uppercase' } },
          ],
        },
        'cmp',
      );
      const [toneCompound, sizeCompound] = button.classNames.compoundVariants;
      expect(button({ tone: 'loud' })).toContain(toneCompound?.className);
      expect(button({ size: 'lg' })).toContain(sizeCompound?.className);
      expect(button({ size: { initial: 'lg' } })).not.toContain(sizeCompound?.className);
    });

    it('rejects bare media queries as breakpoints at the type level', () => {
      recipe(
        {
          breakpoints: {
            // @ts-expect-error breakpoints must be full at-rules such as `@media (...)`
            sm: '(min-width: 640px)',
          },
          responsiveVariants: ['gap'],
          variants: { gap: { sm: { gap: 4 } } },
        },
        'bad-bp',
      );
    });

    it('requires breakpoints and responsiveVariants to be paired at the type level', () => {
      recipe(
        // @ts-expect-error responsiveVariants without breakpoints
        {
          responsiveVariants: ['gap'],
          variants: { gap: { sm: { gap: 4 } } },
        },
        'missing-bp',
      );

      recipe(
        // @ts-expect-error breakpoints without responsiveVariants
        {
          breakpoints: { sm: '@media (min-width: 640px)' },
          variants: { gap: { sm: { gap: 4 } } },
        },
        'missing-rv',
      );

      recipe(
        // @ts-expect-error empty breakpoints map
        {
          breakpoints: {},
          responsiveVariants: ['gap'],
          variants: { gap: { sm: { gap: 4 } } },
        },
        'empty-bp',
      );
    });

    it('reuses parent variant classes on extend() unless overridden, relayered, or overlapping base', () => {
      const parent = recipe(
        {
          layer: 'components',
          breakpoints: { md: '@media (min-width: 768px)' },
          responsiveVariants: ['gap'],
          variants: {
            gap: { sm: { gap: '8px' }, lg: { gap: '24px' } },
          },
        },
        'parent',
      );

      const child = recipe(
        {
          layer: 'components',
          extend: [parent],
          base: { display: 'flex' },
        },
        'child',
      );

      expect(child.classNames.variants.gap.sm).toBe(parent.classNames.variants.gap.sm);
      expect(child.classNames.responsiveVariants?.gap?.md?.lg).toBe(
        parent.classNames.responsiveVariants?.gap?.md?.lg,
      );

      // Different layer must compile a fresh class
      const relayered = recipe(
        {
          layer: 'utilities',
          extend: [parent],
          base: { display: 'flex' },
        },
        'relayered',
      );
      expect(relayered.classNames.variants.gap.sm).not.toBe(parent.classNames.variants.gap.sm);

      // Overlapping base property must compile a fresh class so variant wins source order
      const overlapping = recipe(
        {
          layer: 'components',
          extend: [parent],
          base: { gap: '4px' },
        },
        'overlapping',
      );
      expect(overlapping.classNames.variants.gap.sm).not.toBe(parent.classNames.variants.gap.sm);
    });
  });

  describe('layers and at-rule wrapping', () => {
    it('wraps rules as @layer > at-rule > rule and isolates layered hashes', () => {
      const plain = style({ color: 'red' });
      const layered = style({ color: 'red' }, { layer: 'components' });
      const wrapped = style(
        { color: 'red' },
        { layer: 'components', atRule: '@media (min-width: 640px)' },
      );

      expect(layered.className).not.toBe(plain.className);
      expect(wrapped.className).not.toBe(layered.className);
      expect(layered.css).toBe(`@layer components{.${layered.className}{color:red;}}`);
      expect(wrapped.css).toBe(
        `@layer components{@media (min-width: 640px){.${wrapped.className}{color:red;}}}`,
      );
    });

    it('keeps the empty-rule hash stable regardless of layer', () => {
      expect(style({}, { layer: 'components' }).className).toBe(style({}).className);
    });

    it('declares the canonical layer order once', () => {
      expect(LAYER_ORDER_STATEMENT).toBe(`@layer ${LAYER_ORDER.join(', ')};`);
    });
  });
});
