import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import * as AppFrame from '../src/components/AppFrame.js';
import * as Sidebar from '../src/components/Sidebar.js';
import { Panel } from '../src/components/Panel.js';
import * as SideNav from '../src/components/SideNav.js';

describe('AppFrame component', () => {
  it('renders without crashing', () => {
    render(<AppFrame.Root data-testid="frame">Frame Content</AppFrame.Root>);
    expect(screen.getByTestId('frame')).toBeInTheDocument();
  });

  it('renders AppFrame.Main as a main landmark by default', () => {
    render(
      <AppFrame.Root>
        <AppFrame.Main>Content</AppFrame.Main>
      </AppFrame.Root>,
    );
    expect(screen.getByRole('main')).toHaveTextContent('Content');
  });

  it('renders AppFrame.Main as a custom element via `as`', () => {
    render(
      <AppFrame.Root>
        <AppFrame.Main as="div" data-testid="main">
          Content
        </AppFrame.Main>
      </AppFrame.Root>,
    );
    expect(screen.queryByRole('main')).not.toBeInTheDocument();
    expect(screen.getByTestId('main').tagName).toBe('DIV');
  });

  it('composes full application structure with Sidebar, Panels, and AppFrame.Main', () => {
    render(
      <AppFrame.Root data-testid="app-frame">
        <Sidebar.Root variant="docked" position="left" hoverBehaviour="none" data-testid="sidebar">
          <Panel divider="bottom" data-testid="sidebar-header">
            <Sidebar.Toggle />
          </Panel>
          <Panel scrollbar="thin" data-testid="sidebar-nav-panel">
            <SideNav.Root aria-label="App navigation">
              <SideNav.Item label="Dashboard" />
            </SideNav.Root>
          </Panel>
        </Sidebar.Root>
        <AppFrame.Main data-testid="main-content">
          <Panel as="header" divider="bottom" data-testid="main-header">
            Header Title
          </Panel>
          <Panel scrollbar="thin" data-testid="main-scrollable">
            Main Application Content
          </Panel>
        </AppFrame.Main>
      </AppFrame.Root>,
    );

    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('main-content').tagName).toBe('MAIN');
    expect(screen.getByTestId('main-header').tagName).toBe('HEADER');
    expect(screen.getByTestId('main-scrollable')).toBeInTheDocument();
  });
});
