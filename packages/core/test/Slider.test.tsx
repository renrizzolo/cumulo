import '@testing-library/jest-dom/vitest';
import React, { useState, useRef } from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Slider } from '../src/components/Slider.js';
import { Field } from '../src/index.js';

afterEach(() => {
  cleanup();
});

function ControlledSlider({ initialValue = 25 }: { initialValue?: number }) {
  const [val, setVal] = useState(initialValue);
  return (
    <Slider aria-label="Controlled volume" value={val} onValueChange={setVal} min={0} max={100} />
  );
}

function RefTestComponent() {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div>
      <Slider ref={ref} aria-label="Ref slider" defaultValue={40} />
      <button
        type="button"
        onClick={() => {
          if (ref.current) {
            ref.current.focus();
          }
        }}
      >
        Focus Slider
      </button>
    </div>
  );
}

describe('Slider Component', () => {
  it('renders with role slider and default attributes', () => {
    render(<Slider aria-label="Volume" defaultValue={30} min={0} max={100} />);

    const sliderEl = screen.getByRole('slider', { name: 'Volume' });
    if (!(sliderEl instanceof HTMLInputElement)) {
      throw new Error('Expected sliderEl to be an HTMLInputElement');
    }

    expect(sliderEl).toBeInTheDocument();
    expect(sliderEl.value).toBe('30');
    expect(sliderEl.min).toBe('0');
    expect(sliderEl.max).toBe('100');
    expect(sliderEl.step).toBe('1');
    expect(sliderEl).toHaveAttribute('type', 'range');
  });

  it('handles uncontrolled state and fires onValueChange on change', () => {
    const handleValueChange = vi.fn();
    const handleChange = vi.fn();

    render(
      <Slider
        aria-label="Brightness"
        defaultValue={50}
        min={0}
        max={100}
        onValueChange={handleValueChange}
        onChange={handleChange}
      />,
    );

    const sliderEl = screen.getByRole('slider', { name: 'Brightness' });
    if (!(sliderEl instanceof HTMLInputElement)) {
      throw new Error('Expected sliderEl to be an HTMLInputElement');
    }

    expect(sliderEl.value).toBe('50');

    fireEvent.change(sliderEl, { target: { value: '75' } });

    expect(sliderEl.value).toBe('75');
    expect(handleValueChange).toHaveBeenCalledWith(75);
    expect(handleChange).toHaveBeenCalled();
  });

  it('handles controlled mode correctly', () => {
    render(<ControlledSlider initialValue={25} />);

    const sliderEl = screen.getByRole('slider', { name: 'Controlled volume' });
    if (!(sliderEl instanceof HTMLInputElement)) {
      throw new Error('Expected sliderEl to be an HTMLInputElement');
    }

    expect(sliderEl.value).toBe('25');

    fireEvent.change(sliderEl, { target: { value: '80' } });

    expect(sliderEl.value).toBe('80');
  });

  it('clamps value within bounds', () => {
    render(<Slider aria-label="Clamped" value={150} min={0} max={100} />);

    const sliderEl = screen.getByRole('slider', { name: 'Clamped' });
    if (!(sliderEl instanceof HTMLInputElement)) {
      throw new Error('Expected sliderEl to be an HTMLInputElement');
    }

    expect(sliderEl.value).toBe('100');
  });

  it('supports custom step increments', () => {
    render(<Slider aria-label="Stepped" defaultValue={10} min={0} max={50} step={5} />);

    const sliderEl = screen.getByRole('slider', { name: 'Stepped' });
    if (!(sliderEl instanceof HTMLInputElement)) {
      throw new Error('Expected sliderEl to be an HTMLInputElement');
    }

    expect(sliderEl.step).toBe('5');
  });

  it('supports disabled state and prevents interactions', async () => {
    const user = userEvent.setup();
    const handleValueChange = vi.fn();

    render(
      <Slider
        aria-label="Disabled slider"
        disabled
        defaultValue={20}
        onValueChange={handleValueChange}
      />,
    );

    const sliderEl = screen.getByRole('slider', { name: 'Disabled slider' });
    if (!(sliderEl instanceof HTMLInputElement)) {
      throw new Error('Expected sliderEl to be an HTMLInputElement');
    }

    expect(sliderEl).toBeDisabled();

    await user.click(sliderEl);
    expect(handleValueChange).not.toHaveBeenCalled();
  });

  it('supports intent="error" by setting aria-invalid', () => {
    render(<Slider aria-label="Error slider" defaultValue={10} intent="error" />);

    const sliderEl = screen.getByRole('slider', { name: 'Error slider' });
    expect(sliderEl).toBeInvalid();
  });

  it('forwards ref to the underlying HTMLInputElement', async () => {
    const user = userEvent.setup();

    render(<RefTestComponent />);

    const sliderEl = screen.getByRole('slider', { name: 'Ref slider' });
    const focusBtn = screen.getByRole('button', { name: 'Focus Slider' });

    await user.click(focusBtn);
    expect(sliderEl).toHaveFocus();
  });

  it('integrates seamlessly with Field context', () => {
    render(
      <Field.Root id="opacity-field">
        <Field.Label>Opacity</Field.Label>
        <Field.Slider defaultValue={80} />
        <Field.Description>Adjust canvas opacity</Field.Description>
      </Field.Root>,
    );

    const sliderEl = screen.getByRole('slider', { name: 'Opacity' });
    if (!(sliderEl instanceof HTMLInputElement)) {
      throw new Error('Expected sliderEl to be an HTMLInputElement');
    }

    expect(sliderEl.id).toBe('opacity-field');
    expect(sliderEl.getAttribute('aria-describedby')).toContain('opacity-field-description');
  });

  it('inherits invalid error state when nested in an invalid Field.Root', () => {
    render(
      <Field.Root id="threshold-field" isInvalid>
        <Field.Label>Threshold</Field.Label>
        <Field.Slider defaultValue={30} />
        <Field.Error>Threshold cannot be lower than 50</Field.Error>
      </Field.Root>,
    );

    const sliderEl = screen.getByRole('slider', { name: 'Threshold' });
    expect(sliderEl).toBeInvalid();
    expect(sliderEl.getAttribute('aria-describedby')).toContain('threshold-field-error');
  });
});
