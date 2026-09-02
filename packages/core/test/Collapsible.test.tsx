import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Collapsible } from '../src/index.js';

afterEach(() => {
  cleanup();
});

describe('Collapsible component', () => {
  it('renders in closed state by default', () => {
    render(
      <Collapsible.Root>
        <Collapsible.Trigger>Toggle Panel</Collapsible.Trigger>
        <Collapsible.Content>Hidden Content</Collapsible.Content>
      </Collapsible.Root>,
    );

    const trigger = screen.getByRole('button', { name: 'Toggle Panel' });
    const content = screen.getByRole('region');

    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveAttribute('data-state', 'closed');
    expect(content).toHaveAttribute('data-state', 'closed');
    expect(trigger.getAttribute('aria-controls')).toBe(content.id);
  });

  it('toggles open state on trigger click in uncontrolled mode', async () => {
    const user = userEvent.setup();

    render(
      <Collapsible.Root defaultOpen={false}>
        <Collapsible.Trigger>Toggle</Collapsible.Trigger>
        <Collapsible.Content>Panel Content</Collapsible.Content>
      </Collapsible.Root>,
    );

    const trigger = screen.getByRole('button', { name: 'Toggle' });
    const content = screen.getByRole('region');

    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(content).toHaveAttribute('data-state', 'closed');

    await user.click(trigger);

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(content).toHaveAttribute('data-state', 'open');

    await user.click(trigger);

    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(content).toHaveAttribute('data-state', 'closed');
  });

  it('supports controlled open state and onOpenChange callback', async () => {
    const user = userEvent.setup();
    const handleOpenChange = vi.fn();

    function ControlledComponent() {
      const [open, setOpen] = useState(false);
      return (
        <Collapsible.Root
          open={open}
          onOpenChange={(next) => {
            setOpen(next);
            handleOpenChange(next);
          }}
        >
          <Collapsible.Trigger>Controlled Trigger</Collapsible.Trigger>
          <Collapsible.Content>Controlled Content</Collapsible.Content>
        </Collapsible.Root>
      );
    }

    render(<ControlledComponent />);

    const trigger = screen.getByRole('button', { name: 'Controlled Trigger' });
    await user.click(trigger);

    expect(handleOpenChange).toHaveBeenCalledWith(true);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('does not toggle when disabled', async () => {
    const user = userEvent.setup();

    render(
      <Collapsible.Root disabled>
        <Collapsible.Trigger>Disabled Toggle</Collapsible.Trigger>
        <Collapsible.Content>Protected Content</Collapsible.Content>
      </Collapsible.Root>,
    );

    const trigger = screen.getByRole('button', { name: 'Disabled Toggle' });
    const content = screen.getByRole('region');

    expect(trigger).toBeDisabled();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await user.click(trigger);

    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(content).toHaveAttribute('data-state', 'closed');
  });

  it('forwards Button variants and props on Collapsible.Trigger', async () => {
    const user = userEvent.setup();

    render(
      <Collapsible.Root>
        <Collapsible.Trigger variant="secondary" size="sm">
          Trigger Button
        </Collapsible.Trigger>
        <Collapsible.Content>Content inside</Collapsible.Content>
      </Collapsible.Root>,
    );

    const trigger = screen.getByRole('button', { name: 'Trigger Button' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await user.click(trigger);

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('coordinates custom IDs between trigger and content', () => {
    render(
      <Collapsible.Root id="custom-root">
        <Collapsible.Trigger id="custom-trigger">Trigger</Collapsible.Trigger>
        <Collapsible.Content id="custom-content">Content</Collapsible.Content>
      </Collapsible.Root>,
    );

    const trigger = screen.getByRole('button', { name: 'Trigger' });
    const content = screen.getByRole('region');

    expect(trigger).toHaveAttribute('id', 'custom-trigger');
    expect(trigger).toHaveAttribute('aria-controls', 'custom-content');
    expect(content).toHaveAttribute('id', 'custom-content');
    expect(content).toHaveAttribute('aria-labelledby', 'custom-trigger');
  });
});
