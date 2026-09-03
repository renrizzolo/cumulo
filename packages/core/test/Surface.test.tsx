import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Surface } from '../src/components/Surface';

describe('Surface component', () => {
  it('renders without crashing', () => {
    render(<Surface>Surface content</Surface>);
    expect(screen.getByText('Surface content')).toBeInTheDocument();
  });
});
