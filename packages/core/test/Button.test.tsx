import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Button, buttonRecipe } from '../src/index.js';

afterEach(() => {
  cleanup();
});

describe('Button component', () => {
  describe('Recipe compilation', () => {
    it('generates base styles and default variants', () => {
      const defaultClasses = buttonRecipe();
      expect(defaultClasses).toContain(buttonRecipe.classNames.base);
      expect(defaultClasses).toContain(buttonRecipe.classNames.variants.variant.primary);
      expect(defaultClasses).toContain(buttonRecipe.classNames.variants.size.md);
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

    it('supports width and shape variants including square for icon buttons', () => {
      const fullRound = buttonRecipe({ width: 'full', shape: 'round' });
      expect(fullRound).toContain(buttonRecipe.classNames.variants.width.full);
      expect(fullRound).toContain(buttonRecipe.classNames.variants.shape.round);

      const squareSm = buttonRecipe({ width: 'square', size: 'sm' });
      expect(squareSm).toContain(buttonRecipe.classNames.variants.width.square);
      expect(squareSm).toContain(buttonRecipe.classNames.variants.size.sm);
      expect(buttonRecipe.classNames.compoundVariants.length).toBeGreaterThan(0);
    });
  });

  describe('Interactions', () => {
    it('handles click events when enabled', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(<Button onClick={handleClick}>Submit</Button>);

      await user.click(screen.getByRole('button', { name: 'Submit' }));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('prevents click events when disabled', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(
        <Button disabled onClick={handleClick}>
          Disabled Action
        </Button>,
      );

      const button = screen.getByRole('button', { name: 'Disabled Action' });
      expect(button).toBeDisabled();

      await user.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });
  });
});
