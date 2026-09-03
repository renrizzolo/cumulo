import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { Card } from '../src/index.js';

afterEach(() => {
  cleanup();
});

describe('Card component', () => {
  it('renders without crashing', () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });
});
