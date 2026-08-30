import { createThemeContract, createTheme, createGlobalTheme } from '@cumulo/css';

export const themeContract = createThemeContract({
  color: {
    bg: null,
    text: null,
    accent: null,
    border: null,
  },
  spacing: {
    sm: null,
    md: null,
    lg: null,
  },
  radius: {
    sm: null,
    md: null,
    pill: null,
  },
});

createGlobalTheme(':root', themeContract, {
  color: {
    bg: '#ffffff',
    text: '#111827',
    accent: '#3b82f6',
    border: '#e5e7eb',
  },
  spacing: {
    sm: '8px',
    md: '16px',
    lg: '24px',
  },
  radius: {
    sm: '4px',
    md: '8px',
    pill: '9999px',
  },
});

export const darkTheme = createTheme(themeContract, {
  color: {
    bg: '#18181b',
    text: '#fafafa',
    accent: '#60a5fa',
    border: '#27272a',
  },
  spacing: {
    sm: '8px',
    md: '16px',
    lg: '24px',
  },
  radius: {
    sm: '4px',
    md: '8px',
    pill: '9999px',
  },
});
