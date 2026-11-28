import React from 'react';
import { createRoot } from 'react-dom/client';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { page } from 'vitest/browser';

import '../../../core/src/theme.css';
import {
  ResponsiveContainerFixture,
  ResponsiveLayoutFixture,
} from '../../src/shared/ResponsiveFixture.js';

describe('Responsive Variants Browser Tests (@media, @container, Cascade Layers)', () => {
  let container: HTMLDivElement | null = null;

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'root';
    document.body.appendChild(container);
  });

  afterEach(async () => {
    await page.viewport(1280, 800);
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  it('updates Stack and Grid computed styles at exact theme.css breakpoints and lets unlayered overrides win', async () => {
    if (!container) throw new Error('Container not initialized');
    const root = createRoot(container);
    root.render(<ResponsiveLayoutFixture />);

    await expect.element(page.getByTestId('responsive-stack')).toBeVisible();
    const stackEl = page.getByTestId('responsive-stack').element();
    const overriddenEl = page.getByTestId('overridden-stack').element();
    const gridEl = page.getByTestId('responsive-grid').element();

    // Below sm/md (500px): initial styles apply
    await page.viewport(500, 600);
    expect(window.getComputedStyle(stackEl).flexDirection).toBe('column');
    expect(window.getComputedStyle(stackEl).gap).toBe('8px'); // spacing.xs = 0.5rem
    expect(window.getComputedStyle(gridEl).gridTemplateColumns.split(' ').length).toBe(1);
    expect(window.getComputedStyle(overriddenEl).gap).toBe('40px');

    // At md (800px >= 768px): md responsive variants override initial
    await page.viewport(800, 600);
    expect(window.getComputedStyle(stackEl).flexDirection).toBe('row');
    expect(window.getComputedStyle(stackEl).gap).toBe('16px'); // spacing.md = 1rem
    expect(window.getComputedStyle(gridEl).gridTemplateColumns.split(' ').length).toBe(2);
    // Unlayered className still beats @layer responsive.bp-md
    expect(window.getComputedStyle(overriddenEl).gap).toBe('40px');

    // At lg (1100px >= 1024px): lg overrides md cleanly
    await page.viewport(1100, 600);
    expect(window.getComputedStyle(stackEl).flexDirection).toBe('row');
    expect(window.getComputedStyle(stackEl).gap).toBe('32px'); // spacing.xl = 2rem
    expect(window.getComputedStyle(gridEl).gridTemplateColumns.split(' ').length).toBe(4);
  });

  it('evaluates custom named @container queries in recipes based on container width', async () => {
    if (!container) throw new Error('Container not initialized');
    const root = createRoot(container);

    // Narrow container (320px < 500px) -> initial stacked + sm padding
    root.render(<ResponsiveContainerFixture width={320} />);
    await expect.element(page.getByTestId('container-card')).toBeVisible();
    const cardEl = page.getByTestId('container-card').element();
    expect(window.getComputedStyle(cardEl).flexDirection).toBe('column');
    expect(window.getComputedStyle(cardEl).padding).toBe('8px');

    // Wide container (600px >= 500px) -> @container card (min-width: 500px) triggers
    root.render(<ResponsiveContainerFixture width={600} />);
    await expect.poll(() => window.getComputedStyle(cardEl).flexDirection).toBe('row');
    expect(window.getComputedStyle(cardEl).padding).toBe('24px');
  });
});
