import '@testing-library/jest-dom/vitest';
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ButtonGroup } from '../src/components/ButtonGroup.js';

describe('ButtonGroup Component', () => {
  it('renders button group and items with proper roles and initial pressed state', () => {
    const { container } = render(
      <ButtonGroup.Root defaultValue="opt1">
        <ButtonGroup.Item value="opt1">Option 1</ButtonGroup.Item>
        <ButtonGroup.Item value="opt2">Option 2</ButtonGroup.Item>
      </ButtonGroup.Root>,
    );

    expect(container.firstChild).toHaveAttribute('data-orientation', 'horizontal');

    const opt1 = screen.getByRole('button', { name: 'Option 1' });
    const opt2 = screen.getByRole('button', { name: 'Option 2' });

    expect(opt1).toHaveAttribute('aria-pressed', 'true');
    expect(opt1).toHaveAttribute('data-state', 'active');
    expect(opt2).toHaveAttribute('aria-pressed', 'false');
    expect(opt2).toHaveAttribute('data-state', 'inactive');
  });

  it('changes selected state on click and fires onValueChange', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(
      <ButtonGroup.Root defaultValue="opt1" onValueChange={onValueChange}>
        <ButtonGroup.Item value="opt1">Option 1</ButtonGroup.Item>
        <ButtonGroup.Item value="opt2">Option 2</ButtonGroup.Item>
      </ButtonGroup.Root>,
    );

    const opt2 = screen.getByRole('button', { name: 'Option 2' });
    await user.click(opt2);

    expect(onValueChange).toHaveBeenCalledWith('opt2');
    expect(opt2).toHaveAttribute('aria-pressed', 'true');
    expect(opt2).toHaveAttribute('data-state', 'active');

    const opt1 = screen.getByRole('button', { name: 'Option 1' });
    expect(opt1).toHaveAttribute('aria-pressed', 'false');
  });

  it('respects disabled state on items', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(
      <ButtonGroup.Root defaultValue="opt1" onValueChange={onValueChange}>
        <ButtonGroup.Item value="opt1">Option 1</ButtonGroup.Item>
        <ButtonGroup.Item value="opt2" disabled>
          Option 2
        </ButtonGroup.Item>
      </ButtonGroup.Root>,
    );

    const opt2 = screen.getByRole('button', { name: 'Option 2' });
    expect(opt2).toBeDisabled();

    await user.click(opt2);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('supports controlled value', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    const { rerender } = render(
      <ButtonGroup.Root value="opt1" onValueChange={onValueChange}>
        <ButtonGroup.Item value="opt1">Option 1</ButtonGroup.Item>
        <ButtonGroup.Item value="opt2">Option 2</ButtonGroup.Item>
      </ButtonGroup.Root>,
    );

    const opt1 = screen.getByRole('button', { name: 'Option 1' });
    const opt2 = screen.getByRole('button', { name: 'Option 2' });

    expect(opt1).toHaveAttribute('aria-pressed', 'true');
    expect(opt2).toHaveAttribute('aria-pressed', 'false');

    await user.click(opt2);
    expect(onValueChange).toHaveBeenCalledWith('opt2');

    rerender(
      <ButtonGroup.Root value="opt2" onValueChange={onValueChange}>
        <ButtonGroup.Item value="opt1">Option 1</ButtonGroup.Item>
        <ButtonGroup.Item value="opt2">Option 2</ButtonGroup.Item>
      </ButtonGroup.Root>,
    );

    expect(opt1).toHaveAttribute('aria-pressed', 'false');
    expect(opt2).toHaveAttribute('aria-pressed', 'true');
  });
});
