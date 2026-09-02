import { describe, it, expect } from 'vitest';
import { surfaceRecipe } from '../src/components/Surface';

describe('Surface component', () => {
  describe('Recipe compilation', () => {
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

    it('generates flex, overflow, and nested radius classes', () => {
      const flexSurface = surfaceRecipe({ flex: 1 });
      expect(flexSurface).toContain(surfaceRecipe.classNames.variants.flex['1']);

      const overflowSurface = surfaceRecipe({ overflow: 'hidden' });
      expect(overflowSurface).toContain(surfaceRecipe.classNames.variants.overflow.hidden);

      const autoRadiusSurface = surfaceRecipe({ radius: 'auto' });
      expect(autoRadiusSurface).toContain(surfaceRecipe.classNames.variants.radius.auto);
    });
  });
});
