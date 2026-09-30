import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { Panel } from '../src/components/Panel.js';

describe('Panel component', () => {
  it('renders without crashing as default div', () => {
    render(<Panel data-testid="test-panel">Panel Content</Panel>);
    const panel = screen.getByTestId('test-panel');
    expect(panel).toBeInTheDocument();
    expect(panel.tagName).toBe('DIV');
    expect(panel).toHaveTextContent('Panel Content');
  });

  it('renders with polymorphic semantic tags', () => {
    const { rerender } = render(
      <Panel as="header" data-testid="panel">
        Header
      </Panel>,
    );
    expect(screen.getByTestId('panel').tagName).toBe('HEADER');

    rerender(
      <Panel as="main" data-testid="panel">
        Main
      </Panel>,
    );
    expect(screen.getByTestId('panel').tagName).toBe('MAIN');

    rerender(
      <Panel as="aside" data-testid="panel">
        Aside
      </Panel>,
    );
    expect(screen.getByTestId('panel').tagName).toBe('ASIDE');
  });

  it('renders with dividers toggled via boolean or side props without error', () => {
    const { rerender } = render(
      <Panel divider="bottom" data-testid="panel">
        Bottom Divider
      </Panel>,
    );
    expect(screen.getByTestId('panel')).toBeInTheDocument();

    rerender(
      <Panel divider={['bottom', 'right']} data-testid="panel">
        Multi Divider
      </Panel>,
    );
    expect(screen.getByTestId('panel')).toBeInTheDocument();

    rerender(
      <Panel divider={true} data-testid="panel">
        All Divider
      </Panel>,
    );
    expect(screen.getByTestId('panel')).toBeInTheDocument();
  });

  it('renders scrollable content container', () => {
    render(
      <Panel scrollbar="thin" data-testid="scrollable-panel">
        <div>Long content item 1</div>
        <div>Long content item 2</div>
      </Panel>,
    );
    const panel = screen.getByTestId('scrollable-panel');
    expect(panel).toBeInTheDocument();
    expect(panel).toHaveTextContent('Long content item 1');
  });

  it('renders with scrollbar variants without error', () => {
    const { rerender } = render(
      <Panel scrollbar="thin" data-testid="scrollbar-panel">
        Scrollbar Content
      </Panel>,
    );
    expect(screen.getByTestId('scrollbar-panel')).toBeInTheDocument();

    rerender(
      <Panel scrollbar="none" data-testid="scrollbar-panel">
        Scrollbar Content
      </Panel>,
    );
    expect(screen.getByTestId('scrollbar-panel')).toBeInTheDocument();

    rerender(
      <Panel scrollbar="default" data-testid="scrollbar-panel">
        Scrollbar Content
      </Panel>,
    );
    expect(screen.getByTestId('scrollbar-panel')).toBeInTheDocument();
  });
});

