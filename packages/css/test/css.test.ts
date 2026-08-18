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

  it('creates theme contract and scoped theme', () => {
    const contract = createThemeContract({
      color: {
        primary: null,
        background: null,
      },
      space: {
        sm: null,
        md: null,
      },
    });

    expect(contract.color.primary).toBe('var(--c-color-primary)');
    expect(contract.space.md).toBe('var(--c-space-md)');

    const theme = createTheme(contract, {
      color: {
        primary: '#3b82f6',
        background: '#ffffff',
      },
      space: {
        sm: '4px',
        md: '8px',
      },
    });

    expect(theme.className).toMatch(/^theme-/);
    expect(theme.vars['--c-color-primary']).toBe('#3b82f6');
    expect(theme.vars['--c-space-md']).toBe('8px');
    expect(getSheetCss()).toContain(`.${theme.className}`);
    expect(getSheetCss()).toContain('--c-color-primary:#3b82f6');
  });

  it('creates global theme', () => {
    const contract = createThemeContract({
      color: { brand: null },
    });

    createGlobalTheme(':root', contract, {
      color: { brand: '#6366f1' },
    });

    expect(getSheetCss()).toContain(':root{--c-color-brand:#6366f1;}');
  });

  it('creates style rules with style() and create()', () => {
    const buttonStyle = style({
      display: 'inline-flex',
      alignItems: 'center',
      padding: '8px 16px',
      borderRadius: 6,
      ':hover': {
        opacity: 0.85,
      },
      '@media': {
        '(min-width: 600px)': {
          padding: '12px 24px',
        },
      },
    });

    expect(buttonStyle.className).toMatch(/^c-/);
    expect(String(buttonStyle)).toBe(buttonStyle.className);

    const sheetCss = getSheetCss();
    expect(sheetCss).toContain(
      `.${buttonStyle.className}{display:inline-flex;align-items:center;padding:8px 16px;border-radius:6px;}`,
    );
    expect(sheetCss).toContain(`.${buttonStyle.className}:hover{opacity:0.85;}`);
    expect(sheetCss).toContain(
      `@media (min-width: 600px){.${buttonStyle.className}{padding:12px 24px;}}`,
    );

    const styles = create({
      card: { padding: 16 },
      title: { fontSize: 20, fontWeight: 700 },
    });

    expect(styles.card.className).toMatch(/^c-card-/);
    expect(styles.title.className).toMatch(/^c-title-/);
  });

  it('creates keyframe animations', () => {
    const fadeIn = keyframes({
      from: { opacity: 0, transform: 'translateY(4px)' },
      to: { opacity: 1, transform: 'translateY(0)' },
    });

    expect(fadeIn.name).toMatch(/^k-/);
    expect(getSheetCss()).toContain(
      `@keyframes ${fadeIn.name}{from{opacity:0;transform:translateY(4px);}to{opacity:1;transform:translateY(0);}}`,
    );
  });

  it('merges classnames and styles with cx and props', () => {
    const s1 = style({ color: 'red' });
    const s2 = style({ background: 'blue' });

    expect(cx(s1, s2)).toBe(`${s1.className} ${s2.className}`);
    const isHidden = false;
    const isActive = true;
    expect(
      cx('base', isHidden && 'hidden', isActive && 'active', {
        disabled: true,
        loading: false,
      }),
    ).toBe('base active disabled');

    const result = props(s1, { style: { zIndex: 10 } });
    expect(result.className).toBe(s1.className);
    expect(result.style).toEqual({ zIndex: 10 });
  });

  it('creates zero-runtime recipes with variants, defaultVariants, and compoundVariants', () => {
    const button = recipe({
      base: {
        display: 'inline-flex',
        alignItems: 'center',
        fontWeight: 500,
      },
      variants: {
        variant: {
          primary: { background: 'blue', color: 'white' },
          secondary: { background: 'gray', color: 'black' },
          outline: { background: 'transparent', borderColor: 'gray' },
        },
        size: {
          small: { height: 32, padding: '0 8px' },
          medium: { height: 40, padding: '0 16px' },
        },
        fullWidth: {
          true: { width: '100%' },
          false: { width: 'auto' },
        },
      },
      compoundVariants: [
        {
          variants: { variant: 'outline', size: 'small' },
          style: { borderWidth: 1 },
        },
      ],
      defaultVariants: {
        variant: 'primary',
        size: 'medium',
      },
    });

    // Default resolution
    const defaultClasses = button();
    expect(defaultClasses).toContain(button.classNames.base);
    expect(defaultClasses).toContain(button.classNames.variants.variant.primary);
    expect(defaultClasses).toContain(button.classNames.variants.size.medium);

    // Custom variants
    const customClasses = button({
      variant: 'secondary',
      size: 'small',
      fullWidth: true,
    });
    expect(customClasses).toContain(button.classNames.base);
    expect(customClasses).toContain(button.classNames.variants.variant.secondary);
    expect(customClasses).toContain(button.classNames.variants.size.small);
    expect(customClasses).toContain(button.classNames.variants.fullWidth.true);

    // Compound variant match
    const compoundClasses = button({ variant: 'outline', size: 'small' });
    expect(compoundClasses).toContain(button.classNames.compoundVariants[0]?.className);

    // Check CSS output is in stylesheet
    const sheetCss = getSheetCss();
    expect(sheetCss).toContain('font-weight:500');
    expect(sheetCss).toContain('background:blue');
    expect(sheetCss).toContain('border-width:1px');
  });
});
