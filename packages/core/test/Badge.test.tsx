import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { Badge } from '../src/index.js';

afterEach(() => {
  cleanup();
});

describe('Badge component', () => {
  it('renders without crashing', () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });
});
