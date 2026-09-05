import '@testing-library/jest-dom/vitest';
import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Popover } from '../src/components/Popover.js';

describe('Popover Component', () => {
  beforeEach(() => {
    HTMLElement.prototype.showPopover = vi.fn();
    HTMLElement.prototype.hidePopover = vi.fn();
    HTMLElement.prototype.togglePopover = vi.fn();
  });

  it('renders popover trigger and content', () => {
    render(
      <Popover>
        <Popover.Trigger data-testid="trigger">Toggle Popover</Popover.Trigger>
        <Popover.Content data-testid="content">
          <p>Popover content text</p>
          <Popover.Close data-testid="close">Close</Popover.Close>
        </Popover.Content>
      </Popover>,
    );

    const trigger = screen.getByTestId('trigger');
    const content = screen.getByTestId('content');

    expect(content).toBeInTheDocument();
    expect(content.getAttribute('popover')).toBe('auto');
    expect(trigger.getAttribute('popovertarget')).toBe(content.id);

    fireEvent.click(trigger);
    expect(HTMLElement.prototype.togglePopover).toHaveBeenCalled();
  });

  it('links trigger and content via anchor-name and position-anchor', () => {
    render(
      <Popover id="test-anchor">
        <Popover.Trigger data-testid="trigger">Open</Popover.Trigger>
        <Popover.Content data-testid="content">Menu</Popover.Content>
      </Popover>,
    );

    const trigger = screen.getByTestId('trigger');
    const content = screen.getByTestId('content');

    expect(trigger.getAttribute('style')).toContain('anchor-name: --popover-test-anchor');
    expect(content.getAttribute('style')).toContain('position-anchor: --popover-test-anchor');
  });

  it('closes on tab out by default when reaching the last element', () => {
    render(
      <Popover defaultOpen>
        <Popover.Content data-testid="content" closeOnTabOut>
          <button data-testid="btn-1">Action 1</button>
          <button data-testid="btn-2">Action 2</button>
        </Popover.Content>
      </Popover>,
    );

    const btn2 = screen.getByTestId('btn-2');
    btn2.focus();

    fireEvent.keyDown(screen.getByTestId('content'), { key: 'Tab', shiftKey: false });
    expect(HTMLElement.prototype.hidePopover).toHaveBeenCalled();
  });

  it('loops focus when loopFocus is true', () => {
    render(
      <Popover defaultOpen>
        <Popover.Content data-testid="content" loopFocus>
          <button data-testid="btn-1">Action 1</button>
          <button data-testid="btn-2">Action 2</button>
        </Popover.Content>
      </Popover>,
    );

    const btn1 = screen.getByTestId('btn-1');
    const btn2 = screen.getByTestId('btn-2');

    btn2.focus();
    fireEvent.keyDown(screen.getByTestId('content'), { key: 'Tab', shiftKey: false });
    expect(document.activeElement).toBe(btn1);

    fireEvent.keyDown(screen.getByTestId('content'), { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(btn2);
  });

  it('closes when tabbing backwards from the trigger while open', () => {
    render(
      <Popover defaultOpen>
        <Popover.Trigger data-testid="trigger">Open Popover</Popover.Trigger>
        <Popover.Content data-testid="content">
          <button>Content Button</button>
        </Popover.Content>
      </Popover>,
    );

    const trigger = screen.getByTestId('trigger');
    trigger.focus();

    fireEvent.keyDown(trigger, { key: 'Tab', shiftKey: true });
    expect(HTMLElement.prototype.hidePopover).toHaveBeenCalled();
  });
});
