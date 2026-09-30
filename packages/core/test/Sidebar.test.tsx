import React, { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { Sidebar } from '../src/components/Sidebar.js';

describe('Sidebar component', () => {
  it('renders in expanded state by default and toggles via Sidebar.Toggle in uncontrolled mode', async () => {
    const user = userEvent.setup();
    render(
      <Sidebar data-testid="sidebar">
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
      <Sidebar defaultCollapsed data-testid="sidebar">
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
    const { rerender } = render(<Sidebar variant="floating" data-testid="sidebar" />);
    expect(screen.getByTestId('sidebar')).toHaveAttribute('data-variant', 'floating');

    rerender(<Sidebar variant="inset" data-testid="sidebar" />);
    expect(screen.getByTestId('sidebar')).toHaveAttribute('data-variant', 'inset');

    rerender(<Sidebar variant="docked" data-testid="sidebar" />);
    expect(screen.getByTestId('sidebar')).toHaveAttribute('data-variant', 'docked');
  });

  it('supports expandOnHover when collapsed', () => {
    render(
      <Sidebar defaultCollapsed expandOnHover data-testid="sidebar">
        <Sidebar.Toggle />
      </Sidebar>,
    );

    const sidebar = screen.getByTestId('sidebar');
    expect(sidebar).toHaveAttribute('data-collapsed', 'true');
    expect(sidebar).toHaveAttribute('data-expand-on-hover', 'true');
  });

  it('supports collapsedHoverBehavior="tooltip"', () => {
    render(
      <Sidebar defaultCollapsed collapsedHoverBehavior="tooltip" data-testid="sidebar">
        <Sidebar.Toggle />
      </Sidebar>,
    );

    const sidebar = screen.getByTestId('sidebar');
    expect(sidebar).toHaveAttribute('data-collapsed', 'true');
    expect(sidebar).toHaveAttribute('data-tooltip-mode', 'true');
    expect(sidebar).not.toHaveAttribute('data-expand-on-hover');
  });
});
