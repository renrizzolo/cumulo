import { describe, it, expect } from 'vitest';
import { badgeRecipe } from '../src/index.js';

describe('Badge component', () => {
  describe('Recipe compilation', () => {
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

    it('supports sizes and color variants', () => {
      const small = badgeRecipe({ size: 'small' });
      const yellow = badgeRecipe({ color: 'yellow' });

      expect(small).toContain(badgeRecipe.classNames.variants.size.small);
      expect(yellow).toContain(badgeRecipe.classNames.variants.color.yellow);
    });
  });
});
