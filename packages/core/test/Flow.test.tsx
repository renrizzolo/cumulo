import '@testing-library/jest-dom/vitest';
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Flow } from '../src/components/Flow.js';

describe('Flow Component', () => {
  it('renders children with base flow class', () => {
    render(
      <Flow data-testid="flow">
        <h1>Heading</h1>
        <p>Paragraph</p>
      </Flow>,
    );

    const el = screen.getByTestId('flow');
    expect(el).toBeInTheDocument();
    expect(el.tagName).toBe('DIV');
    expect(el.className).toContain('flow-base');
  });

  it('supports polymorphic as prop', () => {
    render(
      <Flow as="article" data-testid="flow-article">
        <p>Article body</p>
      </Flow>,
    );

    const el = screen.getByTestId('flow-article');
    expect(el.tagName).toBe('ARTICLE');
  });

  it('applies space variant class', () => {
    render(
      <Flow space="lg" data-testid="flow-space">
        <p>Item 1</p>
        <p>Item 2</p>
      </Flow>,
    );

    const el = screen.getByTestId('flow-space');
    expect(el.className).toContain('flow-space-lg');
  });

  it('applies prose mode variant', () => {
    render(
      <Flow prose data-testid="flow-prose">
        <h2>Section Title</h2>
        <p>First paragraph</p>
      </Flow>,
    );

    const el = screen.getByTestId('flow-prose');
    expect(el.className).toContain('flow-prose-true');
  });
});
