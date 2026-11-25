import React from 'react';
import { createRoot } from 'react-dom/client';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { page } from 'vitest/browser';

import '../../../core/src/theme.css';
import {
  ContainerQueryFixture,
  ControlStyleFixture,
  OverrideFixture,
  ResponsiveFixture,
} from '../../src/shared/CustomizationFixture.js';

describe('Customization Browser Tests (Layers, Responsive, Control Styles)', () => {
  let container: HTMLDivElement | null = null;

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'root';
    document.body.appendChild(container);
    document.documentElement.removeAttribute('data-control-style');
  });

  afterEach(() => {
    document.documentElement.removeAttribute('data-control-style');
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  it('allows unlayered consumer className to deterministically override @layer components', async () => {
    if (!container) throw new Error('Container not initialized');
    const root = createRoot(container);
    root.render(<OverrideFixture />);

    await expect.element(page.getByTestId('override-card')).toBeVisible();
    const cardEl = page.getByTestId('override-card').element();
    const cardStyle = window.getComputedStyle(cardEl);
    expect(cardStyle.padding).toBe('48px');
    expect(cardStyle.backgroundColor).toBe('rgb(255, 0, 0)');

    const btnEl = page.getByTestId('override-btn').element();
    const btnStyle = window.getComputedStyle(btnEl);
    expect(btnStyle.backgroundColor).toBe('rgb(16, 185, 129)');
    expect(btnStyle.borderRadius).toBe('0px');
  });

  it('supports Stack props on Card/Surface and viewport @media responsive variants', async () => {
    if (!container) throw new Error('Container not initialized');
    const root = createRoot(container);
    root.render(<ResponsiveFixture />);

    await page.viewport(375, 800);
    await expect.element(page.getByTestId('responsive-card')).toBeVisible();
    const el = page.getByTestId('responsive-card').element();
    const mobileStyle = window.getComputedStyle(el);
    expect(mobileStyle.padding).toBe('8px');
    expect(mobileStyle.flexDirection).toBe('column');
    expect(mobileStyle.gap).toBe('16px');

    await page.viewport(1024, 800);
    const desktopStyle = window.getComputedStyle(el);
    expect(desktopStyle.padding).toBe('32px');
    expect(desktopStyle.flexDirection).toBe('row');
  });

  it('supports custom @container query responsive recipes', async () => {
    if (!container) throw new Error('Container not initialized');
    const root = createRoot(container);
    root.render(<ContainerQueryFixture />);

    await expect.element(page.getByTestId('cq-child')).toBeVisible();
    const parentEl = page.getByTestId('cq-parent').element();
    const childEl = page.getByTestId('cq-child').element();
    if (!(parentEl instanceof HTMLElement)) {
      throw new Error('Expected cq-parent to be HTMLElement');
    }

    expect(window.getComputedStyle(childEl).flexDirection).toBe('column');

    parentEl.style.width = '500px';
    expect(window.getComputedStyle(childEl).flexDirection).toBe('row');
  });

  it('applies raised and 3d control-style presets while keeping ghost buttons flat', async () => {
    if (!container) throw new Error('Container not initialized');
    const root = createRoot(container);
    root.render(<ControlStyleFixture />);

    await expect.element(page.getByTestId('btn-primary')).toBeVisible();
    const primaryEl = page.getByTestId('btn-primary').element();
    const ghostEl = page.getByTestId('btn-ghost').element();

    // Default flat theme
    expect(window.getComputedStyle(primaryEl).backgroundImage).toBe('none');
    expect(window.getComputedStyle(primaryEl).boxShadow).toBe('none');

    // Raised preset
    document.documentElement.setAttribute('data-control-style', 'raised');
    expect(window.getComputedStyle(primaryEl).backgroundImage).toContain('linear-gradient');
    expect(window.getComputedStyle(primaryEl).boxShadow).not.toBe('none');
    expect(window.getComputedStyle(ghostEl).backgroundImage).toBe('none');
    expect(window.getComputedStyle(ghostEl).boxShadow).toBe('none');

    // 3D preset
    document.documentElement.setAttribute('data-control-style', '3d');
    expect(window.getComputedStyle(primaryEl).backgroundImage).toContain('linear-gradient');
    expect(window.getComputedStyle(primaryEl).boxShadow).not.toBe('none');
    expect(window.getComputedStyle(ghostEl).backgroundImage).toBe('none');
    expect(window.getComputedStyle(ghostEl).boxShadow).toBe('none');
  });
});
