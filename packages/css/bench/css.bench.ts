import { describe, test } from 'vitest';
import {
  style,
  recipe,
  cx,
  createThemeContract,
  createTheme,
  keyframes,
  resetSheet,
} from '../src/index.js';

describe('@cumulo/css benchmarks', () => {
  test('style() compilation and insertion', async ({ bench }) => {
    resetSheet();

    await bench('atomic style (simple)', () => {
      style({
        display: 'flex',
        padding: 16,
        color: '#000',
      });
    }).run();

    await bench('atomic style (complex with pseudo & media)', () => {
      style({
        display: 'flex',
        flexDirection: 'column',
        padding: 16,
        margin: 8,
        borderRadius: 8,
        color: '#333',
        backgroundColor: '#fff',
        ':hover': {
          opacity: 0.8,
          backgroundColor: '#f5f5f5',
        },
        ':focus-visible': {
          outline: '2px solid blue',
        },
        selectors: {
          '@media (min-width: 768px)': {
            padding: 24,
            flexDirection: 'row',
          },
        },
      });
    }).run();
  });

  test('recipe() variant resolution', async ({ bench }) => {
    const button = recipe({
      base: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 6,
        fontWeight: 500,
      },
      variants: {
        variant: {
          solid: { backgroundColor: '#3b82f6', color: '#fff' },
          outline: { border: '1px solid #3b82f6', color: '#3b82f6' },
          ghost: { backgroundColor: 'transparent', color: '#3b82f6' },
        },
        size: {
          sm: { height: 32, padding: '0 12px', fontSize: 13 },
          md: { height: 40, padding: '0 16px', fontSize: 14 },
          lg: { height: 48, padding: '0 20px', fontSize: 16 },
        },
        intent: {
          primary: { color: '#3b82f6' },
          danger: { color: '#ef4444' },
          neutral: { color: '#6b7280' },
        },
      },
      compoundVariants: [
        {
          variants: { variant: 'solid', intent: 'danger' },
          style: { backgroundColor: '#ef4444', color: '#fff' },
        },
      ],
      defaultVariants: {
        variant: 'solid',
        size: 'md',
        intent: 'primary',
      },
    });

    await bench('recipe call (default variants)', () => {
      button();
    }).run();

    await bench('recipe call (overriding variants)', () => {
      button({ variant: 'outline', size: 'lg', intent: 'danger' });
    }).run();

    await bench('recipe call (compound variant match)', () => {
      button({ variant: 'solid', intent: 'danger' });
    }).run();
  });

  test('cx() class name merging', async ({ bench }) => {
    await bench('cx (simple strings)', () => {
      cx('btn', 'btn-primary', 'btn-lg');
    }).run();

    const isActive = Boolean(1);
    const isHidden = Boolean(0);

    await bench('cx (mixed arguments with conditionals)', () => {
      cx('btn', isActive && 'btn-active', isHidden && 'btn-hidden', undefined, null, {
        'is-loading': true,
        'is-disabled': false,
        'has-error': true,
      });
    }).run();
  });

  test('createTheme() & createThemeContract()', async ({ bench }) => {
    const contract = createThemeContract({
      colors: {
        primary: null,
        secondary: null,
        background: null,
        surface: null,
        text: null,
      },
      spacing: {
        xs: null,
        sm: null,
        md: null,
        lg: null,
        xl: null,
      },
      radii: {
        sm: null,
        md: null,
        lg: null,
      },
    });

    await bench('createTheme instantiation', () => {
      createTheme(contract, {
        colors: {
          primary: '#3b82f6',
          secondary: '#64748b',
          background: '#ffffff',
          surface: '#f8fafc',
          text: '#0f172a',
        },
        spacing: {
          xs: '4px',
          sm: '8px',
          md: '16px',
          lg: '24px',
          xl: '32px',
        },
        radii: {
          sm: '2px',
          md: '4px',
          lg: '8px',
        },
      });
    }).run();
  });

  test('keyframes() animation generation', async ({ bench }) => {
    await bench('keyframes definition', () => {
      keyframes({
        '0%': { transform: 'scale(1)', opacity: 1 },
        '50%': { transform: 'scale(1.05)', opacity: 0.8 },
        '100%': { transform: 'scale(1)', opacity: 1 },
      });
    }).run();
  });
});
