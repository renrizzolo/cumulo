import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { SideNav } from '../src/components/SideNav.js';
import { Sidebar } from '../src/components/Sidebar.js';

describe('SideNav component', () => {
  it('renders semantic nav element with accessible label', () => {
    render(
      <SideNav aria-label="Main navigation">
        <SideNav.Item label="Home" />
      </SideNav>,
    );

    const nav = screen.getByRole('navigation', { name: 'Main navigation' });
    expect(nav).toBeInTheDocument();
  });

  it('renders link when href is provided, button otherwise', () => {
    render(
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
    render(
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
      <Sidebar defaultCollapsed>
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
      <Sidebar defaultCollapsed>
        <SideNav>
          <SideNav.Item tooltip="Custom Tooltip Content" label="Item with Tooltip" />
        </SideNav>
      </Sidebar>,
    );

    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toBeInTheDocument();
    expect(tooltip).toHaveTextContent('Custom Tooltip Content');
  });

  it('renders floating tooltip when collapsedHoverBehavior="tooltip"', () => {
    render(
      <Sidebar defaultCollapsed collapsedHoverBehavior="tooltip">
        <SideNav>
          <SideNav.Item label="Item with Auto Tooltip" />
        </SideNav>
      </Sidebar>,
    );

    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toBeInTheDocument();
    expect(tooltip).toHaveTextContent('Item with Auto Tooltip');
  });

  it('supports collapsible SideNav.Group with toggle interactions', async () => {
    const user = userEvent.setup();
    const handleOpenChange = vi.fn();

    render(
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
    render(
      <SideNav>
        <SideNav.Group title="Static Section">
          <SideNav.Item label="Item 1" />
        </SideNav.Group>
      </SideNav>,
    );

    expect(screen.getByText('Static Section')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Item 1' })).toBeInTheDocument();
  });
});
