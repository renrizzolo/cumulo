import '@testing-library/jest-dom/vitest';
import React, { useState } from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Checkbox, checkboxRecipe } from '../src/components/Checkbox.js';
import { Field } from '../src/index.js';

afterEach(() => {
  cleanup();
});

describe('Checkbox Component', () => {
  it('renders unchecked and toggles on click in uncontrolled mode', async () => {
    const user = userEvent.setup();
    const handleCheckedChange = vi.fn();

    render(
      <Checkbox
        aria-label="Accept terms"
        onCheckedChange={handleCheckedChange}
        data-testid="checkbox-input"
      />,
    );

    const input = screen.getByRole('checkbox', { name: 'Accept terms' });
    expect(input).not.toBeChecked();

    await user.click(input);
    expect(input).toBeChecked();
    expect(handleCheckedChange).toHaveBeenCalledWith(true);
  });

  it('handles controlled mode correctly', async () => {
    const user = userEvent.setup();

    function Controlled() {
      const [checked, setChecked] = useState(false);
      return <Checkbox aria-label="Controlled" checked={checked} onCheckedChange={setChecked} />;
    }

    render(<Controlled />);
    const input = screen.getByRole('checkbox', { name: 'Controlled' });
    expect(input).not.toBeChecked();

    await user.click(input);
    expect(input).toBeChecked();
  });

  it('renders indeterminate state with aria-checked mixed', () => {
    render(<Checkbox aria-label="Select all" indeterminate />);
    const input = screen.getByRole('checkbox', { name: 'Select all' });
    expect(input.getAttribute('aria-checked')).toBe('mixed');
  });

  it('integrates with Field compound component', () => {
    render(
      <Field.Root isInvalid>
        <Field.Label>Subscribe</Field.Label>
        <Field.Checkbox />
        <Field.Error>Error message</Field.Error>
      </Field.Root>,
    );

    const input = screen.getByRole('checkbox');
    expect(input).toBeInvalid();
  });

  it('applies sizing recipe variants', () => {
    const sm = checkboxRecipe({ size: 'sm' });
    const lg = checkboxRecipe({ size: 'lg' });

    expect(sm).toContain(checkboxRecipe.classNames.variants.size.sm);
    expect(lg).toContain(checkboxRecipe.classNames.variants.size.lg);
  });
});
