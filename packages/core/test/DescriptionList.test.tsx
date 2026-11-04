import '@testing-library/jest-dom/vitest';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import * as DescriptionList from '../src/components/DescriptionList.js';

describe('DescriptionList Component', () => {
  it('renders a semantic dl element with direct dt and dd children', () => {
    render(
      <DescriptionList.Root data-testid="dl">
        <DescriptionList.Term data-testid="term-1" icon="🌐">
          Platform-first
        </DescriptionList.Term>
        <DescriptionList.Description data-testid="desc-1">
          Uses native HTML dialog and popover.
        </DescriptionList.Description>
      </DescriptionList.Root>,
    );

    const dl = screen.getByTestId('dl');
    expect(dl.tagName).toBe('DL');

    const dt = screen.getByTestId('term-1');
    expect(dt.tagName).toBe('DT');
    expect(dt.parentElement).toBe(dl);
    expect(dt).toHaveTextContent('Platform-first');

    const dd = screen.getByTestId('desc-1');
    expect(dd.tagName).toBe('DD');
    expect(dd.parentElement).toBe(dl);
    expect(dd).toHaveTextContent('Uses native HTML dialog and popover.');

    const marker = dt.querySelector('span[aria-hidden="true"]');
    if (!marker) throw new Error('Expected icon marker span');
    expect(marker).toHaveTextContent('🌐');
  });

  it('supports explicit DescriptionList.Icon component', () => {
    render(
      <DescriptionList.Root>
        <DescriptionList.Term data-testid="term">
          <DescriptionList.Icon data-testid="custom-icon">⚡</DescriptionList.Icon>
          Fast
        </DescriptionList.Term>
        <DescriptionList.Description>Zero runtime overhead</DescriptionList.Description>
      </DescriptionList.Root>,
    );

    const icon = screen.getByTestId('custom-icon');
    expect(icon).toHaveAttribute('aria-hidden', 'true');
    expect(icon).toHaveTextContent('⚡');
  });
});
