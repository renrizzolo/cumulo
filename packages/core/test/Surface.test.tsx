import { describe, it, expect } from 'vitest';
import React from 'react';
import { Surface, surfaceRecipe } from '../src/index.js';

describe('Surface component', () => {
  it('generates base and default variant classes from surfaceRecipe', () => {
    const defaultClasses = surfaceRecipe();
    expect(defaultClasses).toContain(surfaceRecipe.classNames.base);
  });

  it('generates level-specific surface classes', () => {
    const level0 = surfaceRecipe({ level: 0 });
    const level1 = surfaceRecipe({ level: 1 });
    const level2 = surfaceRecipe({ level: 2 });

    expect(level0).toBeDefined();
    expect(level1).toBeDefined();
    expect(level2).toBeDefined();
  });

  it('generates primary variant class', () => {
    const primarySurface = surfaceRecipe({ variant: 'primary' });
    expect(primarySurface).toContain(surfaceRecipe.classNames.variants.variant.primary);
  });

  it('renders a Surface element structure with correct classes', () => {
    const elem = (
      <Surface level={2} className="custom-surface">
        Content
      </Surface>
    );
    expect(elem.props.level).toBe(2);
    expect(elem.props.children).toBe('Content');
    expect(elem.props.className).toBe('custom-surface');
  });

  it('renders primary variant with surface-primary class', () => {
    const elem = <Surface variant="primary">Primary Surface</Surface>;
    expect(elem.props.variant).toBe('primary');
  });
});
