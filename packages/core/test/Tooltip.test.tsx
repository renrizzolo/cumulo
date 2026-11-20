import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

import * as Tooltip from '../src/components/Tooltip.js';

describe('Tooltip Component', () => {
  let showPopoverMock: () => void;
  let hidePopoverMock: () => void;

  beforeEach(() => {
    vi.useFakeTimers();
    showPopoverMock = vi.fn();
    hidePopoverMock = vi.fn();
    HTMLElement.prototype.showPopover = showPopoverMock;
    HTMLElement.prototype.hidePopover = hidePopoverMock;
    HTMLElement.prototype.togglePopover = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders tooltip with immutable role="tooltip" and popover="manual"', () => {
    render(
      <Tooltip.Root id="tooltip-test">
        <Tooltip.Trigger data-testid="trigger">Hover me</Tooltip.Trigger>
        <Tooltip.Content data-testid="tooltip">Tooltip hint</Tooltip.Content>
      </Tooltip.Root>,
    );

    const tooltip = screen.getByTestId('tooltip');
    const trigger = screen.getByTestId('trigger');

    expect(tooltip).toBeInTheDocument();
    expect(tooltip.getAttribute('role')).toBe('tooltip');
    expect(tooltip.getAttribute('popover')).toBe('manual');
    expect(trigger).toHaveAttribute('aria-describedby');
    expect(trigger).not.toHaveAttribute('aria-expanded');
    expect(trigger).not.toHaveAttribute('aria-controls');
  });

  it('does not set aria-expanded on span trigger for accessible nesting', () => {
    render(
      <Tooltip.Root id="span-test">
        <Tooltip.Trigger as="span" data-testid="span-trigger">
          <button type="button">Nested Button</button>
        </Tooltip.Trigger>
        <Tooltip.Content data-testid="tooltip">Hint</Tooltip.Content>
      </Tooltip.Root>,
    );

    const trigger = screen.getByTestId('span-trigger');
    expect(trigger).not.toHaveAttribute('aria-expanded');
    expect(trigger).not.toHaveAttribute('aria-controls');
    expect(trigger).toHaveAttribute('aria-describedby', 'span-test');
  });

  it('links trigger and content via anchor-name and position-anchor', () => {
    render(
      <Tooltip.Root id="anchor-test">
        <Tooltip.Trigger data-testid="trigger">Action</Tooltip.Trigger>
        <Tooltip.Content data-testid="content">Hint</Tooltip.Content>
      </Tooltip.Root>,
    );

    const trigger = screen.getByTestId('trigger');
    const content = screen.getByTestId('content');

    expect(trigger.getAttribute('style')).toContain('anchor-name: --popover-anchor-test');
    expect(content.getAttribute('style')).toContain('position-anchor: --popover-anchor-test');
  });

  it('opens and closes on pointer enter and pointer leave', () => {
    render(
      <Tooltip.Root>
        <Tooltip.Trigger data-testid="trigger">Hover me</Tooltip.Trigger>
        <Tooltip.Content data-testid="content">Tooltip text</Tooltip.Content>
      </Tooltip.Root>,
    );

    const trigger = screen.getByTestId('trigger');

    act(() => {
      fireEvent.pointerEnter(trigger);
    });
    expect(showPopoverMock).toHaveBeenCalled();

    act(() => {
      fireEvent.pointerLeave(trigger);
    });
    expect(hidePopoverMock).toHaveBeenCalled();
  });

  it('opens on focus and closes on blur', () => {
    render(
      <Tooltip.Root>
        <Tooltip.Trigger data-testid="trigger">Focus me</Tooltip.Trigger>
        <Tooltip.Content data-testid="content">Focus hint</Tooltip.Content>
      </Tooltip.Root>,
    );

    const trigger = screen.getByTestId('trigger');

    act(() => {
      fireEvent.focus(trigger);
    });
    expect(showPopoverMock).toHaveBeenCalled();

    act(() => {
      fireEvent.blur(trigger);
    });
    expect(hidePopoverMock).toHaveBeenCalled();
  });

  it('respects delay prop when opening', () => {
    render(
      <Tooltip.Root delay={200}>
        <Tooltip.Trigger data-testid="trigger">Hover delayed</Tooltip.Trigger>
        <Tooltip.Content data-testid="content">Delayed hint</Tooltip.Content>
      </Tooltip.Root>,
    );

    const trigger = screen.getByTestId('trigger');

    act(() => {
      fireEvent.pointerEnter(trigger);
    });
    expect(showPopoverMock).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(showPopoverMock).toHaveBeenCalled();
  });

  it('closes on Escape key press', () => {
    render(
      <Tooltip.Root defaultOpen>
        <Tooltip.Trigger data-testid="trigger">Escape me</Tooltip.Trigger>
        <Tooltip.Content data-testid="content">Escape hint</Tooltip.Content>
      </Tooltip.Root>,
    );

    const trigger = screen.getByTestId('trigger');

    act(() => {
      fireEvent.keyDown(trigger, { key: 'Escape' });
    });
    expect(hidePopoverMock).toHaveBeenCalled();
  });
});
