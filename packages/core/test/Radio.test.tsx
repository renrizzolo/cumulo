import '@testing-library/jest-dom/vitest';
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Radio } from '../src/components/Radio.js';
import * as RadioGroup from '../src/components/RadioGroup.js';
import { createRadioGroup } from '../src/components/RadioGroup.js';
import * as Field from '../src/components/Field.js';

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

  it('supports intent="error" when checked', () => {
    render(<Radio aria-label="Test radio" checked intent="error" />);
    const radio = screen.getByRole('radio', { name: 'Test radio' });
    expect(radio).toBeChecked();
    expect(radio).toHaveAttribute('data-invalid', 'true');
  });
});

describe('RadioGroup Component', () => {
  it('groups radios with role="radiogroup" and manages selection', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(
      <RadioGroup.Root defaultValue="opt1" onValueChange={onValueChange}>
        <label htmlFor="opt1">
          <RadioGroup.Item id="opt1" value="opt1" /> Option 1
        </label>
        <label htmlFor="opt2">
          <RadioGroup.Item id="opt2" value="opt2" /> Option 2
        </label>
      </RadioGroup.Root>,
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

  it('supports strictly typed createRadioGroup / RadioGroup.create factory', async () => {
    const user = userEvent.setup();
    type PlanTier = 'free' | 'pro' | 'enterprise';
    const PlanRadioGroup = createRadioGroup<PlanTier>();
    const onValueChange = vi.fn<(value: PlanTier) => void>();

    render(
      <PlanRadioGroup.Root defaultValue="free" onValueChange={onValueChange}>
        <label htmlFor="plan-free">
          <PlanRadioGroup.Item id="plan-free" value="free" /> Free
        </label>
        <label htmlFor="plan-pro">
          <PlanRadioGroup.Item id="plan-pro" value="pro" /> Pro
        </label>
      </PlanRadioGroup.Root>,
    );

    await user.click(screen.getByRole('radio', { name: /Pro/i }));
    expect(onValueChange).toHaveBeenCalledWith('pro');
  });

  it('propagates disabled to group items', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(
      <RadioGroup.Root disabled onValueChange={onValueChange}>
        <label htmlFor="opt1-disabled">
          <RadioGroup.Item id="opt1-disabled" value="opt1" /> Option 1
        </label>
      </RadioGroup.Root>,
    );

    const opt1 = screen.getByRole('radio', { name: /Option 1/i });
    expect(opt1).toBeDisabled();

    await user.click(opt1);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('wires seamlessly with Field and FieldLabel', () => {
    render(
      <Field.Root>
        <Field.Label>Choose option</Field.Label>
        <Field.RadioGroup defaultValue="val1">
          <label htmlFor="val1">
            <RadioGroup.Item id="val1" value="val1" /> Val 1
          </label>
        </Field.RadioGroup>
      </Field.Root>,
    );

    const label = screen.getByText('Choose option');
    const group = screen.getByRole('radiogroup');

    expect(group).toHaveAttribute('aria-labelledby', label.id);
  });

  it('propagates Field error state and aria-invalid to RadioGroup and child Radios', () => {
    render(
      <Field.Root>
        <Field.Label>Plan</Field.Label>
        <Field.RadioGroup defaultValue="starter">
          <label htmlFor="starter">
            <RadioGroup.Item id="starter" value="starter" /> Starter
          </label>
        </Field.RadioGroup>
        <Field.Error>Please select a valid plan.</Field.Error>
      </Field.Root>,
    );

    const group = screen.getByRole('radiogroup');
    const radio = screen.getByRole('radio', { name: /Starter/i });

    expect(group).toHaveAttribute('aria-invalid', 'true');
    expect(radio).toHaveAttribute('data-invalid', 'true');
  });
});
