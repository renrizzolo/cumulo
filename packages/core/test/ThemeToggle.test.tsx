import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { ThemeToggle } from '../src';
import { buttonRecipe } from '../src/components/Button';
import { themeStore } from '../src/theme/theme';

describe('ThemeToggle component', () => {
  let isDarkMedia = false;

  beforeEach(() => {
    isDarkMedia = false;
    localStorage.clear();
    document.documentElement.style.colorScheme = '';
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: isDarkMedia,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    themeStore.setMode('system');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders button with button recipe variants', () => {
    render(<ThemeToggle variant="outline" size="sm" shape="round" />);
    const button = screen.getByRole('button');
    expect(button.className).toContain(buttonRecipe.classNames.variants.variant.outline);
    expect(button.className).toContain(buttonRecipe.classNames.variants.size.sm);
    expect(button.className).toContain(buttonRecipe.classNames.variants.shape.round);
  });

  it('renders button with accessible aria-label', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button');
    expect(button).toBeDefined();
    expect(button.getAttribute('aria-label')).toBe('Switch to dark mode');
  });

  it('performs 2-state smart toggle on click (system light -> override dark -> system light)', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button');

    expect(themeStore.getMode()).toBe('system');
    expect(themeStore.getResolvedMode()).toBe('light');

    // Toggle 1: switches to dark, stores 'dark'
    fireEvent.click(button);
    expect(themeStore.getMode()).toBe('dark');
    expect(themeStore.getResolvedMode()).toBe('dark');
    expect(document.documentElement.style.colorScheme).toBe('dark');
    expect(localStorage.getItem('cumulo-mode')).toBe('dark');
    expect(button.getAttribute('aria-label')).toBe('Switch to light mode');

    // Toggle 2: switches back to light (which matches OS), removes override from LS
    fireEvent.click(button);
    expect(themeStore.getMode()).toBe('system');
    expect(themeStore.getResolvedMode()).toBe('light');
    expect(document.documentElement.style.colorScheme).toBe('light');
    expect(localStorage.getItem('cumulo-mode')).toBeNull();
    expect(button.getAttribute('aria-label')).toBe('Switch to dark mode');
  });

  it('supports explicit multi-mode cycle mode', () => {
    render(<ThemeToggle mode="cycle" />);
    const button = screen.getByRole('button');

    expect(themeStore.getMode()).toBe('system');

    fireEvent.click(button);
    expect(themeStore.getMode()).toBe('light');

    fireEvent.click(button);
    expect(themeStore.getMode()).toBe('dark');

    fireEvent.click(button);
    expect(themeStore.getMode()).toBe('system');
  });

  it('renders custom label when showLabel is true', () => {
    render(<ThemeToggle showLabel />);
    expect(screen.getByText('Light')).toBeDefined();
  });
});
