import '@testing-library/jest-dom/vitest';
import React, { useState } from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Switch, switchRecipe } from '../src/components/Switch.js';
import { Field } from '../src/index.js';

afterEach(() => {
  cleanup();
});

describe('Switch Component', () => {
  it('renders unchecked with role switch and toggles on click', async () => {
    const user = userEvent.setup();
    const handleCheckedChange = vi.fn();

    render(<Switch aria-label="Notifications" onCheckedChange={handleCheckedChange} />);

    const switchEl = screen.getByRole('switch', { name: 'Notifications' });
    expect(switchEl).not.toBeChecked();

    await user.click(switchEl);
    expect(switchEl).toBeChecked();
    expect(handleCheckedChange).toHaveBeenCalledWith(true);
  });

  it('handles controlled mode correctly', async () => {
    const user = userEvent.setup();

    function Controlled() {
      const [checked, setChecked] = useState(false);
      return <Switch aria-label="Dark mode" checked={checked} onCheckedChange={setChecked} />;
    }

    render(<Controlled />);
    const switchEl = screen.getByRole('switch', { name: 'Dark mode' });
    expect(switchEl).not.toBeChecked();

    await user.click(switchEl);
    expect(switchEl).toBeChecked();
  });

  it('supports disabled state', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(<Switch aria-label="Disabled switch" disabled onCheckedChange={handleChange} />);

    const switchEl = screen.getByRole('switch', { name: 'Disabled switch' });
    expect(switchEl).toBeDisabled();

    await user.click(switchEl);
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('integrates with Field context', () => {
    render(
      <Field.Root id="notifications-field">
        <Field.Label>Enable Notifications</Field.Label>
        <Field.Switch />
      </Field.Root>,
    );

    const switchEl = screen.getByRole('switch');
    expect(switchEl.id).toBe('notifications-field');
  });

  it('generates base styles and default variants', () => {
    const classes = switchRecipe();
    expect(classes).toContain(switchRecipe.classNames.base);
  });
});
