import { describe, expect, it } from 'vitest';
import { themeTokens, themeVars, vars } from '../src/index.js';

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
});
