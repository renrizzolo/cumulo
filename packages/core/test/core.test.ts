import { describe, it, expect } from 'vitest';
import {
  vars,
  themeTokens,
  themeVars,
  buttonRecipe,
  surfaceRecipe,
  inputRecipe,
  badgeRecipe,
} from '../src/index.js';

describe('@cumulo/core', () => {
  it('exports theme contract dynamically matching CSS variables in theme.css', () => {
    expect(vars.surface.bg.DEFAULT).toBe('var(--surface-bg)');
    expect(vars.surface.bg.next).toBe('var(--surface-bg-next)');
    expect(vars.primary.DEFAULT).toBe('var(--theme-primary)');
    expect(vars.primary['50']).toBe('var(--theme-primary-50)');
    expect(vars.primary['900']).toBe('var(--theme-primary-900)');
    expect(vars.seed.primary).toBe('var(--color-primary-base)');
    expect(vars.radius.md).toBe('var(--theme-radius-md)');
    expect(vars.shadow['1']).toBe('var(--theme-shadow-1)');
    expect(vars.font.size.sm).toBe('var(--theme-font-size-sm)');
    expect(vars.font.size.base).toBe('var(--theme-font-size-base)');
    expect(vars.font.size.lg).toBe('var(--theme-font-size-lg)');
    expect(vars.font.weight.medium).toBe('var(--theme-font-weight-medium)');
    expect(vars.line.height.none).toBe('var(--theme-line-height-none)');
  });

  it('exports themeTokens array and themeVars mapping', () => {
    expect(themeTokens).toContain('--surface-bg');
    expect(themeTokens).toContain('--surface-bg-next');
    expect(themeTokens).toContain('--color-primary-base');
    expect(themeTokens).toContain('--theme-primary-50');
    expect(themeVars['--surface-bg']).toBe('var(--surface-bg)');
  });

  it('compiles zero-runtime recipes with extend for core components', () => {
    const defaultBtnClass = buttonRecipe();
    expect(defaultBtnClass).toContain(buttonRecipe.classNames.base);

    const errorBtnClass = buttonRecipe({
      variant: 'secondary',
      intent: 'error',
      size: 'small',
    });
    expect(errorBtnClass).toContain(buttonRecipe.classNames.variants.variant.secondary);
    expect(errorBtnClass).toContain(buttonRecipe.classNames.variants.size.small);

    const surfaceClass = surfaceRecipe({ level: 2 });
    expect(surfaceClass).toContain(surfaceRecipe.classNames.base);

    const inputClass = inputRecipe({ size: 'large', intent: 'error' });
    expect(inputClass).toContain(inputRecipe.classNames.variants.size.large);
    expect(inputClass).toContain(inputRecipe.classNames.variants.intent.error);

    const badgeClass = badgeRecipe({ variant: 'secondary', intent: 'success' });
    expect(badgeClass).toContain(badgeRecipe.classNames.variants.variant.secondary);
  });
});
