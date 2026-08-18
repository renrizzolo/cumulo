import { describe, it, expect } from 'vitest';
import React from 'react';
import { Card, cardRecipe } from '../src/index.js';

describe('Card component', () => {
  it('generates base styles and default padding', () => {
    const defaultClasses = cardRecipe();
    expect(defaultClasses).toContain(cardRecipe.classNames.base);
    expect(defaultClasses).toContain(cardRecipe.classNames.variants.padding.md);
  });

  it('supports padding variants (none, sm, md, lg)', () => {
    const none = cardRecipe({ padding: 'none' });
    const sm = cardRecipe({ padding: 'sm' });
    const md = cardRecipe({ padding: 'md' });
    const lg = cardRecipe({ padding: 'lg' });

    expect(none).toContain(cardRecipe.classNames.variants.padding.none);
    expect(sm).toContain(cardRecipe.classNames.variants.padding.sm);
    expect(md).toContain(cardRecipe.classNames.variants.padding.md);
    expect(lg).toContain(cardRecipe.classNames.variants.padding.lg);
  });

  it('instantiates Card with level and padding props', () => {
    const elem = (
      <Card level={2} padding="lg" className="custom-card">
        Card Content
      </Card>
    );

    expect(elem.props.level).toBe(2);
    expect(elem.props.padding).toBe('lg');
    expect(elem.props.className).toBe('custom-card');
    expect(elem.props.children).toBe('Card Content');
  });
});
