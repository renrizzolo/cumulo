'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { RouterProvider } from '@renr/parcel-rsc-router';
import { flatRoutes } from '../routes';

export type Theme = 'light' | 'dark' | 'cloud';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  setTheme: () => {},
});

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <RouterProvider routes={flatRoutes}>
      <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
    </RouterProvider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
