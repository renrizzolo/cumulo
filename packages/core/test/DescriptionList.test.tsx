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

  it('supports DescriptionList.Item for grouped stacked layouts', () => {
    render(
      <DescriptionList.Root layout="stacked" orientation="horizontal" data-testid="dl">
        <DescriptionList.Item data-testid="item-1">
          <DescriptionList.Term data-testid="term-1">Framework</DescriptionList.Term>
          <DescriptionList.Description data-testid="desc-1">Cumulo</DescriptionList.Description>
        </DescriptionList.Item>
        <DescriptionList.Item data-testid="item-2">
          <DescriptionList.Term data-testid="term-2">React</DescriptionList.Term>
          <DescriptionList.Description data-testid="desc-2">v19</DescriptionList.Description>
        </DescriptionList.Item>
      </DescriptionList.Root>,
    );

    const dl = screen.getByTestId('dl');
    expect(dl.tagName).toBe('DL');

    const item1 = screen.getByTestId('item-1');
    expect(item1.parentElement).toBe(dl);

    const dt1 = screen.getByTestId('term-1');
    expect(dt1.tagName).toBe('DT');
    expect(dt1.parentElement).toBe(item1);
    expect(dt1).toHaveTextContent('Framework');

    const dd1 = screen.getByTestId('desc-1');
    expect(dd1.tagName).toBe('DD');
    expect(dd1.parentElement).toBe(item1);
    expect(dd1).toHaveTextContent('Cumulo');
  });

  it('supports font size primitives inherited from Root and overridden on children', () => {
    render(
      <DescriptionList.Root size="sm" data-testid="dl">
        <DescriptionList.Term data-testid="term-sm">Small Term</DescriptionList.Term>
        <DescriptionList.Description data-testid="desc-sm">Small Desc</DescriptionList.Description>
        <DescriptionList.Term size="lg" weight="bold" color="primary" data-testid="term-lg">
          Large Term
        </DescriptionList.Term>
        <DescriptionList.Description size="xs" color="muted" data-testid="desc-xs">
          XS Desc
        </DescriptionList.Description>
      </DescriptionList.Root>,
    );

    const termSm = screen.getByTestId('term-sm');
    expect(termSm.tagName).toBe('DT');
    expect(termSm).toHaveTextContent('Small Term');

    const descSm = screen.getByTestId('desc-sm');
    expect(descSm.tagName).toBe('DD');
    expect(descSm).toHaveTextContent('Small Desc');

    const termLg = screen.getByTestId('term-lg');
    expect(termLg.tagName).toBe('DT');
    expect(termLg).toHaveTextContent('Large Term');

    const descXs = screen.getByTestId('desc-xs');
    expect(descXs.tagName).toBe('DD');
    expect(descXs).toHaveTextContent('XS Desc');
  });
});
