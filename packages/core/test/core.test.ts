import { describe, it, expect } from 'vitest';
import { vars, lightTheme, darkTheme, cloudTheme, defaultColorTokens } from '../src/index.js';

describe('@cumulo/core', () => {
  it('exports theme contract with valid CSS variables', () => {
    expect(vars.color.primary).toBe('var(--c-color-primary)');
    expect(vars.color.bg).toBe('var(--c-color-bg)');
    expect(vars.space.md).toBe('var(--c-space-md)');
    expect(vars.radii.lg).toBe('var(--c-radii-lg)');
  });

  it('exports valid themes with generated classes and variables', () => {
    expect(lightTheme.className).toMatch(/^theme-/);
    expect(darkTheme.className).toMatch(/^theme-/);
    expect(cloudTheme.className).toMatch(/^theme-/);

    expect(lightTheme.vars['--c-color-primary']).toBe(defaultColorTokens.brand[600]);
    expect(darkTheme.vars['--c-color-primary']).toBe(defaultColorTokens.brand[500]);
  });
});
