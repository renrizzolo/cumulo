import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';
import { renderHook, act } from '@testing-library/react';
import {
  createThemeStore,
  getSystemTheme,
  resolveTheme,
  getStoredTheme,
  setStoredTheme,
  applyColorScheme,
  getThemeScript,
  useTheme,
  isTheme,
} from '../src/index.js';

describe('Theme utilities and store', () => {
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
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('validates theme values with isTheme', () => {
    expect(isTheme('light')).toBe(true);
    expect(isTheme('dark')).toBe(true);
    expect(isTheme('system')).toBe(true);
    expect(isTheme('unknown')).toBe(false);
    expect(isTheme(null)).toBe(false);
    expect(isTheme(123)).toBe(false);
  });

  it('detects system theme based on matchMedia', () => {
    isDarkMedia = true;
    expect(getSystemTheme()).toBe('dark');
    expect(resolveTheme('system')).toBe('dark');
    expect(resolveTheme('light')).toBe('light');
    expect(resolveTheme('dark')).toBe('dark');

    isDarkMedia = false;
    expect(getSystemTheme()).toBe('light');
    expect(resolveTheme('system')).toBe('light');
  });

  it('reads and writes to localStorage safely (removes on system)', () => {
    expect(getStoredTheme()).toBe('system');
    setStoredTheme('dark');
    expect(getStoredTheme()).toBe('dark');
    expect(localStorage.getItem('cumulo-theme')).toBe('dark');

    setStoredTheme('system');
    expect(getStoredTheme()).toBe('system');
    expect(localStorage.getItem('cumulo-theme')).toBeNull();
  });

  it('applies color-scheme to documentElement', () => {
    applyColorScheme('dark');
    expect(document.documentElement.style.colorScheme).toBe('dark');

    applyColorScheme('light');
    expect(document.documentElement.style.colorScheme).toBe('light');
  });

  it('generates zero-FOUC script snippet with getThemeScript', () => {
    const script = getThemeScript({ storageKey: 'custom-theme', defaultTheme: 'dark' });
    expect(script).toContain('"custom-theme"');
    expect(script).toContain('"dark"');
    expect(script).toContain('document.documentElement.style.colorScheme');
    expect(script).toContain('(prefers-color-scheme: dark)');
  });

  it('implements 2-state toggle lifecycle with OS preference changes', () => {
    // 1. OS is Light, nothing in LS
    isDarkMedia = false;
    const store = createThemeStore({ storageKey: 'test-theme-key', defaultTheme: 'system' });

    expect(store.getTheme()).toBe('system');
    expect(store.getResolvedTheme()).toBe('light');
    expect(localStorage.getItem('test-theme-key')).toBeNull();

    // 2. User toggles -> target is Dark (differs from OS: light) -> Pin override 'dark'
    store.toggleTheme();
    expect(store.getTheme()).toBe('dark');
    expect(store.getResolvedTheme()).toBe('dark');
    expect(localStorage.getItem('test-theme-key')).toBe('dark');
    expect(document.documentElement.style.colorScheme).toBe('dark');

    // 3. OS switches to Dark (sunset) -> Override 'dark' must be PRESERVED in storage
    isDarkMedia = true;
    expect(store.getTheme()).toBe('dark');
    expect(localStorage.getItem('test-theme-key')).toBe('dark');

    // 4. OS switches back to Light (sunrise) -> Override 'dark' remains active
    isDarkMedia = false;
    expect(store.getTheme()).toBe('dark');
    expect(store.getResolvedTheme()).toBe('dark');
    expect(localStorage.getItem('test-theme-key')).toBe('dark');

    // 5. User toggles -> target is Light (matches OS: light) -> Remove override, revert to system!
    store.toggleTheme();
    expect(store.getTheme()).toBe('system');
    expect(store.getResolvedTheme()).toBe('light');
    expect(localStorage.getItem('test-theme-key')).toBeNull();
    expect(document.documentElement.style.colorScheme).toBe('light');

    store.destroy();
  });

  it('integrates with React via useTheme hook', () => {
    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toBeDefined();
    expect(['light', 'dark', 'system']).toContain(result.current.theme);
    expect(['light', 'dark']).toContain(result.current.resolvedTheme);

    act(() => {
      result.current.setTheme('dark');
    });

    expect(result.current.theme).toBe('dark');
    expect(result.current.resolvedTheme).toBe('dark');
    expect(document.documentElement.style.colorScheme).toBe('dark');

    act(() => {
      result.current.toggleTheme(['light', 'dark']);
    });

    expect(result.current.theme).toBe('light');
    expect(result.current.resolvedTheme).toBe('light');
    expect(document.documentElement.style.colorScheme).toBe('light');
  });
});
