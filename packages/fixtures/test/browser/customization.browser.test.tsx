import React from 'react';
import { createRoot } from 'react-dom/client';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { page } from 'vitest/browser';

import '../../../core/src/theme.css';
import {
  ControlStyleFixture,
  OverrideFixture,
  StackCardFixture,
} from '../../src/shared/CustomizationFixture.js';

describe('Customization Browser Tests (Layers, Card Stack, Control Styles)', () => {
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

  it('supports Stack layout props directly on Card/Surface', async () => {
    if (!container) throw new Error('Container not initialized');
    const root = createRoot(container);
    root.render(<StackCardFixture />);

    await expect.element(page.getByTestId('stack-card')).toBeVisible();
    const el = page.getByTestId('stack-card').element();
    const computed = window.getComputedStyle(el);
    expect(computed.padding).toBe('32px');
    expect(computed.flexDirection).toBe('row');
    expect(computed.gap).toBe('16px');
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
