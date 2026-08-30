import React from 'react';
import {
  DEFAULT_THEME_STORAGE_KEY,
  DEFAULT_MODE_STORAGE_KEY,
  DEFAULT_THEME,
  DEFAULT_COLOR_MODE,
  type Theme,
  type ColorMode,
} from './theme.js';

export interface ThemeScriptOptions {
  themeStorageKey?: string;
  modeStorageKey?: string;
  defaultTheme?: Theme;
  defaultMode?: ColorMode;
  nonce?: string;
}

// prevent FOUC by setting theme attribute and color-scheme before React renders
export function getThemeScript(options: ThemeScriptOptions = {}): string {
  const themeStorageKey = options.themeStorageKey ?? DEFAULT_THEME_STORAGE_KEY;
  const modeStorageKey = options.modeStorageKey ?? DEFAULT_MODE_STORAGE_KEY;
  const defaultTheme = options.defaultTheme ?? DEFAULT_THEME;
  const defaultMode = options.defaultMode ?? DEFAULT_COLOR_MODE;

  return `(function(){try{var tk=${JSON.stringify(themeStorageKey)},mk=${JSON.stringify(
    modeStorageKey,
  )},dt=${JSON.stringify(defaultTheme)},dm=${JSON.stringify(
    defaultMode,
  )};var st=localStorage.getItem(tk)||dt;if(st){document.documentElement.setAttribute('data-theme',st);}var sm=localStorage.getItem(mk),m=(sm==='light'||sm==='dark'||sm==='system')?sm:dm,isDark=window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.style.colorScheme=(m==='dark'||(m==='system'&&isDark))?'dark':'light';}catch(e){}})();`;
}

export function ThemeScript({
  themeStorageKey = DEFAULT_THEME_STORAGE_KEY,
  modeStorageKey = DEFAULT_MODE_STORAGE_KEY,
  defaultTheme = DEFAULT_THEME,
  defaultMode = DEFAULT_COLOR_MODE,
  nonce,
}: ThemeScriptOptions): React.JSX.Element {
  const scriptContent = getThemeScript({
    themeStorageKey,
    modeStorageKey,
    defaultTheme,
    defaultMode,
  });

  return (
    <script
      nonce={nonce}
      dangerouslySetInnerHTML={{ __html: scriptContent }}
      suppressHydrationWarning
    />
  );
}
