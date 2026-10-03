import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { SideNav } from '../src/components/SideNav.js';
import { Sidebar } from '../src/components/Sidebar.js';
import { SidebarContext, type SidebarContextValue } from '../src/hooks/useSidebar.js';

const mockSidebarContext: SidebarContextValue = {
  type: 'push',
  collapsed: false,
  visuallyCollapsed: false,
  setCollapsed: vi.fn(),
  toggleCollapsed: vi.fn(),
  position: 'left',
  hoverBehaviour: 'none',
  hoverSuppressed: false,
  setHoverSuppressed: vi.fn(),
  setHovered: vi.fn(),
  setFocused: vi.fn(),
};

const renderWithContext = (ui: React.ReactElement) =>
  render(<SidebarContext value={mockSidebarContext}>{ui}</SidebarContext>);

describe('SideNav component', () => {
  it('renders semantic nav element with accessible label', () => {
    renderWithContext(
      <SideNav aria-label="Main navigation">
        <SideNav.Item label="Home" />
      </SideNav>,
    );

    const nav = screen.getByRole('navigation', { name: 'Main navigation' });
    expect(nav).toBeInTheDocument();
  });

  it('renders link when href is provided, button otherwise', () => {
    renderWithContext(
      <SideNav>
        <SideNav.Item href="/dashboard" label="Dashboard" />
        <SideNav.Item label="Settings" />
      </SideNav>,
    );

    const link = screen.getByRole('link', { name: 'Dashboard' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/dashboard');

    const button = screen.getByRole('button', { name: 'Settings' });
    expect(button).toBeInTheDocument();
  });

  it('wires active and disabled states correctly', () => {
    renderWithContext(
      <SideNav>
        <SideNav.Item active href="/active" label="Active Item" />
        <SideNav.Item disabled label="Disabled Item" />
      </SideNav>,
    );

    const activeItem = screen.getByRole('link', { name: 'Active Item' });
    expect(activeItem).toHaveAttribute('aria-current', 'page');
    expect(activeItem).toHaveAttribute('data-active', 'true');

    const disabledItem = screen.getByRole('button', { name: 'Disabled Item' });
    expect(disabledItem).toHaveAttribute('aria-disabled', 'true');
    expect(disabledItem).toHaveAttribute('data-disabled', 'true');
  });

  it('renders title tooltip attribute on item when sidebar is collapsed', () => {
    render(
      <Sidebar variant="docked" position="left" hoverBehaviour="none" defaultCollapsed>
        <SideNav>
          <SideNav.Item icon={<span data-testid="icon">icon</span>} label="Collapsed Nav Item" />
        </SideNav>
      </Sidebar>,
    );

    const item = screen.getByRole('button');
    expect(item).toHaveAttribute('title', 'Collapsed Nav Item');
  });

  it('renders floating tooltip when tooltip prop is true or custom', () => {
    render(
      <Sidebar variant="docked" position="left" hoverBehaviour="none" defaultCollapsed>
        <SideNav>
          <SideNav.Item tooltip="Custom Tooltip Content" label="Item with Tooltip" />
        </SideNav>
      </Sidebar>,
    );

    const tooltip = screen.getByRole('tooltip', { hidden: true });
    expect(tooltip).toBeInTheDocument();
    expect(tooltip).toHaveTextContent('Custom Tooltip Content');
  });

  it('renders floating tooltip when hoverBehaviour="tooltip"', () => {
    render(
      <Sidebar variant="docked" position="left" defaultCollapsed hoverBehaviour="tooltip">
        <SideNav>
          <SideNav.Item label="Item with Auto Tooltip" />
        </SideNav>
      </Sidebar>,
    );

    const tooltip = screen.getByRole('tooltip', { hidden: true });
    expect(tooltip).toBeInTheDocument();
    expect(tooltip).toHaveTextContent('Item with Auto Tooltip');
  });

  it('supports collapsible SideNav.Group with toggle interactions', async () => {
    const user = userEvent.setup();
    const handleOpenChange = vi.fn();

    renderWithContext(
      <SideNav>
        <SideNav.Group
          collapsible
          defaultOpen={true}
          title="Section"
          onOpenChange={handleOpenChange}
        >
          <SideNav.Item label="Nested Item 1" />
          <SideNav.Item label="Nested Item 2" />
        </SideNav.Group>
      </SideNav>,
    );

    const trigger = screen.getByRole('button', { name: /section/i });
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    await user.click(trigger);

    expect(handleOpenChange).toHaveBeenCalledWith(false);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('renders non-collapsible group with section title', () => {
    renderWithContext(
      <SideNav>
        <SideNav.Group title="Static Section">
          <SideNav.Item label="Item 1" />
        </SideNav.Group>
      </SideNav>,
    );

    expect(screen.getByText('Static Section')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Item 1' })).toBeInTheDocument();
  });

  it('supports compound subcomponents: SideNav.Group.Trigger and SideNav.Group.Content', async () => {
    const user = userEvent.setup();
    const handleOpenChange = vi.fn();

    renderWithContext(
      <SideNav>
        <SideNav.Group collapsible defaultOpen={false} onOpenChange={handleOpenChange}>
          <SideNav.Group.Trigger badge={<span data-testid="badge">3</span>}>
            Compound Section
          </SideNav.Group.Trigger>
          <SideNav.Group.Content>
            <SideNav.Item label="Item A" />
          </SideNav.Group.Content>
        </SideNav.Group>
      </SideNav>,
    );

    const trigger = screen.getByRole('button', { name: /compound section/i });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByTestId('badge')).toHaveTextContent('3');

    await user.click(trigger);

    expect(handleOpenChange).toHaveBeenCalledWith(true);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('button', { name: 'Item A' })).toBeInTheDocument();
  });
});
