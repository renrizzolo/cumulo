import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { AppFrame } from '../src/components/AppFrame.js';
import { Sidebar } from '../src/components/Sidebar.js';
import { Panel } from '../src/components/Panel.js';
import { SideNav } from '../src/components/SideNav.js';

describe('AppFrame component', () => {
  it('renders default docked layout with data-variant', () => {
    render(<AppFrame data-testid="frame">Frame Content</AppFrame>);
    const frame = screen.getByTestId('frame');
    expect(frame).toBeInTheDocument();
    expect(frame).toHaveAttribute('data-variant', 'docked');
  });

  it('renders with inset and floating variants', () => {
    const { rerender } = render(<AppFrame variant="inset" data-testid="frame" />);
    expect(screen.getByTestId('frame')).toHaveAttribute('data-variant', 'inset');

    rerender(<AppFrame variant="floating" data-testid="frame" />);
    expect(screen.getByTestId('frame')).toHaveAttribute('data-variant', 'floating');
  });

  it('composes full application structure with Sidebar, Panels, and AppFrame.Main', () => {
    render(
      <AppFrame data-testid="app-frame">
        <Sidebar data-testid="sidebar">
          <Panel divider="bottom" data-testid="sidebar-header">
            <Sidebar.Toggle />
          </Panel>
          <Panel scrollable data-testid="sidebar-nav-panel">
            <SideNav aria-label="App navigation">
              <SideNav.Item label="Dashboard" />
            </SideNav>
          </Panel>
        </Sidebar>
        <AppFrame.Main data-testid="main-content">
          <Panel as="header" divider="bottom" data-testid="main-header">
            Header Title
          </Panel>
          <Panel scrollable data-testid="main-scrollable">
            Main Application Content
          </Panel>
        </AppFrame.Main>
      </AppFrame>,
    );

    expect(screen.getByTestId('app-frame')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar-header')).toBeInTheDocument();
    expect(screen.getByTestId('main-content')).toBeInTheDocument();
    expect(screen.getByTestId('main-content').tagName).toBe('MAIN');
    expect(screen.getByTestId('main-header').tagName).toBe('HEADER');
    expect(screen.getByTestId('main-scrollable')).toBeInTheDocument();
  });
});
