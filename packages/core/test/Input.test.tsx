import { describe, it, expect } from 'vitest';
import React from 'react';
import { Input, inputRecipe } from '../src/index.js';

describe('Input component', () => {
  it('generates base styles and default variants', () => {
    const defaultClasses = inputRecipe();
    expect(defaultClasses).toContain(inputRecipe.classNames.base);
    expect(defaultClasses).toContain(inputRecipe.classNames.variants.size.base);
    expect(defaultClasses).toContain(inputRecipe.classNames.variants.intent.default);
  });

  it('supports sizing variants (small, base, large, inherit)', () => {
    const small = inputRecipe({ size: 'small' });
    const base = inputRecipe({ size: 'base' });
    const large = inputRecipe({ size: 'large' });
    const inherit = inputRecipe({ size: 'inherit' });

    expect(small).toContain(inputRecipe.classNames.variants.size.small);
    expect(base).toContain(inputRecipe.classNames.variants.size.base);
    expect(large).toContain(inputRecipe.classNames.variants.size.large);
    expect(inherit).toContain(inputRecipe.classNames.variants.size.inherit);
  });

  it('supports intent variants (default, error)', () => {
    const errorClasses = inputRecipe({ intent: 'error' });
    expect(errorClasses).toContain(inputRecipe.classNames.variants.intent.error);
  });

  it('instantiates Input with ElementProps attributes', () => {
    const elem = (
      <Input
        type="email"
        placeholder="user@example.com"
        size="large"
        intent="error"
        required
        disabled
        className="test-input"
      />
    );

    expect(elem.props.type).toBe('email');
    expect(elem.props.placeholder).toBe('user@example.com');
    expect(elem.props.size).toBe('large');
    expect(elem.props.intent).toBe('error');
    expect(elem.props.required).toBe(true);
    expect(elem.props.disabled).toBe(true);
    expect(elem.props.className).toBe('test-input');
  });
});
