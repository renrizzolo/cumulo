export type Theme = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

export const DEFAULT_THEME_STORAGE_KEY = 'cumulo-theme';
export const DEFAULT_THEME: Theme = 'system';

export function isTheme(value: unknown): value is Theme {
  return value === 'light' || value === 'dark' || value === 'system';
}

export function isResolvedTheme(value: unknown): value is ResolvedTheme {
  return value === 'light' || value === 'dark';
}

export function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return 'light';
  }
  try {
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    return mql && mql.matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export function resolveTheme(theme: Theme): ResolvedTheme {
  if (theme === 'system') {
    return getSystemTheme();
  }
  return theme;
}

export function getStoredTheme(
  storageKey: string = DEFAULT_THEME_STORAGE_KEY,
  defaultTheme: Theme = DEFAULT_THEME,
): Theme {
  if (typeof window === 'undefined') {
    return defaultTheme;
  }
  try {
    const item = window.localStorage.getItem(storageKey);
    if (isTheme(item)) {
      return item;
    }
  } catch {
    // localStorage might be unavailable/restricted
  }
  return defaultTheme;
}

export function setStoredTheme(theme: Theme, storageKey: string = DEFAULT_THEME_STORAGE_KEY): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    if (theme === 'system') {
      window.localStorage.removeItem(storageKey);
    } else {
      window.localStorage.setItem(storageKey, theme);
    }
  } catch {
    // localStorage might be unavailable/restricted
  }
}

export function applyColorScheme(theme: Theme): ResolvedTheme {
  const resolved = resolveTheme(theme);
  if (typeof document !== 'undefined') {
    document.documentElement.style.colorScheme = resolved;
  }
  return resolved;
}

export interface ThemeStoreOptions {
  storageKey?: string;
  defaultTheme?: Theme;
}

export interface ThemeStore {
  getTheme(): Theme;
  getResolvedTheme(): ResolvedTheme;
  getSystemTheme(): ResolvedTheme;
  setTheme(theme: Theme): void;
  toggleTheme(cycle?: readonly Theme[]): void;
  subscribe(listener: () => void): () => void;
  destroy(): void;
}

export function createThemeStore(options: ThemeStoreOptions = {}): ThemeStore {
  const storageKey = options.storageKey ?? DEFAULT_THEME_STORAGE_KEY;
  const defaultTheme = options.defaultTheme ?? DEFAULT_THEME;

  let currentTheme: Theme = getStoredTheme(storageKey, defaultTheme);
  let currentResolved: ResolvedTheme = resolveTheme(currentTheme);

  const listeners = new Set<() => void>();

  function notify(): void {
    for (const listener of listeners) {
      listener();
    }
  }

  function handleMediaChange(): void {
    if (currentTheme === 'system') {
      const nextResolved = getSystemTheme();
      if (nextResolved !== currentResolved) {
        currentResolved = nextResolved;
        applyColorScheme(currentTheme);
        notify();
      }
    }
  }

  let mediaQueryList: MediaQueryList | null = null;
  if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    try {
      mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');
      if (mediaQueryList && typeof mediaQueryList.addEventListener === 'function') {
        mediaQueryList.addEventListener('change', handleMediaChange);
      }
    } catch {
      // matchMedia failed or unsupported
    }
  }

  // Apply initial theme to documentElement immediately
  if (typeof window !== 'undefined') {
    currentResolved = applyColorScheme(currentTheme);
  }

  return {
    getTheme(): Theme {
      return currentTheme;
    },
    getResolvedTheme(): ResolvedTheme {
      return currentResolved;
    },
    getSystemTheme(): ResolvedTheme {
      return getSystemTheme();
    },
    setTheme(newTheme: Theme): void {
      if (!isTheme(newTheme)) return;
      currentTheme = newTheme;
      setStoredTheme(newTheme, storageKey);
      currentResolved = applyColorScheme(newTheme);
      notify();
    },
    toggleTheme(cycle?: readonly Theme[]): void {
      if (cycle && cycle.length > 0) {
        const currentIndex = cycle.indexOf(currentTheme);
        const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % cycle.length;
        const nextTheme = cycle[nextIndex];
        this.setTheme(nextTheme);
        return;
      }

      // See https://lea.verou.me/blog/2026/dark-mode-toggles/
      // 2-state toggle logic:
      // Toggle to the opposite of current appearance.
      // If the target matches current OS preference, remove override (revert to 'system').
      // Otherwise, store explicit override ('light' or 'dark').
      const targetTheme: ResolvedTheme = currentResolved === 'dark' ? 'light' : 'dark';
      const osTheme = getSystemTheme();

      if (targetTheme === osTheme) {
        this.setTheme('system');
      } else {
        this.setTheme(targetTheme);
      }
    },
    subscribe(listener: () => void): () => void {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    destroy(): void {
      listeners.clear();
      if (mediaQueryList) {
        if (typeof mediaQueryList.removeEventListener === 'function') {
          mediaQueryList.removeEventListener('change', handleMediaChange);
        }
        mediaQueryList = null;
      }
    },
  };
}

export const themeStore: ThemeStore = createThemeStore();
