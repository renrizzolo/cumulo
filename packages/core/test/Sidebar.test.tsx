import React, { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { getSheetCss } from '@cumulo/css';
import { Sidebar } from '../src/components/Sidebar.js';
import { useSidebar } from '../src/hooks/useSidebar.js';

function TestSidebarConsumer() {
  useSidebar();
  return null;
}

describe('Sidebar component', () => {
  it('renders in expanded state by default and toggles via Sidebar.Toggle in uncontrolled mode', async () => {
    const user = userEvent.setup();
    render(
      <Sidebar variant="docked" position="left" hoverBehaviour="none" data-testid="sidebar">
        <Sidebar.Toggle />
        <div>Sidebar Content</div>
      </Sidebar>,
    );

    const sidebar = screen.getByTestId('sidebar');
    const toggle = screen.getByRole('button', { name: /collapse sidebar/i });

    expect(sidebar).toHaveAttribute('data-collapsed', 'false');
    expect(toggle).toHaveAttribute('aria-expanded', 'true');

    await user.click(toggle);

    expect(sidebar).toHaveAttribute('data-collapsed', 'true');
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(toggle).toHaveAttribute('aria-label', 'Expand sidebar');
  });

  it('respects defaultCollapsed={true}', () => {
    render(
      <Sidebar
        variant="docked"
        position="left"
        defaultCollapsed
        hoverBehaviour="none"
        data-testid="sidebar"
      >
        <Sidebar.Toggle />
      </Sidebar>,
    );

    const sidebar = screen.getByTestId('sidebar');
    const toggle = screen.getByRole('button', { name: /expand sidebar/i });

    expect(sidebar).toHaveAttribute('data-collapsed', 'true');
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('supports controlled collapsed state and calls onCollapsedChange', async () => {
    const user = userEvent.setup();
    const handleCollapsedChange = vi.fn();

    function ControlledTest() {
      const [collapsed, setCollapsed] = useState(false);
      return (
        <Sidebar
          variant="docked"
          position="left"
          hoverBehaviour="none"
          collapsed={collapsed}
          onCollapsedChange={(next) => {
            handleCollapsedChange(next);
            setCollapsed(next);
          }}
          data-testid="sidebar"
        >
          <Sidebar.Toggle />
        </Sidebar>
      );
    }

    render(<ControlledTest />);

    const sidebar = screen.getByTestId('sidebar');
    const toggle = screen.getByRole('button', { name: /collapse sidebar/i });

    expect(sidebar).toHaveAttribute('data-collapsed', 'false');

    await user.click(toggle);

    expect(handleCollapsedChange).toHaveBeenCalledWith(true);
    expect(sidebar).toHaveAttribute('data-collapsed', 'true');
  });

  it('renders with variants data attribute', () => {
    const { rerender } = render(
      <Sidebar variant="floating" position="left" hoverBehaviour="none" data-testid="sidebar" />,
    );
    expect(screen.getByTestId('sidebar')).toHaveAttribute('data-variant', 'floating');

    rerender(
      <Sidebar variant="inset" position="left" hoverBehaviour="none" data-testid="sidebar" />,
    );
    expect(screen.getByTestId('sidebar')).toHaveAttribute('data-variant', 'inset');

    rerender(
      <Sidebar variant="docked" position="left" hoverBehaviour="none" data-testid="sidebar" />,
    );
    expect(screen.getByTestId('sidebar')).toHaveAttribute('data-variant', 'docked');
  });

  it('supports hoverBehaviour="expand" when collapsed', () => {
    render(
      <Sidebar
        variant="docked"
        position="left"
        defaultCollapsed
        hoverBehaviour="expand"
        data-testid="sidebar"
      >
        <Sidebar.Toggle />
      </Sidebar>,
    );

    const sidebar = screen.getByTestId('sidebar');
    expect(sidebar).toHaveAttribute('data-collapsed', 'true');
    expect(sidebar).toHaveAttribute('data-hover-behavior', 'expand');
  });

  it('supports hoverBehaviour="tooltip"', () => {
    render(
      <Sidebar
        variant="docked"
        position="left"
        defaultCollapsed
        hoverBehaviour="tooltip"
        data-testid="sidebar"
      >
        <Sidebar.Toggle />
      </Sidebar>,
    );

    const sidebar = screen.getByTestId('sidebar');
    expect(sidebar).toHaveAttribute('data-collapsed', 'true');
    expect(sidebar).toHaveAttribute('data-tooltip-mode', 'true');
    expect(sidebar).toHaveAttribute('data-hover-behavior', 'tooltip');
  });

  describe('SidebarProvider + SidebarRoot composition', () => {
    it('supports SidebarProvider wrapping an external Sidebar.Toggle and SidebarRoot', async () => {
      const user = userEvent.setup();
      render(
        <Sidebar.Provider position="left" hoverBehaviour="expand">
          <header>
            <Sidebar.Toggle data-testid="external-toggle" />
          </header>
          <Sidebar.Root variant="docked" data-testid="sidebar-root">
            <div>Sidebar content</div>
          </Sidebar.Root>
        </Sidebar.Provider>,
      );

      const root = screen.getByTestId('sidebar-root');
      const toggle = screen.getByTestId('external-toggle');

      expect(root).toHaveAttribute('data-collapsed', 'false');
      expect(root).toHaveAttribute('data-hover-behavior', 'expand');
      expect(toggle).toHaveAttribute('aria-expanded', 'true');

      await user.click(toggle);

      expect(root).toHaveAttribute('data-collapsed', 'true');
      expect(toggle).toHaveAttribute('aria-expanded', 'false');
    });

    it('clears hover suppression on the first mouse enter when collapsed via an external toggle', async () => {
      const user = userEvent.setup();
      render(
        <Sidebar.Provider position="left" hoverBehaviour="expand">
          <header>
            <Sidebar.Toggle data-testid="external-toggle" />
          </header>
          <Sidebar.Root variant="docked" data-testid="sidebar-root">
            <div>Sidebar content</div>
          </Sidebar.Root>
        </Sidebar.Provider>,
      );

      const root = screen.getByTestId('sidebar-root');
      const toggle = screen.getByTestId('external-toggle');

      expect(root).toHaveAttribute('data-collapsed', 'false');

      // Click external toggle (pointer is outside sidebar)
      await user.click(toggle);

      expect(root).toHaveAttribute('data-collapsed', 'true');

      // First pointer enter from outside immediately clears hover suppression
      fireEvent.pointerEnter(root);

      expect(root).not.toHaveAttribute('data-hover-suppressed');
    });

    it('suppresses hover when collapsed while pointer is inside the sidebar, keeping it closed until re-entered', async () => {
      const user = userEvent.setup();
      render(
        <Sidebar.Provider position="left" hoverBehaviour="expand">
          <Sidebar.Root variant="docked" data-testid="sidebar-root">
            <Sidebar.Toggle data-testid="internal-toggle" />
            <div>Sidebar content</div>
          </Sidebar.Root>
        </Sidebar.Provider>,
      );

      const root = screen.getByTestId('sidebar-root');
      const toggle = screen.getByTestId('internal-toggle');

      // Pointer enters the sidebar root
      fireEvent.pointerEnter(root);

      // User clicks internal toggle while hovering
      await user.click(toggle);

      // Must be collapsed and suppressed so menu stays closed while mouse is on button
      expect(root).toHaveAttribute('data-collapsed', 'true');
      expect(root).toHaveAttribute('data-hover-suppressed', 'true');

      // Pointer leaves the sidebar root (remains suppressed while outside)
      fireEvent.pointerLeave(root);
      expect(root).toHaveAttribute('data-hover-suppressed', 'true');

      // Pointer re-enters the sidebar root -> clears suppression to allow expanding
      fireEvent.pointerEnter(root);
      expect(root).not.toHaveAttribute('data-hover-suppressed');
    });

    it('handles focus and blur, suppressing focus-within expansion until focus re-enters', async () => {
      const user = userEvent.setup();
      render(
        <Sidebar.Provider position="left" hoverBehaviour="expand">
          <Sidebar.Root variant="docked" data-testid="sidebar-root">
            <Sidebar.Toggle data-testid="internal-toggle" />
            <div>Sidebar content</div>
          </Sidebar.Root>
        </Sidebar.Provider>,
      );

      const root = screen.getByTestId('sidebar-root');
      const toggle = screen.getByTestId('internal-toggle');

      // Focus enters sidebar
      fireEvent.focus(toggle);

      // Toggle collapsed via keyboard / click while focused
      await user.click(toggle);

      // Must be collapsed and suppressed so focus-within does not force it open
      expect(root).toHaveAttribute('data-collapsed', 'true');
      expect(root).toHaveAttribute('data-hover-suppressed', 'true');

      // Focus leaves sidebar
      fireEvent.blur(root, { relatedTarget: document.body });
      expect(root).toHaveAttribute('data-hover-suppressed', 'true');

      // Focus re-enters sidebar -> clears suppression to allow expansion
      fireEvent.focus(root);
      expect(root).not.toHaveAttribute('data-hover-suppressed');
    });

    it('throws a descriptive error when useSidebar is used outside of SidebarProvider or Sidebar', () => {
      expect(() => render(<TestSidebarConsumer />)).toThrowError(
        'useSidebar must be used within a SidebarProvider or Sidebar',
      );
    });

    it('isolates context when a bare Sidebar is rendered inside an outer SidebarProvider', async () => {
      const user = userEvent.setup();
      render(
        <Sidebar.Provider position="left" hoverBehaviour="expand">
          <Sidebar.Root variant="docked" data-testid="outer-root">
            <Sidebar.Toggle data-testid="outer-toggle" />
          </Sidebar.Root>
          <div data-testid="preview-container">
            <Sidebar
              variant="docked"
              position="left"
              hoverBehaviour="none"
              data-testid="inner-sidebar"
            >
              <Sidebar.Toggle data-testid="inner-toggle" />
            </Sidebar>
          </div>
        </Sidebar.Provider>,
      );

      const outerRoot = screen.getByTestId('outer-root');
      const innerSidebar = screen.getByTestId('inner-sidebar');
      const innerToggle = screen.getByTestId('inner-toggle');
      const outerToggle = screen.getByTestId('outer-toggle');

      expect(outerRoot).toHaveAttribute('data-collapsed', 'false');
      expect(innerSidebar).toHaveAttribute('data-collapsed', 'false');

      // Click inner toggle — only inner sidebar should collapse
      await user.click(innerToggle);
      expect(innerSidebar).toHaveAttribute('data-collapsed', 'true');
      expect(outerRoot).toHaveAttribute('data-collapsed', 'false');

      // Click outer toggle — only outer sidebar should collapse
      await user.click(outerToggle);
      expect(outerRoot).toHaveAttribute('data-collapsed', 'true');
      expect(innerSidebar).toHaveAttribute('data-collapsed', 'true');
    });
  });

  describe('regression: collapse header alignment', () => {
    it('does not apply justify-content: center or container gap to Sidebar.Header when collapsed to preserve smooth width tracking', () => {
      render(
        <Sidebar variant="docked" position="left" hoverBehaviour="none" defaultCollapsed>
          <Sidebar.Header title="App Title">
            <Sidebar.Toggle />
          </Sidebar.Header>
        </Sidebar>,
      );

      const css = getSheetCss();
      // Sidebar.Header must not use justify-content: center in collapsed selector
      expect(css).not.toMatch(
        /\[data-collapsed="true"\].*sidebarHeader[^{]*\{[^}]*justify-content:\s*center/,
      );
      // Sidebar.Header base must not use gap to avoid offset from hidden heading
      expect(css).not.toMatch(/sidebarHeader[^{]*\{[^}]*gap:/);
    });
  });
});
