import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import * as Dialog from '../src/components/Dialog.js';
import * as Popover from '../src/components/Popover.js';

describe('Dialog Component', () => {
  let showModalMock: () => void;
  let closeMock: () => void;

  beforeEach(() => {
    // JSDOM mock for HTMLDialogElement methods
    showModalMock = vi.fn(function (this: HTMLDialogElement) {
      this.open = true;
    });
    closeMock = vi.fn(function (this: HTMLDialogElement) {
      this.open = false;
    });
    HTMLDialogElement.prototype.showModal = showModalMock;
    HTMLDialogElement.prototype.close = closeMock;
    HTMLElement.prototype.showPopover = vi.fn();
    HTMLElement.prototype.hidePopover = vi.fn();
    HTMLElement.prototype.togglePopover = vi.fn();
  });

  it('renders closed by default and opens on trigger click', () => {
    render(
      <Dialog.Root>
        <Dialog.Trigger data-testid="trigger">Open Dialog</Dialog.Trigger>
        <Dialog.Content data-testid="content">
          <Dialog.Header>
            <Dialog.Title data-testid="title">Dialog Title</Dialog.Title>
            <Dialog.Description data-testid="desc">Dialog details here.</Dialog.Description>
          </Dialog.Header>
          <Dialog.Close data-testid="close">Close</Dialog.Close>
        </Dialog.Content>
      </Dialog.Root>,
    );

    const trigger = screen.getByTestId('trigger');
    const content = screen.getByTestId('content');

    expect(content.tagName).toBe('DIALOG');
    expect(showModalMock).not.toHaveBeenCalled();

    fireEvent.click(trigger);
    expect(showModalMock).toHaveBeenCalledTimes(1);

    const closeBtn = screen.getByTestId('close');
    fireEvent.click(closeBtn);
    expect(closeMock).toHaveBeenCalledTimes(1);
  });

  it('passes contentProps through to the inner content surface', () => {
    const contentRef = React.createRef<HTMLElement>();
    render(
      <Dialog.Root defaultOpen>
        <Dialog.Content data-testid="content" contentProps={{ ref: contentRef, id: 'inner-id' }}>
          <Dialog.Body>Body</Dialog.Body>
        </Dialog.Content>
      </Dialog.Root>,
    );

    const dialog = screen.getByTestId('content');
    const inner = contentRef.current;
    if (!inner) throw new Error('Expected content surface ref to be set');
    expect(inner.id).toBe('inner-id');
    expect(inner.parentElement).toBe(dialog);
    expect(dialog).not.toHaveAttribute('id', 'inner-id');
  });

  it('connects aria-labelledby and aria-describedby automatically', () => {
    render(
      <Dialog.Root defaultOpen>
        <Dialog.Content data-testid="content">
          <Dialog.Header>
            <Dialog.Title data-testid="title">Accessible Title</Dialog.Title>
            <Dialog.Description data-testid="desc">Accessible Description</Dialog.Description>
          </Dialog.Header>
        </Dialog.Content>
      </Dialog.Root>,
    );

    const content = screen.getByTestId('content');
    const title = screen.getByTestId('title');
    const desc = screen.getByTestId('desc');

    expect(content.getAttribute('aria-labelledby')).toBe(title.id);
    expect(content.getAttribute('aria-describedby')).toBe(desc.id);
  });

  it('omits aria-describedby when Dialog.Description is not rendered', () => {
    render(
      <Dialog.Root defaultOpen>
        <Dialog.Content data-testid="content">
          <Dialog.Header>
            <Dialog.Title data-testid="title">Title Only</Dialog.Title>
          </Dialog.Header>
          <Dialog.Body data-testid="body">Body text</Dialog.Body>
          <Dialog.Footer data-testid="footer">
            <Dialog.Close>Cancel</Dialog.Close>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Root>,
    );

    const content = screen.getByTestId('content');
    const title = screen.getByTestId('title');

    expect(content.getAttribute('aria-labelledby')).toBe(title.id);
    expect(content).not.toHaveAttribute('aria-describedby');
    expect(screen.getByTestId('body')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('traps focus when navigating with Tab and Shift+Tab', () => {
    render(
      <Dialog.Root defaultOpen>
        <Dialog.Content data-testid="content">
          <button data-testid="btn-1">First Button</button>
          <button data-testid="btn-2">Second Button</button>
          <Dialog.Close data-testid="btn-close">Close</Dialog.Close>
        </Dialog.Content>
      </Dialog.Root>,
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
      <Dialog.Root defaultOpen onOpenChange={(open) => !open && onDialogClose()}>
        <Dialog.Content data-testid="dialog-content">
          <Popover.Root defaultOpen onOpenChange={(open) => !open && onPopoverClose()}>
            <Popover.Trigger data-testid="popover-trigger">Options</Popover.Trigger>
            <Popover.Content data-testid="popover-content">
              <button data-testid="popover-btn">Inner Action</button>
            </Popover.Content>
          </Popover.Root>
        </Dialog.Content>
      </Dialog.Root>,
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

  it('exposes data-placement and data-state attributes across placements', () => {
    const placements = ['center', 'bottom', 'left', 'right'] as const;

    for (const placement of placements) {
      const { unmount } = render(
        <Dialog.Root>
          <Dialog.Trigger data-testid="trigger">Open</Dialog.Trigger>
          <Dialog.Content data-testid="content" placement={placement}>
            <Dialog.Title>Title</Dialog.Title>
          </Dialog.Content>
        </Dialog.Root>,
      );

      const content = screen.getByTestId('content');
      expect(content).toHaveAttribute('data-placement', placement);
      expect(content).toHaveAttribute('data-state', 'closed');

      fireEvent.click(screen.getByTestId('trigger'));
      expect(content).toHaveAttribute('data-state', 'open');
      expect(showModalMock).toHaveBeenCalled();

      unmount();
    }
  });

  it('dismisses a bottom sheet when dragging Dialog.Handle downward past threshold', () => {
    const onOpenChange = vi.fn();

    render(
      <Dialog.Root defaultOpen onOpenChange={onOpenChange}>
        <Dialog.Content data-testid="content" placement="bottom">
          <Dialog.Handle data-testid="handle" threshold={60} />
          <Dialog.Header>
            <Dialog.Title>Bottom Sheet</Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>Sheet content</Dialog.Body>
        </Dialog.Content>
      </Dialog.Root>,
    );

    const handle = screen.getByTestId('handle');
    expect(handle).toHaveAttribute('data-swipe-direction', 'down');

    fireEvent.pointerDown(handle, { button: 0, clientX: 0, clientY: 0 });
    fireEvent.pointerMove(handle, { clientX: 0, clientY: 100 });
    fireEvent.pointerUp(handle, { clientX: 0, clientY: 100 });

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(closeMock).toHaveBeenCalledTimes(1);
  });

  it('infers horizontal swipe direction for Dialog.Handle inside side sheets', () => {
    const onOpenChange = vi.fn();

    render(
      <Dialog.Root defaultOpen onOpenChange={onOpenChange}>
        <Dialog.Content data-testid="content" placement="right">
          <Dialog.Handle data-testid="handle" threshold={60} />
          <Dialog.Title>Right Sheet</Dialog.Title>
        </Dialog.Content>
      </Dialog.Root>,
    );

    const handle = screen.getByTestId('handle');
    expect(handle).toHaveAttribute('data-swipe-direction', 'right');

    fireEvent.pointerDown(handle, { button: 0, clientX: 0, clientY: 0 });
    fireEvent.pointerMove(handle, { clientX: 100, clientY: 0 });
    fireEvent.pointerUp(handle, { clientX: 100, clientY: 0 });

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(closeMock).toHaveBeenCalledTimes(1);
  });

  it('resets drag state and inline transform if closed mid-drag and reopened', () => {
    const { rerender } = render(
      <Dialog.Root open>
        <Dialog.Content data-testid="content" placement="bottom">
          <Dialog.Handle data-testid="handle" threshold={120} />
          <Dialog.Title>Bottom Sheet</Dialog.Title>
        </Dialog.Content>
      </Dialog.Root>,
    );

    const content = screen.getByTestId('content');
    const handle = screen.getByTestId('handle');

    fireEvent.pointerDown(handle, { button: 0, clientX: 0, clientY: 0 });
    fireEvent.pointerMove(handle, { clientX: 0, clientY: 50 });
    expect(handle).toHaveAttribute('data-dragging', 'true');
    expect(content.style.transform).toBe('translate3d(0, 50px, 0)');

    // Close dialog without pointerup (e.g. Escape or programmatic close)
    rerender(
      <Dialog.Root open={false}>
        <Dialog.Content data-testid="content" placement="bottom">
          <Dialog.Handle data-testid="handle" threshold={120} />
          <Dialog.Title>Bottom Sheet</Dialog.Title>
        </Dialog.Content>
      </Dialog.Root>,
    );

    expect(handle).not.toHaveAttribute('data-dragging');
    expect(content.style.transform).toBe('');

    // Reopen dialog: moving pointer without pointerdown must not drag or jump
    rerender(
      <Dialog.Root open>
        <Dialog.Content data-testid="content" placement="bottom">
          <Dialog.Handle data-testid="handle" threshold={120} />
          <Dialog.Title>Bottom Sheet</Dialog.Title>
        </Dialog.Content>
      </Dialog.Root>,
    );

    fireEvent.pointerMove(handle, { clientX: 0, clientY: 80 });
    expect(handle).not.toHaveAttribute('data-dragging');
    expect(content.style.transform).toBe('');
  });
});
