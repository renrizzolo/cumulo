import '@testing-library/jest-dom/vitest';
import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Dialog } from '../src/components/Dialog.js';
import { Popover } from '../src/components/Popover.js';

describe('Dialog Component', () => {
  beforeEach(() => {
    // JSDOM mock for HTMLDialogElement methods
    HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
      this.open = true;
    });
    HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
      this.open = false;
    });
    HTMLElement.prototype.showPopover = vi.fn();
    HTMLElement.prototype.hidePopover = vi.fn();
    HTMLElement.prototype.togglePopover = vi.fn();
  });

  it('renders closed by default and opens on trigger click', () => {
    render(
      <Dialog>
        <Dialog.Trigger data-testid="trigger">Open Dialog</Dialog.Trigger>
        <Dialog.Content data-testid="content">
          <Dialog.Header>
            <Dialog.Title data-testid="title">Dialog Title</Dialog.Title>
            <Dialog.Description data-testid="desc">Dialog details here.</Dialog.Description>
          </Dialog.Header>
          <Dialog.Close data-testid="close">Close</Dialog.Close>
        </Dialog.Content>
      </Dialog>,
    );

    const trigger = screen.getByTestId('trigger');
    const content = screen.getByTestId('content');

    expect(content.tagName).toBe('DIALOG');
    expect(HTMLDialogElement.prototype.showModal).not.toHaveBeenCalled();

    fireEvent.click(trigger);
    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalledTimes(1);

    const closeBtn = screen.getByTestId('close');
    fireEvent.click(closeBtn);
    expect(HTMLDialogElement.prototype.close).toHaveBeenCalledTimes(1);
  });

  it('connects aria-labelledby and aria-describedby automatically', () => {
    render(
      <Dialog defaultOpen>
        <Dialog.Content data-testid="content">
          <Dialog.Header>
            <Dialog.Title data-testid="title">Accessible Title</Dialog.Title>
            <Dialog.Description data-testid="desc">Accessible Description</Dialog.Description>
          </Dialog.Header>
        </Dialog.Content>
      </Dialog>,
    );

    const content = screen.getByTestId('content');
    const title = screen.getByTestId('title');
    const desc = screen.getByTestId('desc');

    expect(content.getAttribute('aria-labelledby')).toBe(title.id);
    expect(content.getAttribute('aria-describedby')).toBe(desc.id);
  });

  it('traps focus when navigating with Tab and Shift+Tab', () => {
    render(
      <Dialog defaultOpen>
        <Dialog.Content data-testid="content">
          <button data-testid="btn-1">First Button</button>
          <button data-testid="btn-2">Second Button</button>
          <Dialog.Close data-testid="btn-close">Close</Dialog.Close>
        </Dialog.Content>
      </Dialog>,
    );

    const btn1 = screen.getByTestId('btn-1');
    const btnClose = screen.getByTestId('btn-close');

    btn1.focus();
    expect(document.activeElement).toBe(btn1);

    // Shift+Tab from first element wraps to last element
    fireEvent.keyDown(screen.getByTestId('content'), { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(btnClose);

    // Tab from last element wraps to first element
    fireEvent.keyDown(screen.getByTestId('content'), { key: 'Tab', shiftKey: false });
    expect(document.activeElement).toBe(btn1);
  });

  it('preserves open dialog when closing a nested popover via Escape', () => {
    const onDialogClose = vi.fn();
    const onPopoverClose = vi.fn();

    render(
      <Dialog defaultOpen onOpenChange={(open) => !open && onDialogClose()}>
        <Dialog.Content data-testid="dialog-content">
          <Popover defaultOpen onOpenChange={(open) => !open && onPopoverClose()}>
            <Popover.Trigger data-testid="popover-trigger">Options</Popover.Trigger>
            <Popover.Content data-testid="popover-content">
              <button data-testid="popover-btn">Inner Action</button>
            </Popover.Content>
          </Popover>
        </Dialog.Content>
      </Dialog>,
    );

    const popoverContent = screen.getByTestId('popover-content');
    expect(popoverContent).toBeInTheDocument();
    expect(popoverContent).toHaveAttribute('data-state', 'open');

    // Focus inside popover and press Escape
    const popoverBtn = screen.getByTestId('popover-btn');
    popoverBtn.focus();
    fireEvent.keyDown(popoverContent, { key: 'Escape' });

    expect(onPopoverClose).toHaveBeenCalledTimes(1);
    expect(onDialogClose).not.toHaveBeenCalled();
  });
});
