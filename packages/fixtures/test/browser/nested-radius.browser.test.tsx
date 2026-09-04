import React from 'react';
import { createRoot } from 'react-dom/client';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { page } from 'vitest/browser';
import '../../../core/src/theme.css';
import { NestedRadiusFixture } from '../../src/shared/NestedRadiusFixture.js';

describe('Nested Concentric Radius Browser Testing', () => {
  let container: HTMLDivElement | null = null;

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'root';
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  it('captures screenshots for concentric radius combinations and multi-level nesting', async () => {
    const root = createRoot(container!);
    root.render(<NestedRadiusFixture />);

    const fixtureLocator = page.getByTestId('nested-radius-fixture');
    await expect.element(fixtureLocator).toBeVisible();

    // 1. Individual section screenshots
    const section2xl = page.getByTestId('section-radius-2xl');
    await expect(section2xl).toMatchScreenshot('concentric-radius-2xl.png');

    const sectionXl = page.getByTestId('section-radius-xl');
    await expect(sectionXl).toMatchScreenshot('concentric-radius-xl.png');

    const sectionLg = page.getByTestId('section-radius-lg');
    await expect(sectionLg).toMatchScreenshot('concentric-radius-lg.png');

    const sectionMultilevel = page.getByTestId('section-multilevel');
    await expect(sectionMultilevel).toMatchScreenshot('concentric-radius-multilevel.png');

    const sectionPaddedChild = page.getByTestId('section-padded-child');
    await expect(sectionPaddedChild).toMatchScreenshot('concentric-radius-padded-child.png');
  });

  it('computes exact concentric border-radius in browser DOM', async () => {
    const root = createRoot(container!);
    root.render(<NestedRadiusFixture />);

    const fixtureLocator = page.getByTestId('nested-radius-fixture');
    await expect.element(fixtureLocator).toBeVisible();

    // Radius 2xl (16px) combinations
    // 16px - 8px (xs) = 8px
    const child2xlXs = page.getByTestId('child-2xl-xs').element();
    expect(window.getComputedStyle(child2xlXs).borderRadius).toBe('8px');

    // 16px - 12px (sm) = 4px
    const child2xlSm = page.getByTestId('child-2xl-sm').element();
    expect(window.getComputedStyle(child2xlSm).borderRadius).toBe('4px');

    // 16px - 16px (md) = 0px
    const child2xlMd = page.getByTestId('child-2xl-md').element();
    expect(window.getComputedStyle(child2xlMd).borderRadius).toBe('0px');

    // 16px - 0px (none) = 16px
    const child2xlNone = page.getByTestId('child-2xl-none').element();
    expect(window.getComputedStyle(child2xlNone).borderRadius).toBe('16px');

    // Radius xl (12px) combinations
    // 12px - 8px (xs) = 4px
    const childXlXs = page.getByTestId('child-xl-xs').element();
    expect(window.getComputedStyle(childXlXs).borderRadius).toBe('4px');

    // 12px - 12px (sm) = 0px
    const childXlSm = page.getByTestId('child-xl-sm').element();
    expect(window.getComputedStyle(childXlSm).borderRadius).toBe('0px');

    // 12px - 0px (none) = 12px
    const childXlNone = page.getByTestId('child-xl-none').element();
    expect(window.getComputedStyle(childXlNone).borderRadius).toBe('12px');

    // Radius lg (8px) combinations
    // 8px - 8px (xs) = 0px
    const childLgXs = page.getByTestId('child-lg-xs').element();
    expect(window.getComputedStyle(childLgXs).borderRadius).toBe('0px');

    // 8px - 0px (none) = 8px
    const childLgNone = page.getByTestId('child-lg-none').element();
    expect(window.getComputedStyle(childLgNone).borderRadius).toBe('8px');

    // Multi-level concentric nesting
    // Level 0: 2xl (16px)
    const ml0 = page.getByTestId('multilevel-l0').element();
    expect(window.getComputedStyle(ml0).borderRadius).toBe('16px');

    // Level 1: 2xl (16px)
    const ml1 = page.getByTestId('multilevel-l1').element();
    expect(window.getComputedStyle(ml1).borderRadius).toBe('16px');

    // Level 2: auto (16px - 8px = 8px)
    const ml2 = page.getByTestId('multilevel-l2').element();
    expect(window.getComputedStyle(ml2).borderRadius).toBe('8px');

    // Padded child regression test:
    // Parent Card: radius 2xl (16px), padding xs (8px)
    // Child Card: radius auto, padding lg (24px)
    // Child Card's radius must be computed from PARENT (16px - 8px = 8px), NOT overwritten by its own padding lg (24px)
    const paddedChild = page.getByTestId('padded-child-child').element();
    expect(window.getComputedStyle(paddedChild).borderRadius).toBe('8px');

    // Inner element inside child card: parent radius (8px) - parent padding (24px) = 0px (clamped to 0)
    const paddedInner = page.getByTestId('padded-child-inner').element();
    expect(window.getComputedStyle(paddedInner).borderRadius).toBe('0px');
  });
});
