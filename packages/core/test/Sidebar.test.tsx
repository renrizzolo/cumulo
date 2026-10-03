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

function VisualStateConsumer() {
  const { collapsed, visuallyCollapsed } = useSidebar();
  return (
    <div>
      <span data-testid="state-collapsed">{collapsed ? 'collapsed' : 'expanded'}</span>
      <span data-testid="state-visually-collapsed">{visuallyCollapsed ? 'yes' : 'no'}</span>
    </div>
  );
}

function PinnableSidebar() {
  const [pinned, setPinned] = useState(false);
  return (
    <Sidebar.Provider
      type={pinned ? 'push' : 'overlay'}
      collapsed={!pinned}
      hoverBehaviour="expand"
    >
      <Sidebar.Root data-testid="sidebar-root" collapsedWidth="0px">
        <button data-testid="pin-btn" onClick={() => setPinned((p) => !p)}>
          {pinned ? 'Unpin' : 'Pin'}
        </button>
      </Sidebar.Root>
    </Sidebar.Provider>
  );
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

    it('does not suppress hover when collapsed via an external toggle, expanding on the very first enter', async () => {
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
      // When collapsed from outside, hover is never suppressed
      expect(root).not.toHaveAttribute('data-hover-suppressed');

      // First pointer enter from outside immediately expands on hover
      fireEvent.pointerEnter(root);

      expect(root).not.toHaveAttribute('data-hover-suppressed');
      expect(root).toHaveAttribute('data-visually-collapsed', 'false');
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

      // Pointer leaves the sidebar root (clearing suppression)
      fireEvent.pointerLeave(root);
      expect(root).not.toHaveAttribute('data-hover-suppressed');

      // Pointer re-enters the sidebar root -> allows expanding
      fireEvent.pointerEnter(root);
      expect(root).not.toHaveAttribute('data-hover-suppressed');
      expect(root).toHaveAttribute('data-visually-collapsed', 'false');
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

  describe('Sidebar.Header titleCollapsed', () => {
    it('renders title and titleCollapsed in Sidebar.Header', () => {
      render(
        <Sidebar variant="docked" position="left" hoverBehaviour="none">
          <Sidebar.Header
            title={<span data-testid="header-title">Cumulo UI</span>}
            titleCollapsed={<span data-testid="header-collapsed">📦</span>}
          />
        </Sidebar>,
      );

      expect(screen.getByTestId('header-title')).toHaveTextContent('Cumulo UI');
      expect(screen.getByTestId('header-collapsed')).toHaveTextContent('📦');
    });
  });

  describe('visuallyCollapsed state distinction', () => {
    it('distinguishes between toggled collapsed and visual collapsed state during hover expansion', () => {
      render(
        <Sidebar.Provider hoverBehaviour="expand" defaultCollapsed>
          <VisualStateConsumer />
          <Sidebar.Root data-testid="sidebar-root">
            <Sidebar.Toggle data-testid="toggle-btn" />
            <button data-testid="nav-btn">Nav Item</button>
          </Sidebar.Root>
        </Sidebar.Provider>,
      );

      const root = screen.getByTestId('sidebar-root');
      const collapsedText = screen.getByTestId('state-collapsed');
      const visuallyCollapsedText = screen.getByTestId('state-visually-collapsed');

      // Initially both are collapsed
      expect(collapsedText).toHaveTextContent('collapsed');
      expect(visuallyCollapsedText).toHaveTextContent('yes');
      expect(root).toHaveAttribute('data-collapsed', 'true');
      expect(root).toHaveAttribute('data-visually-collapsed', 'true');

      // Pointer enters -> expands visually, but explicitly remains collapsed
      fireEvent.pointerEnter(root);
      expect(collapsedText).toHaveTextContent('collapsed');
      expect(visuallyCollapsedText).toHaveTextContent('no');
      expect(root).toHaveAttribute('data-collapsed', 'true');
      expect(root).toHaveAttribute('data-visually-collapsed', 'false');

      // Pointer leaves -> visually collapses again
      fireEvent.pointerLeave(root);
      expect(collapsedText).toHaveTextContent('collapsed');
      expect(visuallyCollapsedText).toHaveTextContent('yes');
      expect(root).toHaveAttribute('data-collapsed', 'true');
      expect(root).toHaveAttribute('data-visually-collapsed', 'true');
    });

    it('distinguishes between toggled collapsed and visual collapsed state during keyboard focus', () => {
      render(
        <Sidebar.Provider hoverBehaviour="expand" defaultCollapsed>
          <VisualStateConsumer />
          <Sidebar.Root data-testid="sidebar-root">
            <Sidebar.Toggle data-testid="toggle-btn" />
            <button data-testid="nav-btn">Nav Item</button>
          </Sidebar.Root>
        </Sidebar.Provider>,
      );

      const root = screen.getByTestId('sidebar-root');
      const navBtn = screen.getByTestId('nav-btn');
      const toggleBtn = screen.getByTestId('toggle-btn');
      const collapsedText = screen.getByTestId('state-collapsed');
      const visuallyCollapsedText = screen.getByTestId('state-visually-collapsed');

      // Focus on the toggle button does NOT visually expand the sidebar
      fireEvent.focus(toggleBtn);
      expect(collapsedText).toHaveTextContent('collapsed');
      expect(visuallyCollapsedText).toHaveTextContent('yes');
      expect(root).toHaveAttribute('data-visually-collapsed', 'true');

      // Focus on navigation content visually expands the sidebar
      fireEvent.focus(navBtn);
      expect(collapsedText).toHaveTextContent('collapsed');
      expect(visuallyCollapsedText).toHaveTextContent('no');
      expect(root).toHaveAttribute('data-visually-collapsed', 'false');

      // Blur out of sidebar visually collapses it
      fireEvent.blur(root, { relatedTarget: document.body });
      expect(collapsedText).toHaveTextContent('collapsed');
      expect(visuallyCollapsedText).toHaveTextContent('yes');
      expect(root).toHaveAttribute('data-visually-collapsed', 'true');
    });

    it('keeps visuallyCollapsed as false when explicitly expanded even when unhovered', async () => {
      const user = userEvent.setup();
      render(
        <Sidebar.Provider hoverBehaviour="expand" defaultCollapsed={false}>
          <VisualStateConsumer />
          <Sidebar.Root data-testid="sidebar-root">
            <Sidebar.Toggle data-testid="toggle-btn" />
          </Sidebar.Root>
        </Sidebar.Provider>,
      );

      const collapsedText = screen.getByTestId('state-collapsed');
      const visuallyCollapsedText = screen.getByTestId('state-visually-collapsed');
      const toggleBtn = screen.getByTestId('toggle-btn');

      // Open state
      expect(collapsedText).toHaveTextContent('expanded');
      expect(visuallyCollapsedText).toHaveTextContent('no');

      // Toggle to collapsed
      await user.click(toggleBtn);
      expect(collapsedText).toHaveTextContent('collapsed');
      expect(visuallyCollapsedText).toHaveTextContent('yes');
    });
  });

  describe('Sidebar type ("push" | "overlay")', () => {
    it('renders with type="push" by default', () => {
      render(
        <Sidebar.Provider hoverBehaviour="none">
          <Sidebar.Root data-testid="sidebar-root">
            <div>Sidebar content</div>
          </Sidebar.Root>
        </Sidebar.Provider>,
      );

      const root = screen.getByTestId('sidebar-root');
      expect(root).toHaveAttribute('data-sidebar-type', 'push');
    });

    it('renders with type="overlay" directly without extra wrapper', () => {
      render(
        <Sidebar.Provider type="overlay" hoverBehaviour="expand" defaultCollapsed>
          <Sidebar.Root data-testid="sidebar-root" collapsedWidth="0px">
            <div>Sidebar content</div>
          </Sidebar.Root>
        </Sidebar.Provider>,
      );

      const root = screen.getByTestId('sidebar-root');
      expect(root).toHaveAttribute('data-sidebar-type', 'overlay');
      expect(root).toHaveAttribute('data-zero-collapsed-width', 'true');
    });

    it('allows overriding type on SidebarRoot', () => {
      render(
        <Sidebar.Provider type="push" hoverBehaviour="none">
          <Sidebar.Root data-testid="sidebar-root" type="overlay">
            <div>Sidebar content</div>
          </Sidebar.Root>
        </Sidebar.Provider>,
      );

      const root = screen.getByTestId('sidebar-root');
      expect(root).toHaveAttribute('data-sidebar-type', 'overlay');
    });

    it('supports dynamic switching between overlay and push type for pinning', async () => {
      const user = userEvent.setup();

      render(<PinnableSidebar />);

      const root = screen.getByTestId('sidebar-root');
      const pinBtn = screen.getByTestId('pin-btn');

      // Initially unpinned: overlay type
      expect(root).toHaveAttribute('data-sidebar-type', 'overlay');

      // Pin: switches to push type in document flow
      await user.click(pinBtn);
      const pinnedRoot = screen.getByTestId('sidebar-root');
      expect(pinnedRoot).toHaveAttribute('data-sidebar-type', 'push');

      // Unpin: switches back to overlay
      await user.click(screen.getByTestId('pin-btn'));
      const unpinnedRoot = screen.getByTestId('sidebar-root');
      expect(unpinnedRoot).toHaveAttribute('data-sidebar-type', 'overlay');
    });
  });
});
