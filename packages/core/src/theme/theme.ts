export type ColorMode = 'light' | 'dark' | 'system';
export type ResolvedColorMode = 'light' | 'dark';

export type Theme = 'default' | 'cloud' | 'docs' | (string & {});

export const DEFAULT_THEME: Theme = 'default';
export const DEFAULT_COLOR_MODE: ColorMode = 'system';

export const DEFAULT_THEME_STORAGE_KEY = 'cumulo-theme';
export const DEFAULT_MODE_STORAGE_KEY = 'cumulo-mode';

export function isColorMode(value: unknown): value is ColorMode {
  return value === 'light' || value === 'dark' || value === 'system';
}

export function isResolvedColorMode(value: unknown): value is ResolvedColorMode {
  return value === 'light' || value === 'dark';
}

export function isTheme(value: unknown): value is Theme {
  return typeof value === 'string' && value.trim().length > 0;
}

export function getSystemColorMode(): ResolvedColorMode {
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

export function resolveColorMode(mode: ColorMode): ResolvedColorMode {
  if (mode === 'system') {
    return getSystemColorMode();
  }
  return mode === 'dark' ? 'dark' : 'light';
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
    if (item && isTheme(item)) {
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
    if (theme === DEFAULT_THEME) {
      window.localStorage.removeItem(storageKey);
    } else {
      window.localStorage.setItem(storageKey, theme);
    }
  } catch {
    // localStorage might be unavailable/restricted
  }
}

export function getStoredColorMode(
  storageKey: string = DEFAULT_MODE_STORAGE_KEY,
  defaultMode: ColorMode = DEFAULT_COLOR_MODE,
): ColorMode {
  if (typeof window === 'undefined') {
    return defaultMode;
  }
  try {
    const item = window.localStorage.getItem(storageKey);
    if (isColorMode(item)) {
      return item;
    }
  } catch {
    // localStorage might be unavailable/restricted
  }
  return defaultMode;
}

export function setStoredColorMode(
  mode: ColorMode,
  storageKey: string = DEFAULT_MODE_STORAGE_KEY,
): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    if (mode === 'system') {
      window.localStorage.removeItem(storageKey);
    } else {
      window.localStorage.setItem(storageKey, mode);
    }
  } catch {
    // localStorage might be unavailable/restricted
  }
}

export function applyTheme(theme: Theme): void {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', theme);
  }
}

export function applyColorScheme(mode: ColorMode): ResolvedColorMode {
  const resolved = resolveColorMode(mode);
  if (typeof document !== 'undefined') {
    document.documentElement.style.colorScheme = resolved;
  }
  return resolved;
}

export interface ThemeStoreOptions {
  themeStorageKey?: string;
  modeStorageKey?: string;
  defaultTheme?: Theme;
  defaultMode?: ColorMode;
}

export interface ThemeStore {
  getTheme(): Theme;
  setTheme(theme: Theme): void;
  getMode(): ColorMode;
  getResolvedMode(): ResolvedColorMode;
  getSystemMode(): ResolvedColorMode;
  setMode(mode: ColorMode): void;
  toggleMode(cycle?: readonly ColorMode[]): void;
  subscribe(listener: () => void): () => void;
  destroy(): void;
}

export function createThemeStore(options: ThemeStoreOptions = {}): ThemeStore {
  const themeStorageKey = options.themeStorageKey ?? DEFAULT_THEME_STORAGE_KEY;
  const modeStorageKey = options.modeStorageKey ?? DEFAULT_MODE_STORAGE_KEY;
  const defaultTheme = options.defaultTheme ?? DEFAULT_THEME;
  const defaultMode = options.defaultMode ?? DEFAULT_COLOR_MODE;

  let currentTheme: Theme = getStoredTheme(themeStorageKey, defaultTheme);
  let currentMode: ColorMode = getStoredColorMode(modeStorageKey, defaultMode);
  let currentResolvedMode: ResolvedColorMode = resolveColorMode(currentMode);

  const listeners = new Set<() => void>();

  function notify(): void {
    for (const listener of listeners) {
      listener();
    }
  }

  function handleMediaChange(): void {
    if (currentMode === 'system') {
      const nextResolved = getSystemColorMode();
      if (nextResolved !== currentResolvedMode) {
        currentResolvedMode = nextResolved;
        applyColorScheme(currentMode);
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

  // Apply initial theme and colorScheme to documentElement
  if (typeof window !== 'undefined') {
    applyTheme(currentTheme);
    currentResolvedMode = applyColorScheme(currentMode);
  }

  return {
    getTheme(): Theme {
      return currentTheme;
    },
    setTheme(newTheme: Theme): void {
      if (!isTheme(newTheme)) return;
      currentTheme = newTheme;
      setStoredTheme(newTheme, themeStorageKey);
      applyTheme(newTheme);
      notify();
    },
    getMode(): ColorMode {
      return currentMode;
    },
    getResolvedMode(): ResolvedColorMode {
      return currentResolvedMode;
    },
    getSystemMode(): ResolvedColorMode {
      return getSystemColorMode();
    },
    setMode(newMode: ColorMode): void {
      if (!isColorMode(newMode)) return;
      currentMode = newMode;
      setStoredColorMode(newMode, modeStorageKey);
      currentResolvedMode = applyColorScheme(newMode);
      notify();
    },
    toggleMode(cycle?: readonly ColorMode[]): void {
      if (cycle && cycle.length > 0) {
        const currentIndex = cycle.indexOf(currentMode);
        const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % cycle.length;
        const nextMode = cycle[nextIndex];
        this.setMode(nextMode);
        return;
      }

      // See https://lea.verou.me/blog/2026/dark-mode-toggles/
      // 2-state toggle logic:
      // Toggle to the opposite of current appearance.
      // If the target matches current OS preference, remove override (revert to 'system').
      // Otherwise, store explicit override ('light' or 'dark').
      const targetMode: ResolvedColorMode = currentResolvedMode === 'dark' ? 'light' : 'dark';
      const osMode = getSystemColorMode();

      if (targetMode === osMode) {
        this.setMode('system');
      } else {
        this.setMode(targetMode);
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
