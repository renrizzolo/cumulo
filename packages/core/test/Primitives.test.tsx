import { describe, it, expect } from 'vitest';
import {
  stackRecipe,
  containerRecipe,
  headingRecipe,
  textRecipe,
  codeRecipe,
  dividerRecipe,
  tableRecipe,
} from '../src/index.js';

describe('Layout and Typography Recipes', () => {
  describe('Stack recipe', () => {
    it('generates base styles and default variants', () => {
      const classes = stackRecipe();
      expect(classes).toContain(stackRecipe.classNames.base);
      expect(classes).toContain(stackRecipe.classNames.variants.direction.column);
      expect(classes).toContain(stackRecipe.classNames.variants.gap.none);
    });

    it('supports direction, gap, align, and justify variants', () => {
      const classes = stackRecipe({
        direction: 'row',
        gap: 'md',
        align: 'center',
        justify: 'between',
      });
      expect(classes).toContain(stackRecipe.classNames.variants.direction.row);
      expect(classes).toContain(stackRecipe.classNames.variants.gap.md);
      expect(classes).toContain(stackRecipe.classNames.variants.align.center);
      expect(classes).toContain(stackRecipe.classNames.variants.justify.between);
    });
  });

  describe('Container recipe', () => {
    it('generates container classes with default size and padding', () => {
      const classes = containerRecipe();
      expect(classes).toContain(containerRecipe.classNames.base);
      expect(classes).toContain(containerRecipe.classNames.variants.size.lg);
      expect(classes).toContain(containerRecipe.classNames.variants.padding.md);
    });
  });

  describe('Heading recipe', () => {
    it('generates heading recipe classes', () => {
      const classes = headingRecipe({ size: '3xl', weight: 'bold' });
      expect(classes).toContain(headingRecipe.classNames.base);
      expect(classes).toContain(headingRecipe.classNames.variants.size['3xl']);
      expect(classes).toContain(headingRecipe.classNames.variants.weight.bold);
    });
  });

  describe('Text recipe', () => {
    it('generates text recipe classes for semantic types', () => {
      const body = textRecipe({ type: 'body' });
      expect(body).toContain(textRecipe.classNames.base);
      expect(body).toContain(textRecipe.classNames.variants.type.body);

      const label = textRecipe({ type: 'label' });
      expect(label).toContain(textRecipe.classNames.variants.type.label);

      const display = textRecipe({ type: 'display' });
      expect(display).toContain(textRecipe.classNames.variants.type.display);
    });
  });

  describe('Code recipe', () => {
    it('generates code recipe classes', () => {
      const classes = codeRecipe({ variant: 'subtle' });
      expect(classes).toContain(codeRecipe.classNames.base);
      expect(classes).toContain(codeRecipe.classNames.variants.variant.subtle);
    });
  });

  describe('Divider recipe', () => {
    it('generates divider recipe classes for horizontal and vertical orientations', () => {
      const h = dividerRecipe({ orientation: 'horizontal', spacing: 'md' });
      expect(h).toContain(dividerRecipe.classNames.base);
      expect(h).toContain(dividerRecipe.classNames.variants.orientation.horizontal);
      expect(h).toContain(dividerRecipe.classNames.variants.spacing.md);

      const v = dividerRecipe({ orientation: 'vertical' });
      expect(v).toContain(dividerRecipe.classNames.variants.orientation.vertical);
    });
  });

  describe('Table recipe', () => {
    it('generates table recipe classes', () => {
      const classes = tableRecipe({ variant: 'bordered' });
      expect(classes).toContain(tableRecipe.classNames.base);
      expect(classes).toContain(tableRecipe.classNames.variants.variant.bordered);
    });
  });
});
