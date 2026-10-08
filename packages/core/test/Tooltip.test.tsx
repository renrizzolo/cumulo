import '@testing-library/jest-dom/vitest';
import React from 'react';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Tooltip, TooltipRoot, TooltipTrigger, TooltipContent } from '../src/components/Tooltip.js';

describe('Tooltip Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    HTMLElement.prototype.showPopover = vi.fn();
    HTMLElement.prototype.hidePopover = vi.fn();
    HTMLElement.prototype.togglePopover = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders tooltip with immutable role="tooltip" and popover="manual"', () => {
    render(
      <Tooltip id="tooltip-test">
        <Tooltip.Trigger data-testid="trigger">Hover me</Tooltip.Trigger>
        <Tooltip.Content data-testid="tooltip">Tooltip hint</Tooltip.Content>
      </Tooltip>,
    );

    const tooltip = screen.getByTestId('tooltip');
    const trigger = screen.getByTestId('trigger');

    expect(tooltip).toBeInTheDocument();
    expect(tooltip.getAttribute('role')).toBe('tooltip');
    expect(tooltip.getAttribute('popover')).toBe('manual');
    expect(trigger).toHaveAttribute('aria-describedby');
  });

  it('links trigger and content via anchor-name and position-anchor', () => {
    render(
      <TooltipRoot id="anchor-test">
        <TooltipTrigger data-testid="trigger">Action</TooltipTrigger>
        <TooltipContent data-testid="content">Hint</TooltipContent>
      </TooltipRoot>,
    );

    const trigger = screen.getByTestId('trigger');
    const content = screen.getByTestId('content');

    expect(trigger.getAttribute('style')).toContain('anchor-name: --popover-anchor-test');
    expect(content.getAttribute('style')).toContain('position-anchor: --popover-anchor-test');
  });

  it('opens and closes on pointer enter and pointer leave', () => {
    render(
      <Tooltip>
        <Tooltip.Trigger data-testid="trigger">Hover me</Tooltip.Trigger>
        <Tooltip.Content data-testid="content">Tooltip text</Tooltip.Content>
      </Tooltip>,
    );

    const trigger = screen.getByTestId('trigger');

    act(() => {
      fireEvent.pointerEnter(trigger);
    });
    expect(HTMLElement.prototype.showPopover).toHaveBeenCalled();

    act(() => {
      fireEvent.pointerLeave(trigger);
    });
    expect(HTMLElement.prototype.hidePopover).toHaveBeenCalled();
  });

  it('opens on focus and closes on blur', () => {
    render(
      <Tooltip>
        <Tooltip.Trigger data-testid="trigger">Focus me</Tooltip.Trigger>
        <Tooltip.Content data-testid="content">Focus hint</Tooltip.Content>
      </Tooltip>,
    );

    const trigger = screen.getByTestId('trigger');

    act(() => {
      fireEvent.focus(trigger);
    });
    expect(HTMLElement.prototype.showPopover).toHaveBeenCalled();

    act(() => {
      fireEvent.blur(trigger);
    });
    expect(HTMLElement.prototype.hidePopover).toHaveBeenCalled();
  });

  it('respects delay prop when opening', () => {
    render(
      <Tooltip delay={200}>
        <Tooltip.Trigger data-testid="trigger">Hover delayed</Tooltip.Trigger>
        <Tooltip.Content data-testid="content">Delayed hint</Tooltip.Content>
      </Tooltip>,
    );

    const trigger = screen.getByTestId('trigger');

    act(() => {
      fireEvent.pointerEnter(trigger);
    });
    expect(HTMLElement.prototype.showPopover).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(HTMLElement.prototype.showPopover).toHaveBeenCalled();
  });

  it('closes on Escape key press', () => {
    render(
      <Tooltip defaultOpen>
        <Tooltip.Trigger data-testid="trigger">Escape me</Tooltip.Trigger>
        <Tooltip.Content data-testid="content">Escape hint</Tooltip.Content>
      </Tooltip>,
    );

    const trigger = screen.getByTestId('trigger');

    act(() => {
      fireEvent.keyDown(trigger, { key: 'Escape' });
    });
    expect(HTMLElement.prototype.hidePopover).toHaveBeenCalled();
  });
});
