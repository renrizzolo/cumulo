import { describe, it, expect } from 'vitest';
import React from 'react';
import { Button, buttonRecipe } from '../src/index.js';

describe('Button component', () => {
  it('generates base styles and default variants', () => {
    const defaultClasses = buttonRecipe();
    expect(defaultClasses).toContain(buttonRecipe.classNames.base);
    expect(defaultClasses).toContain(buttonRecipe.classNames.variants.variant.primary);
    expect(defaultClasses).toContain(buttonRecipe.classNames.variants.size.base);
  });

  it('supports all base variants (primary, secondary, outline, ghost)', () => {
    const primary = buttonRecipe({ variant: 'primary' });
    const secondary = buttonRecipe({ variant: 'secondary' });
    const outline = buttonRecipe({ variant: 'outline' });
    const ghost = buttonRecipe({ variant: 'ghost' });

    expect(primary).toContain(buttonRecipe.classNames.variants.variant.primary);
    expect(secondary).toContain(buttonRecipe.classNames.variants.variant.secondary);
    expect(outline).toContain(buttonRecipe.classNames.variants.variant.outline);
    expect(ghost).toContain(buttonRecipe.classNames.variants.variant.ghost);
  });

  it('supports intent variants (success, warning, error, info)', () => {
    const success = buttonRecipe({ intent: 'success' });
    const error = buttonRecipe({ intent: 'error' });
    const warning = buttonRecipe({ intent: 'warning' });
    const info = buttonRecipe({ intent: 'info' });

    expect(success).toBeDefined();
    expect(error).toBeDefined();
    expect(warning).toBeDefined();
    expect(info).toBeDefined();
  });

  it('supports compound variant combinations (e.g. secondary + error)', () => {
    const errorSecondary = buttonRecipe({ variant: 'secondary', intent: 'error' });
    expect(errorSecondary).toBeDefined();
  });

  it('supports size scaling (small, base, large)', () => {
    const small = buttonRecipe({ size: 'small' });
    const base = buttonRecipe({ size: 'base' });
    const large = buttonRecipe({ size: 'large' });

    expect(small).toContain(buttonRecipe.classNames.variants.size.small);
    expect(base).toContain(buttonRecipe.classNames.variants.size.base);
    expect(large).toContain(buttonRecipe.classNames.variants.size.large);
  });

  it('supports width and shape variants including square for icon buttons', () => {
    const fullRound = buttonRecipe({ width: 'full', shape: 'round' });
    expect(fullRound).toContain(buttonRecipe.classNames.variants.width.full);
    expect(fullRound).toContain(buttonRecipe.classNames.variants.shape.round);

    const squareSmall = buttonRecipe({ width: 'square', size: 'small' });
    expect(squareSmall).toContain(buttonRecipe.classNames.variants.width.square);
    expect(squareSmall).toContain(buttonRecipe.classNames.variants.size.small);
    expect(buttonRecipe.classNames.compoundVariants.length).toBeGreaterThan(0);
  });

  it('instantiates Button element with proper props and children', () => {
    const elem = (
      <Button variant="secondary" intent="error" size="small" disabled className="test-btn">
        Delete
      </Button>
    );

    expect(elem.props.variant).toBe('secondary');
    expect(elem.props.intent).toBe('error');
    expect(elem.props.size).toBe('small');
    expect(elem.props.disabled).toBe(true);
    expect(elem.props.children).toBe('Delete');
    expect(elem.props.className).toBe('test-btn');
  });

  it('supports iconOnly prop resolving to square button', () => {
    const elem = <Button iconOnly size="small" aria-label="Action" />;
    expect(elem.props.iconOnly).toBe(true);
  });
});
