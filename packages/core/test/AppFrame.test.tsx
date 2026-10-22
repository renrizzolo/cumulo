import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { AppFrame } from '../src/components/AppFrame.js';
import { Sidebar } from '../src/components/Sidebar.js';
import { Panel } from '../src/components/Panel.js';
import { SideNav } from '../src/components/SideNav.js';

describe('AppFrame component', () => {
  it('renders without crashing', () => {
    render(<AppFrame data-testid="frame">Frame Content</AppFrame>);
    expect(screen.getByTestId('frame')).toBeInTheDocument();
  });

  it('renders AppFrame.Main as a main landmark by default', () => {
    render(
      <AppFrame>
        <AppFrame.Main>Content</AppFrame.Main>
      </AppFrame>,
    );
    expect(screen.getByRole('main')).toHaveTextContent('Content');
  });

  it('renders AppFrame.Main as a custom element via `as`', () => {
    render(
      <AppFrame>
        <AppFrame.Main as="div" data-testid="main">
          Content
        </AppFrame.Main>
      </AppFrame>,
    );
    expect(screen.queryByRole('main')).not.toBeInTheDocument();
    expect(screen.getByTestId('main').tagName).toBe('DIV');
  });

  it('composes full application structure with Sidebar, Panels, and AppFrame.Main', () => {
    render(
      <AppFrame data-testid="app-frame">
        <Sidebar variant="docked" position="left" hoverBehaviour="none" data-testid="sidebar">
          <Panel divider="bottom" data-testid="sidebar-header">
            <Sidebar.Toggle />
          </Panel>
          <Panel scrollbar="thin" data-testid="sidebar-nav-panel">
            <SideNav aria-label="App navigation">
              <SideNav.Item label="Dashboard" />
            </SideNav>
          </Panel>
        </Sidebar>
        <AppFrame.Main data-testid="main-content">
          <Panel as="header" divider="bottom" data-testid="main-header">
            Header Title
          </Panel>
          <Panel scrollbar="thin" data-testid="main-scrollable">
            Main Application Content
          </Panel>
        </AppFrame.Main>
      </AppFrame>,
    );

    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('main-content').tagName).toBe('MAIN');
    expect(screen.getByTestId('main-header').tagName).toBe('HEADER');
    expect(screen.getByTestId('main-scrollable')).toBeInTheDocument();
  });
});
