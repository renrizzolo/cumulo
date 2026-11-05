import React, { useState, act } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import * as Sidebar from '../src/components/Sidebar.js';
import { useSidebar } from '../src/components/Sidebar.js';

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

function NavItemCloseTest() {
  const { setCollapsed } = useSidebar();
  return (
    <button type="button" data-testid="nav-item" onClick={() => setCollapsed(true)}>
      Navigate
    </button>
  );
}

function CustomGutter() {
  const { hoverTargetProps } = useSidebar();
  return (
    <div data-testid="custom-gutter" {...hoverTargetProps}>
      Gutter
    </div>
  );
}

describe('Sidebar component', () => {
  it('renders in expanded state by default and toggles via Sidebar.Toggle in uncontrolled mode', async () => {
    const user = userEvent.setup();
    render(
      <Sidebar.Root variant="docked" position="left" hoverBehaviour="none" data-testid="sidebar">
        <Sidebar.Toggle />
        <div>Sidebar Content</div>
      </Sidebar.Root>,
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

  it('supports controlled collapsed state and calls onCollapsedChange', async () => {
    const user = userEvent.setup();
    const handleCollapsedChange = vi.fn();

    function ControlledTest() {
      const [collapsed, setCollapsed] = useState(false);
      return (
        <Sidebar.Root
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
        </Sidebar.Root>
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
      expect(root).toHaveAttribute('data-visually-collapsed', 'true');

      // Pointer leaves the sidebar root (clearing suppression)
      fireEvent.pointerLeave(root);
      expect(root).toHaveAttribute('data-visually-collapsed', 'true');

      // Pointer re-enters the sidebar root -> allows expanding
      fireEvent.pointerEnter(root);
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
      expect(root).toHaveAttribute('data-visually-collapsed', 'true');

      // Focus leaves sidebar
      fireEvent.blur(root, { relatedTarget: document.body });

      // Focus re-enters sidebar -> clears suppression to allow expansion
      fireEvent.focus(root);
      expect(root).toHaveAttribute('data-visually-collapsed', 'false');
    });

    it('visually collapses when setCollapsed(true) is called from a focused navigation item without pointer hover', async () => {
      const user = userEvent.setup();

      render(
        <Sidebar.Provider position="left" hoverBehaviour="expand">
          <Sidebar.Root variant="docked" data-testid="sidebar-root">
            <NavItemCloseTest />
          </Sidebar.Root>
        </Sidebar.Provider>,
      );

      const root = screen.getByTestId('sidebar-root');
      const navItem = screen.getByTestId('nav-item');

      // Focus and click the navigation item (as happens on mobile tap or keyboard Enter)
      fireEvent.focus(navItem);
      await user.click(navItem);

      expect(root).toHaveAttribute('data-collapsed', 'true');
      expect(root).toHaveAttribute('data-visually-collapsed', 'true');
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
            <Sidebar.Root
              variant="docked"
              position="left"
              hoverBehaviour="none"
              data-testid="inner-sidebar"
            >
              <Sidebar.Toggle data-testid="inner-toggle" />
            </Sidebar.Root>
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

  describe('Sidebar.Content and Sidebar.Header subcomponents', () => {
    it('renders Sidebar.Header with title and collapsed title', () => {
      render(
        <Sidebar.Root defaultCollapsed={false}>
          <Sidebar.Header
            data-testid="sidebar-header"
            title={<span data-testid="title">Full Brand</span>}
            titleCollapsed={<span data-testid="collapsed-title">FB</span>}
          >
            <Sidebar.Toggle />
          </Sidebar.Header>
        </Sidebar.Root>,
      );

      expect(screen.getByTestId('sidebar-header')).toBeInTheDocument();
      expect(screen.getByTestId('title')).toHaveTextContent('Full Brand');
      expect(screen.getByTestId('collapsed-title')).toHaveTextContent('FB');
    });

    it('renders Sidebar.Content with different collapse behaviors without crashing', () => {
      render(
        <Sidebar.Root defaultCollapsed={false}>
          <Sidebar.Content data-testid="content-clip" collapseBehavior="clip">
            <div>Clip content</div>
          </Sidebar.Content>
          <Sidebar.Content data-testid="content-fade" collapseBehavior="fade">
            <div>Fade content</div>
          </Sidebar.Content>
          <Sidebar.Content data-testid="content-collapse" collapseBehavior="collapse" flex>
            <div>Collapse content</div>
          </Sidebar.Content>
        </Sidebar.Root>,
      );

      expect(screen.getByTestId('content-clip')).toBeInTheDocument();
      expect(screen.getByTestId('content-fade')).toBeInTheDocument();
      expect(screen.getByTestId('content-collapse')).toBeInTheDocument();
    });
  });

  describe('Sidebar.HoverZone and hover propagation', () => {
    it('renders Sidebar.HoverZone and expands sidebar on hover', () => {
      render(
        <Sidebar.Provider hoverBehaviour="expand" defaultCollapsed>
          <Sidebar.HoverZone data-testid="hover-zone" width="24px" />
          <Sidebar.Root data-testid="sidebar-root">
            <div>Sidebar content</div>
          </Sidebar.Root>
        </Sidebar.Provider>,
      );

      const zone = screen.getByTestId('hover-zone');
      const root = screen.getByTestId('sidebar-root');

      expect(zone).toHaveAttribute('data-sidebar-hover-zone', 'true');
      expect(zone).toHaveAttribute('data-visually-collapsed', 'true');
      expect(root).toHaveAttribute('data-visually-collapsed', 'true');

      // Pointer enters hover zone
      fireEvent.pointerEnter(zone);
      expect(zone).toHaveAttribute('data-visually-collapsed', 'false');
      expect(root).toHaveAttribute('data-visually-collapsed', 'false');

      // Pointer leaves hover zone
      fireEvent.pointerLeave(zone);
      expect(zone).toHaveAttribute('data-visually-collapsed', 'true');
      expect(root).toHaveAttribute('data-visually-collapsed', 'true');
    });

    it('supports hover propagation via hoverTargetProps on custom external elements', () => {
      render(
        <Sidebar.Provider hoverBehaviour="expand" defaultCollapsed>
          <CustomGutter />
          <Sidebar.Root data-testid="sidebar-root">
            <div>Sidebar content</div>
          </Sidebar.Root>
        </Sidebar.Provider>,
      );

      const gutter = screen.getByTestId('custom-gutter');
      const root = screen.getByTestId('sidebar-root');

      expect(root).toHaveAttribute('data-visually-collapsed', 'true');

      // Pointer enters external element
      fireEvent.pointerEnter(gutter);
      expect(root).toHaveAttribute('data-visually-collapsed', 'false');

      // Pointer leaves external element
      fireEvent.pointerLeave(gutter);
      expect(root).toHaveAttribute('data-visually-collapsed', 'true');
    });

    it('maintains expansion smoothly across multi-target transitions with hoverLeaveDelay', () => {
      vi.useFakeTimers();

      render(
        <Sidebar.Provider hoverBehaviour="expand" defaultCollapsed hoverLeaveDelay={150}>
          <Sidebar.HoverZone data-testid="hover-zone" />
          <Sidebar.Root data-testid="sidebar-root">
            <div>Sidebar content</div>
          </Sidebar.Root>
        </Sidebar.Provider>,
      );

      const zone = screen.getByTestId('hover-zone');
      const root = screen.getByTestId('sidebar-root');

      // 1. Enter hover zone -> expands
      fireEvent.pointerEnter(zone);
      expect(root).toHaveAttribute('data-visually-collapsed', 'false');

      // 2. Leave hover zone (e.g. crossing border) -> still expanded during delay window
      fireEvent.pointerLeave(zone);
      expect(root).toHaveAttribute('data-visually-collapsed', 'false');

      // 3. Move time forward 50ms (within 150ms delay) -> still expanded
      act(() => {
        vi.advanceTimersByTime(50);
      });
      expect(root).toHaveAttribute('data-visually-collapsed', 'false');

      // 4. Enter sidebar root before delay expires -> cancels leave timer, stays open
      fireEvent.pointerEnter(root);
      act(() => {
        vi.advanceTimersByTime(200);
      });
      expect(root).toHaveAttribute('data-visually-collapsed', 'false');

      // 5. Leave sidebar root and let delay expire -> collapses
      fireEvent.pointerLeave(root);
      expect(root).toHaveAttribute('data-visually-collapsed', 'false');
      act(() => {
        vi.advanceTimersByTime(150);
      });
      expect(root).toHaveAttribute('data-visually-collapsed', 'true');

      vi.useRealTimers();
    });

    it('does not trigger hover expansion when hoverBehaviour is not expand', () => {
      render(
        <Sidebar.Provider hoverBehaviour="none" defaultCollapsed>
          <Sidebar.HoverZone data-testid="hover-zone" />
          <Sidebar.Root data-testid="sidebar-root">
            <div>Sidebar content</div>
          </Sidebar.Root>
        </Sidebar.Provider>,
      );

      const zone = screen.getByTestId('hover-zone');
      const root = screen.getByTestId('sidebar-root');

      fireEvent.pointerEnter(zone);
      expect(root).toHaveAttribute('data-visually-collapsed', 'true');
    });

    it('keeps sidebar closed when clicking toggle inside sidebar even with hoverLeaveDelay and HoverZone present', async () => {
      vi.useFakeTimers();
      render(
        <Sidebar.Provider hoverBehaviour="expand" defaultCollapsed={false} hoverLeaveDelay={150}>
          <Sidebar.HoverZone data-testid="hover-zone" />
          <Sidebar.Root data-testid="sidebar-root">
            <Sidebar.Toggle data-testid="toggle-btn" />
            <div>Sidebar content</div>
          </Sidebar.Root>
        </Sidebar.Provider>,
      );

      const root = screen.getByTestId('sidebar-root');
      const toggle = screen.getByTestId('toggle-btn');
      const zone = screen.getByTestId('hover-zone');

      // 1. Mouse enters sidebar root
      fireEvent.pointerEnter(root);
      expect(root).toHaveAttribute('data-visually-collapsed', 'false');

      // 2. Click toggle button inside sidebar
      fireEvent.click(toggle);

      // 3. Must be collapsed immediately and hover suppressed
      expect(root).toHaveAttribute('data-collapsed', 'true');
      expect(root).toHaveAttribute('data-visually-collapsed', 'true');

      // 4. Pointer triggers HoverZone or Root while mouse is still at toggle position
      fireEvent.pointerEnter(zone);
      fireEvent.pointerEnter(root);
      act(() => {
        vi.advanceTimersByTime(200);
      });

      // Must remain collapsed despite hovering
      expect(root).toHaveAttribute('data-visually-collapsed', 'true');

      // 5. Pointer leaves all zones and delay passes
      fireEvent.pointerLeave(zone);
      fireEvent.pointerLeave(root);
      act(() => {
        vi.advanceTimersByTime(150);
      });
      expect(root).toHaveAttribute('data-visually-collapsed', 'true');

      // 6. Pointer re-enters hover zone -> now expands cleanly
      fireEvent.pointerEnter(zone);
      expect(root).toHaveAttribute('data-visually-collapsed', 'false');

      vi.useRealTimers();
    });

    it('collapses on toggle click when sidebar was temporarily opened via hover on defaultCollapsed', () => {
      render(
        <Sidebar.Provider hoverBehaviour="expand" defaultCollapsed={true}>
          <Sidebar.HoverZone data-testid="hover-zone" />
          <Sidebar.Root data-testid="sidebar-root">
            <Sidebar.Toggle data-testid="toggle-btn" />
          </Sidebar.Root>
        </Sidebar.Provider>,
      );

      const root = screen.getByTestId('sidebar-root');
      const toggle = screen.getByTestId('toggle-btn');
      const zone = screen.getByTestId('hover-zone');

      expect(root).toHaveAttribute('data-visually-collapsed', 'true');

      // Hover to expand
      fireEvent.pointerEnter(zone);
      expect(root).toHaveAttribute('data-visually-collapsed', 'false');

      // Click toggle inside visually expanded sidebar
      fireEvent.click(toggle);

      // Must collapse and stay collapsed
      expect(root).toHaveAttribute('data-visually-collapsed', 'true');
    });
  });
});
