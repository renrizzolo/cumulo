import { useSyncExternalStore, useCallback } from 'react';
import {
  themeStore,
  type Theme,
  type ResolvedTheme,
  DEFAULT_THEME,
  resolveTheme,
} from './theme.js';

export interface UseThemeReturn {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  systemTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  toggleTheme: (cycle?: readonly Theme[]) => void;
}

const SERVER_SYSTEM_THEME: ResolvedTheme = 'light';

export function useTheme(): UseThemeReturn {
  const theme = useSyncExternalStore(
    themeStore.subscribe,
    themeStore.getTheme,
    () => DEFAULT_THEME,
  );

  const resolvedTheme = useSyncExternalStore(
    themeStore.subscribe,
    themeStore.getResolvedTheme,
    () => resolveTheme(DEFAULT_THEME),
  );

  const systemTheme = useSyncExternalStore(
    themeStore.subscribe,
    themeStore.getSystemTheme,
    () => SERVER_SYSTEM_THEME,
  );

  const setTheme = useCallback((nextTheme: Theme) => {
    themeStore.setTheme(nextTheme);
  }, []);

  const toggleTheme = useCallback((cycle?: readonly Theme[]) => {
    themeStore.toggleTheme(cycle);
  }, []);

  return {
    theme,
    resolvedTheme,
    systemTheme,
    setTheme,
    toggleTheme,
  };
}
