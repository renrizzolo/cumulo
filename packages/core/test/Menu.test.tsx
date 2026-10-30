import '@testing-library/jest-dom/vitest';
import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as Menu from '../src/components/Menu.js';

describe('Menu Component', () => {
  beforeEach(() => {
    HTMLElement.prototype.showPopover = vi.fn();
    HTMLElement.prototype.hidePopover = vi.fn();
    HTMLElement.prototype.togglePopover = vi.fn();
  });

  it('opens and closes menu on trigger click and item selection', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(
      <Menu.Root>
        <Menu.Trigger>Actions</Menu.Trigger>
        <Menu.Content data-testid="menu-content">
          <Menu.Group>
            <Menu.Label>File</Menu.Label>
            <Menu.Item onSelect={onSelect} shortcut="⌘E">
              Edit
            </Menu.Item>
            <Menu.Separator />
            <Menu.Item intent="error" disabled>
              Delete
            </Menu.Item>
          </Menu.Group>
        </Menu.Content>
      </Menu.Root>,
    );

    const trigger = screen.getByRole('button', { name: 'Actions' });
    const content = screen.getByTestId('menu-content');

    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(content).toHaveAttribute('data-state', 'closed');

    await user.click(trigger);
    // In JSDOM, togglePopover is mocked, so trigger native toggle or state transition
    fireEvent(
      content,
      Object.assign(new Event('toggle'), {
        newState: 'open',
      }),
    );

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(content).toHaveAttribute('data-state', 'open');

    const editItem = screen.getByRole('menuitem', { name: /Edit/i, hidden: true });
    await user.click(editItem);

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(content).toHaveAttribute('data-state', 'closed');
  });

  it('does not double-toggle when native popoverTargetElement is supported by the browser', async () => {
    const user = userEvent.setup();

    render(
      <Menu.Root>
        <Menu.Trigger>Native Actions</Menu.Trigger>
        <Menu.Content data-testid="menu-content">
          <Menu.Item>First Action</Menu.Item>
        </Menu.Content>
      </Menu.Root>,
    );

    const trigger = screen.getByRole('button', { name: 'Native Actions' });
    const content = screen.getByTestId('menu-content');

    // Simulate a browser that natively implements HTMLButtonElement.popoverTargetElement
    Object.defineProperty(trigger, 'popoverTargetElement', {
      value: content,
      configurable: true,
    });

    await user.click(trigger);

    // handleClick should defer to the browser's native popoverTarget activation rather than calling showPopover() early
    expect(content.showPopover).not.toHaveBeenCalled();

    // Browser dispatches the toggle event after opening the popover
    fireEvent(
      content,
      Object.assign(new Event('toggle'), {
        newState: 'open',
      }),
    );

    expect(content).toHaveAttribute('data-state', 'open');
  });

  it('navigates between non-disabled menu items with arrow keys and dismisses on Escape', () => {
    const onOpenChange = vi.fn();

    render(
      <Menu.Root defaultOpen onOpenChange={onOpenChange}>
        <Menu.Trigger>Menu</Menu.Trigger>
        <Menu.Content data-testid="menu-content">
          <Menu.Item data-testid="item-1">Profile</Menu.Item>
          <Menu.Item data-testid="item-disabled" disabled>
            Billing
          </Menu.Item>
          <Menu.Item data-testid="item-2">Settings</Menu.Item>
        </Menu.Content>
      </Menu.Root>,
    );

    const content = screen.getByTestId('menu-content');
    const item1 = screen.getByTestId('item-1');
    const item2 = screen.getByTestId('item-2');

    item1.focus();
    expect(document.activeElement).toBe(item1);

    fireEvent.keyDown(content, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(item2);

    fireEvent.keyDown(content, { key: 'ArrowUp' });
    expect(document.activeElement).toBe(item1);

    fireEvent.keyDown(content, { key: 'Escape' });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
