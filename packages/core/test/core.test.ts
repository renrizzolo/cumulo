import { describe, expect, it } from 'vitest';
import { vars } from '../src/index.js';
import { checkboxRecipe } from '../src/components/Checkbox.js';
import { radioRecipe } from '../src/components/Radio.js';
import { switchRecipe } from '../src/components/Switch.js';

describe('@cumulo/core', () => {
  it('exports theme contract dynamically matching CSS variables in theme.css', () => {
    expect(vars.surface.bg.DEFAULT).toBe('var(--surface-bg)');
    expect(vars.surface.bg.next).toBe('var(--surface-bg-next)');
    expect(vars.surface.subtle).toBe('var(--surface-subtle)');
    expect(vars.surface.muted).toBe('var(--surface-muted)');
    expect(vars.primary.DEFAULT).toBe('var(--theme-primary)');
    expect(vars.primary['50']).toBe('var(--theme-primary-50)');
    expect(vars.primary['900']).toBe('var(--theme-primary-900)');
    expect(vars.seed.primary).toBe('var(--color-primary-base)');
    expect(vars.radius.control).toBe('var(--theme-radius-control)');
    expect(vars.radius.md).toBe('var(--theme-radius-md)');
    expect(vars.shadow['1']).toBe('var(--theme-shadow-1)');
    expect(vars.font.size.sm).toBe('var(--theme-font-size-sm)');
    expect(vars.font.size.base).toBe('var(--theme-font-size-base)');
    expect(vars.font.size.lg).toBe('var(--theme-font-size-lg)');
    expect(vars.font.weight.medium).toBe('var(--theme-font-weight-medium)');
    expect(vars.line.height.none).toBe('var(--theme-line-height-none)');
  });

  it('inherits control intent compound variants on checkbox, radio, and switch recipes', () => {
    const cbCvClass = checkboxRecipe.classNames.compoundVariants[0]?.className;
    expect(cbCvClass).toBeDefined();
    expect(checkboxRecipe({ checked: true, intent: 'error' })).toContain(cbCvClass);
    expect(checkboxRecipe({ checked: true, intent: 'default' })).not.toContain(cbCvClass);
    expect(checkboxRecipe({ checked: false, intent: 'error' })).not.toContain(cbCvClass);

    const radioCvClass = radioRecipe.classNames.compoundVariants[0]?.className;
    expect(radioCvClass).toBeDefined();
    expect(radioRecipe({ checked: true, intent: 'error' })).toContain(radioCvClass);
    expect(radioRecipe({ checked: true, intent: 'default' })).not.toContain(radioCvClass);
    expect(radioRecipe({ checked: false, intent: 'error' })).not.toContain(radioCvClass);

    const switchCvClass = switchRecipe.classNames.compoundVariants[0]?.className;
    expect(switchCvClass).toBeDefined();
    expect(switchRecipe({ checked: true, intent: 'error' })).toContain(switchCvClass);
    expect(switchRecipe({ checked: true, intent: 'default' })).not.toContain(switchCvClass);
    expect(switchRecipe({ checked: false, intent: 'error' })).not.toContain(switchCvClass);
  });
});
