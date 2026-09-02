import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Input, inputRecipe } from '../src/index.js';

afterEach(() => {
  cleanup();
});

describe('Input component', () => {
  describe('Recipe compilation', () => {
    it('generates base styles and default variants', () => {
      const defaultClasses = inputRecipe();
      expect(defaultClasses).toContain(inputRecipe.classNames.base);
      expect(defaultClasses).toContain(inputRecipe.classNames.variants.size.md);
      expect(defaultClasses).toContain(inputRecipe.classNames.variants.intent.default);
    });

    it('supports sizing variants (sm, md, lg, xl, inherit)', () => {
      const sm = inputRecipe({ size: 'sm' });
      const md = inputRecipe({ size: 'md' });
      const lg = inputRecipe({ size: 'lg' });
      const xl = inputRecipe({ size: 'xl' });
      const inherit = inputRecipe({ size: 'inherit' });

      expect(sm).toContain(inputRecipe.classNames.variants.size.sm);
      expect(md).toContain(inputRecipe.classNames.variants.size.md);
      expect(lg).toContain(inputRecipe.classNames.variants.size.lg);
      expect(xl).toContain(inputRecipe.classNames.variants.size.xl);
      expect(inherit).toContain(inputRecipe.classNames.variants.size.inherit);
    });

    it('supports intent variants (default, error)', () => {
      const errorClasses = inputRecipe({ intent: 'error' });
      expect(errorClasses).toContain(inputRecipe.classNames.variants.intent.error);
    });
  });

  describe('Interactions', () => {
    it('handles user typing and updates value in controlled mode', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      function ControlledInput() {
        const [val, setVal] = useState('');
        return (
          <Input
            aria-label="Username"
            value={val}
            onChange={(e) => {
              setVal(e.target.value);
              handleChange(e.target.value);
            }}
          />
        );
      }

      render(<ControlledInput />);
      const input = screen.getByRole('textbox', { name: 'Username' });

      await user.type(input, 'testuser');
      expect(input).toHaveValue('testuser');
      expect(handleChange).toHaveBeenCalledTimes(8);
    });
  });
});
