import { describe, it, expect } from 'vitest';
import React from 'react';
import { Badge, badgeRecipe } from '../src/index.js';

describe('Badge component', () => {
  it('generates base styles and default variants', () => {
    const defaultClasses = badgeRecipe();
    expect(defaultClasses).toContain(badgeRecipe.classNames.base);
    expect(defaultClasses).toContain(badgeRecipe.classNames.variants.variant.primary);
    expect(defaultClasses).toContain(badgeRecipe.classNames.variants.intent.primary);
    expect(defaultClasses).toContain(badgeRecipe.classNames.variants.size.small);
  });

  it('supports variants and intents', () => {
    const secondarySuccess = badgeRecipe({ variant: 'secondary', intent: 'success' });
    const outlineWarning = badgeRecipe({ variant: 'outline', intent: 'warning' });
    const ghostInfo = badgeRecipe({ variant: 'ghost', intent: 'info' });

    expect(secondarySuccess).toContain(badgeRecipe.classNames.variants.variant.secondary);
    expect(outlineWarning).toContain(badgeRecipe.classNames.variants.variant.outline);
    expect(ghostInfo).toContain(badgeRecipe.classNames.variants.variant.ghost);
  });

  it('supports sizes (small, base, large)', () => {
    const small = badgeRecipe({ size: 'small' });
    const base = badgeRecipe({ size: 'base' });
    const large = badgeRecipe({ size: 'large' });

    expect(small).toContain(badgeRecipe.classNames.variants.size.small);
    expect(base).toContain(badgeRecipe.classNames.variants.size.base);
    expect(large).toContain(badgeRecipe.classNames.variants.size.large);
  });

  it('instantiates Badge with ElementProps and children', () => {
    const elem = (
      <Badge variant="outline" intent="error" size="small" className="test-badge">
        Active
      </Badge>
    );

    expect(elem.props.variant).toBe('outline');
    expect(elem.props.intent).toBe('error');
    expect(elem.props.size).toBe('small');
    expect(elem.props.children).toBe('Active');
    expect(elem.props.className).toBe('test-badge');
  });
});
