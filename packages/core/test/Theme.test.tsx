import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';
import { renderHook, act } from '@testing-library/react';
import {
  createThemeStore,
  getSystemColorMode,
  resolveColorMode,
  getStoredTheme,
  setStoredTheme,
  getStoredColorMode,
  setStoredColorMode,
  applyTheme,
  applyColorScheme,
  getThemeScript,
  useTheme,
  isTheme,
  isColorMode,
} from '../src/index.js';

describe('Theme and ColorMode utilities and store', () => {
  let isDarkMedia = false;

  beforeEach(() => {
    isDarkMedia = false;
    localStorage.clear();
    document.documentElement.style.colorScheme = '';
    document.documentElement.removeAttribute('data-theme');
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

  it('validates color modes and themes correctly', () => {
    expect(isColorMode('light')).toBe(true);
    expect(isColorMode('dark')).toBe(true);
    expect(isColorMode('system')).toBe(true);
    expect(isColorMode('unknown')).toBe(false);
    expect(isColorMode(null)).toBe(false);
    expect(isColorMode(123)).toBe(false);

    expect(isTheme('default')).toBe(true);
    expect(isTheme('docs')).toBe(true);
    expect(isTheme('cloud')).toBe(true);
    expect(isTheme('my-custom-theme')).toBe(true);
    expect(isTheme('')).toBe(false);
    expect(isTheme(null)).toBe(false);
    expect(isTheme(123)).toBe(false);
  });

  it('detects system theme and resolves color mode based on matchMedia', () => {
    isDarkMedia = true;
    expect(getSystemColorMode()).toBe('dark');
    expect(resolveColorMode('system')).toBe('dark');
    expect(resolveColorMode('light')).toBe('light');
    expect(resolveColorMode('dark')).toBe('dark');

    isDarkMedia = false;
    expect(getSystemColorMode()).toBe('light');
    expect(resolveColorMode('system')).toBe('light');
  });

  it('reads and writes theme and color mode to localStorage safely', () => {
    // Theme storage
    expect(getStoredTheme()).toBe('default');
    setStoredTheme('docs');
    expect(getStoredTheme()).toBe('docs');
    expect(localStorage.getItem('cumulo-theme')).toBe('docs');

    setStoredTheme('default');
    expect(getStoredTheme()).toBe('default');
    expect(localStorage.getItem('cumulo-theme')).toBeNull();

    // Mode storage
    expect(getStoredColorMode()).toBe('system');
    setStoredColorMode('dark');
    expect(getStoredColorMode()).toBe('dark');
    expect(localStorage.getItem('cumulo-mode')).toBe('dark');

    setStoredColorMode('system');
    expect(getStoredColorMode()).toBe('system');
    expect(localStorage.getItem('cumulo-mode')).toBeNull();
  });

  it('applies theme attribute and color-scheme to documentElement', () => {
    applyTheme('docs');
    expect(document.documentElement.getAttribute('data-theme')).toBe('docs');

    applyTheme('cloud');
    expect(document.documentElement.getAttribute('data-theme')).toBe('cloud');

    applyColorScheme('dark');
    expect(document.documentElement.style.colorScheme).toBe('dark');

    applyColorScheme('light');
    expect(document.documentElement.style.colorScheme).toBe('light');
  });

  it('generates zero-FOUC script snippet with getThemeScript', () => {
    const script = getThemeScript({
      themeStorageKey: 'my-theme-key',
      modeStorageKey: 'my-mode-key',
      defaultTheme: 'docs',
      defaultMode: 'dark',
    });
    expect(script).toContain('"my-theme-key"');
    expect(script).toContain('"my-mode-key"');
    expect(script).toContain('"docs"');
    expect(script).toContain('"dark"');
    expect(script).toContain('data-theme');
    expect(script).toContain('document.documentElement.style.colorScheme');
    expect(script).toContain('(prefers-color-scheme: dark)');
  });

  it('implements 2-state toggle lifecycle with OS preference changes', () => {
    // 1. OS is Light, nothing in LS
    isDarkMedia = false;
    const store = createThemeStore({
      themeStorageKey: 'test-theme-key',
      modeStorageKey: 'test-mode-key',
      defaultTheme: 'docs',
      defaultMode: 'system',
    });

    expect(store.getTheme()).toBe('docs');
    expect(store.getMode()).toBe('system');
    expect(store.getResolvedMode()).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('docs');
    expect(localStorage.getItem('test-mode-key')).toBeNull();

    // 2. User toggles mode -> target is Dark (differs from OS: light) -> Pin override 'dark'
    store.toggleMode();
    expect(store.getMode()).toBe('dark');
    expect(store.getResolvedMode()).toBe('dark');
    expect(localStorage.getItem('test-mode-key')).toBe('dark');
    expect(document.documentElement.style.colorScheme).toBe('dark');

    // 3. User switches theme -> sets custom theme attribute
    store.setTheme('cloud');
    expect(store.getTheme()).toBe('cloud');
    expect(document.documentElement.getAttribute('data-theme')).toBe('cloud');
    expect(localStorage.getItem('test-theme-key')).toBe('cloud');

    // 4. OS switches to Dark (sunset) -> Override 'dark' must be PRESERVED in storage
    isDarkMedia = true;
    expect(store.getMode()).toBe('dark');
    expect(localStorage.getItem('test-mode-key')).toBe('dark');

    // 5. OS switches back to Light (sunrise) -> Override 'dark' remains active
    isDarkMedia = false;
    expect(store.getMode()).toBe('dark');
    expect(store.getResolvedMode()).toBe('dark');
    expect(localStorage.getItem('test-mode-key')).toBe('dark');

    // 6. User toggles mode -> target is Light (matches OS: light) -> Remove override, revert to system!
    store.toggleMode();
    expect(store.getMode()).toBe('system');
    expect(store.getResolvedMode()).toBe('light');
    expect(localStorage.getItem('test-mode-key')).toBeNull();
    expect(document.documentElement.style.colorScheme).toBe('light');

    store.destroy();
  });

  it('integrates with React via useTheme hook', () => {
    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toBeDefined();
    expect(result.current.mode).toBeDefined();
    expect(['light', 'dark']).toContain(result.current.resolvedMode);

    act(() => {
      result.current.setTheme('docs');
      result.current.setMode('dark');
    });

    expect(result.current.theme).toBe('docs');
    expect(result.current.mode).toBe('dark');
    expect(result.current.resolvedMode).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('docs');
    expect(document.documentElement.style.colorScheme).toBe('dark');

    act(() => {
      result.current.toggleMode(['light', 'dark']);
    });

    expect(result.current.mode).toBe('light');
    expect(result.current.resolvedMode).toBe('light');
    expect(document.documentElement.style.colorScheme).toBe('light');
  });
});
