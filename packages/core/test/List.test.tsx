import '@testing-library/jest-dom/vitest';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import * as List from '../src/components/List.js';

describe('List Component', () => {
  it('renders a semantic unordered list by default', () => {
    render(
      <List.Root data-testid="list">
        <List.Item data-testid="item-1">First item</List.Item>
        <List.Item data-testid="item-2">Second item</List.Item>
      </List.Root>,
    );

    const list = screen.getByTestId('list');
    expect(list).toBeInTheDocument();
    expect(list.tagName).toBe('UL');

    const item1 = screen.getByTestId('item-1');
    expect(item1.tagName).toBe('LI');
    expect(item1).toHaveTextContent('First item');
  });

  it('renders items with icon prop and separates marker from content', () => {
    render(
      <List.Root data-testid="icon-list">
        <List.Item icon="🌐" data-testid="icon-item">
          Platform-first components
        </List.Item>
      </List.Root>,
    );

    const item = screen.getByTestId('icon-item');
    expect(item).toBeInTheDocument();
    expect(item).toHaveTextContent('Platform-first components');

    const marker = item.querySelector('span[aria-hidden="true"]');
    if (!marker) throw new Error('Expected icon marker span');
    expect(marker).toHaveTextContent('🌐');
  });

  it('supports explicit compound subcomponents (List.Icon and List.Content)', () => {
    render(
      <List.Root>
        <List.Item data-testid="compound-item">
          <List.Icon data-testid="custom-icon">🧩</List.Icon>
          <List.Content data-testid="custom-content">Compound components</List.Content>
        </List.Item>
      </List.Root>,
    );

    const icon = screen.getByTestId('custom-icon');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute('aria-hidden', 'true');
    expect(icon).toHaveTextContent('🧩');

    const content = screen.getByTestId('custom-content');
    expect(content).toBeInTheDocument();
    expect(content).toHaveTextContent('Compound components');
  });

  it('renders bullet markers when variant="bullet"', () => {
    render(
      <List.Root variant="bullet" data-testid="bullet-list">
        <List.Item data-testid="bullet-item">Bullet point</List.Item>
      </List.Root>,
    );

    const item = screen.getByTestId('bullet-item');
    const marker = item.querySelector('span[aria-hidden="true"]');
    if (!marker) throw new Error('Expected bullet marker span');
    expect(marker).toBeInTheDocument();
    expect(item).toHaveTextContent('Bullet point');
  });

  it('renders ordered counter markers when variant="ordered"', () => {
    render(
      <List.Root variant="ordered" data-testid="ordered-list">
        <List.Item data-testid="ordered-item-1">First step</List.Item>
        <List.Item data-testid="ordered-item-2">Second step</List.Item>
      </List.Root>,
    );

    const item1 = screen.getByTestId('ordered-item-1');
    const marker1 = item1.querySelector('span[aria-hidden="true"]');
    if (!marker1) throw new Error('Expected ordered marker span');
    expect(marker1).toBeInTheDocument();
    expect(item1).toHaveTextContent('First step');
  });

  it('supports discriminated variants between icon and standard items', () => {
    render(
      <List.Root data-testid="discriminated-list">
        <List.Item variant="icon" icon="⭐" data-testid="item-icon">
          Starred item
        </List.Item>
        <List.Item variant="plain" data-testid="item-plain">
          Plain item
        </List.Item>
      </List.Root>,
    );

    const iconItem = screen.getByTestId('item-icon');
    expect(iconItem).toHaveTextContent('Starred item');
    expect(iconItem).toHaveTextContent('⭐');

    const plainItem = screen.getByTestId('item-plain');
    expect(plainItem).toHaveTextContent('Plain item');
    expect(plainItem.querySelector('span[aria-hidden="true"]')).toBeNull();
  });

  it('allows List.Item variant to override List.Root variant', () => {
    render(
      <List.Root variant="bullet">
        <List.Item data-testid="inherited-bullet">Inherited bullet</List.Item>
        <List.Item variant="plain" data-testid="override-plain">
          Overridden plain
        </List.Item>
      </List.Root>,
    );

    const inherited = screen.getByTestId('inherited-bullet');
    expect(inherited.querySelector('span[aria-hidden="true"]')).not.toBeNull();

    const overridden = screen.getByTestId('override-plain');
    expect(overridden.querySelector('span[aria-hidden="true"]')).toBeNull();
  });
});
