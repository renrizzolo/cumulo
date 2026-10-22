import '@testing-library/jest-dom/vitest';
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Radio } from '../src/components/Radio.js';
import { RadioList } from '../src/components/RadioList.js';
import { Field } from '../src/components/Field.js';

describe('Radio Component', () => {
  it('renders native input type="radio" correctly', () => {
    render(<Radio aria-label="Standalone radio" defaultChecked />);

    const radio = screen.getByRole('radio', { name: 'Standalone radio' });
    expect(radio).toBeInTheDocument();
    expect(radio).toBeChecked();
  });

  it('handles onChange and onCheckedChange callbacks', async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();

    render(<Radio aria-label="Test radio" onCheckedChange={onCheckedChange} />);

    const radio = screen.getByRole('radio', { name: 'Test radio' });
    expect(radio).not.toBeChecked();

    await user.click(radio);
    expect(radio).toBeChecked();
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it('respects disabled state', async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();

    render(<Radio aria-label="Disabled radio" disabled onCheckedChange={onCheckedChange} />);

    const radio = screen.getByRole('radio', { name: 'Disabled radio' });
    expect(radio).toBeDisabled();

    await user.click(radio);
    expect(onCheckedChange).not.toHaveBeenCalled();
  });
});

describe('RadioList Component', () => {
  it('groups radios with role="radiogroup" and manages selection', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(
      <RadioList defaultValue="opt1" onValueChange={onValueChange}>
        <label htmlFor="opt1">
          <Radio id="opt1" value="opt1" /> Option 1
        </label>
        <label htmlFor="opt2">
          <Radio id="opt2" value="opt2" /> Option 2
        </label>
      </RadioList>,
    );

    const group = screen.getByRole('radiogroup');
    expect(group).toBeInTheDocument();

    const opt1 = screen.getByRole('radio', { name: /Option 1/i });
    const opt2 = screen.getByRole('radio', { name: /Option 2/i });

    expect(opt1).toBeChecked();
    expect(opt2).not.toBeChecked();

    await user.click(opt2);
    expect(onValueChange).toHaveBeenCalledWith('opt2');
    expect(opt2).toBeChecked();
    expect(opt1).not.toBeChecked();
  });

  it('propagates disabled to group items', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(
      <RadioList disabled onValueChange={onValueChange}>
        <label htmlFor="opt1-disabled">
          <Radio id="opt1-disabled" value="opt1" /> Option 1
        </label>
      </RadioList>,
    );

    const opt1 = screen.getByRole('radio', { name: /Option 1/i });
    expect(opt1).toBeDisabled();

    await user.click(opt1);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('wires seamlessly with Field and FieldLabel', () => {
    render(
      <Field>
        <Field.Label>Choose option</Field.Label>
        <Field.RadioList defaultValue="val1">
          <label htmlFor="val1">
            <Radio id="val1" value="val1" /> Val 1
          </label>
        </Field.RadioList>
      </Field>,
    );

    const label = screen.getByText('Choose option');
    const group = screen.getByRole('radiogroup');

    expect(group).toHaveAttribute('aria-labelledby', label.id);
  });
});
