import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { Flow } from '../src/components/Flow.js';

afterEach(() => {
  cleanup();
});

describe('Flow Component', () => {
  it('renders without crashing', () => {
    render(
      <Flow>
        <p>Paragraph</p>
      </Flow>,
    );
    expect(screen.getByText('Paragraph')).toBeInTheDocument();
  });

  it('renders the specified polymorphic element with as prop', () => {
    render(
      <Flow as="article" data-testid="flow-article">
        <p>Article body</p>
      </Flow>,
    );

    const el = screen.getByTestId('flow-article');
    expect(el.tagName).toBe('ARTICLE');
  });

  it('renders with space variant without crashing', () => {
    render(
      <Flow space="xl">
        <p>Spaced paragraph</p>
      </Flow>,
    );
    expect(screen.getByText('Spaced paragraph')).toBeInTheDocument();
  });
});
