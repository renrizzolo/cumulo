import { useSyncExternalStore, useCallback } from 'react';
import {
  themeStore,
  type Theme,
  type ColorMode,
  type ResolvedColorMode,
  DEFAULT_THEME,
  DEFAULT_COLOR_MODE,
  resolveColorMode,
} from './theme.js';

export interface UseThemeReturn {
  /** Active custom or default theme (e.g. 'default', 'docs', 'cloud') */
  theme: Theme;
  /** Set the active theme name */
  setTheme: (theme: Theme) => void;

  /** Active color mode ('light' | 'dark' | 'system') */
  mode: ColorMode;
  /** Resolved color mode ('light' | 'dark') */
  resolvedMode: ResolvedColorMode;
  /** Current OS preference ('light' | 'dark') */
  systemMode: ResolvedColorMode;
  /** Set the color mode */
  setMode: (mode: ColorMode) => void;
  /** Toggle the color mode (2-state smart toggle or custom cycle) */
  toggleMode: (cycle?: readonly ColorMode[]) => void;
}

const SERVER_SYSTEM_MODE: ResolvedColorMode = 'light';

export function useTheme(defaultTheme?: Theme): UseThemeReturn {
  if (defaultTheme !== undefined) {
    themeStore.setDefaultTheme(defaultTheme);
  }

  const theme = useSyncExternalStore(
    themeStore.subscribe,
    themeStore.getTheme,
    (): Theme => defaultTheme ?? DEFAULT_THEME,
  );

  const mode = useSyncExternalStore(
    themeStore.subscribe,
    themeStore.getMode,
    (): ColorMode => DEFAULT_COLOR_MODE,
  );

  const resolvedMode = useSyncExternalStore(
    themeStore.subscribe,
    themeStore.getResolvedMode,
    (): ResolvedColorMode => resolveColorMode(DEFAULT_COLOR_MODE),
  );

  const systemMode = useSyncExternalStore(
    themeStore.subscribe,
    themeStore.getSystemMode,
    (): ResolvedColorMode => SERVER_SYSTEM_MODE,
  );

  const setTheme = useCallback((nextTheme: Theme): void => {
    themeStore.setTheme(nextTheme);
  }, []);

  const setMode = useCallback((nextMode: ColorMode): void => {
    themeStore.setMode(nextMode);
  }, []);

  const toggleMode = useCallback((cycle?: readonly ColorMode[]): void => {
    themeStore.toggleMode(cycle);
  }, []);

  return {
    theme,
    setTheme,
    mode,
    resolvedMode,
    systemMode,
    setMode,
    toggleMode,
  };
}
