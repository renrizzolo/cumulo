import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { Code } from '../src/index.js';

afterEach(() => {
  cleanup();
});

describe('Code component', () => {
  it('renders without crashing', () => {
    render(<Code>const x = 1;</Code>);
    expect(screen.getByText('const x = 1;')).toBeInTheDocument();
  });

  it('renders with custom wrap prop', () => {
    render(<Code wrap="nowrap">nowrap code</Code>);
    expect(screen.getByText('nowrap code')).toBeInTheDocument();
  });
});
