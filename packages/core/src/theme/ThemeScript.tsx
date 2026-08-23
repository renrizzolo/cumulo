import React from 'react';
import { DEFAULT_THEME_STORAGE_KEY, DEFAULT_THEME, type Theme } from './theme.js';

export interface ThemeScriptOptions {
  storageKey?: string;
  defaultTheme?: Theme;
  nonce?: string;
}

// prevent FOUC by setting the theme before React renders
export function getThemeScript(options: ThemeScriptOptions = {}): string {
  const storageKey = options.storageKey ?? DEFAULT_THEME_STORAGE_KEY;
  const defaultTheme = options.defaultTheme ?? DEFAULT_THEME;

  return `(function(){try{var k=${JSON.stringify(storageKey)},d=${JSON.stringify(
    defaultTheme,
  )},s=localStorage.getItem(k),t=(s==='light'||s==='dark'||s==='system')?s:d,m=window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.style.colorScheme=(t==='dark'||(t==='system'&&m))?'dark':'light';}catch(e){}})();`;
}

export function ThemeScript({
  storageKey = DEFAULT_THEME_STORAGE_KEY,
  defaultTheme = DEFAULT_THEME,
  nonce,
}: ThemeScriptOptions): React.JSX.Element {
  const scriptContent = getThemeScript({ storageKey, defaultTheme });

  return (
    <script
      nonce={nonce}
      dangerouslySetInnerHTML={{ __html: scriptContent }}
      suppressHydrationWarning
    />
  );
}
