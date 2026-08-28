import { describe, it, expect } from 'vitest';
import { cardRecipe } from '../src/index.js';

describe('Card component', () => {
  describe('Recipe compilation', () => {
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
  });
});
