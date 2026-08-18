import { createTheme, createGlobalTheme } from '@cumulo/css';
import { themeContract } from '../contract.js';
import { lightThemeValues } from './light.js';
import { defaultColorTokens } from '../tokens/index.js';

export const darkThemeValues = {
  ...lightThemeValues,
  color: {
    ...lightThemeValues.color,
    bg: '#090d16',
    bgSubtle: '#0f172a',
    bgSurface: '#141e33',
    bgElevated: '#1a2744',
    bgOverlay: 'rgba(2, 6, 23, 0.8)',

    fg: '#f8fafc',
    fgMuted: '#94a3b8',
    fgSubtle: '#64748b',
    fgInverted: '#0f172a',

    border: '#1e293b',
    borderMuted: '#141e33',
    borderFocus: defaultColorTokens.brand[400],

    primary: defaultColorTokens.brand[500],
    primaryHover: defaultColorTokens.brand[400],
    primaryActive: defaultColorTokens.brand[300],
    primaryFg: '#ffffff',
    primarySubtle: 'rgba(99, 102, 241, 0.15)',

    secondary: '#1e293b',
    secondaryHover: '#334155',
    secondaryFg: '#f1f5f9',

    success: '#22c55e',
    successSubtle: 'rgba(34, 197, 94, 0.15)',
    warning: '#f59e0b',
    warningSubtle: 'rgba(245, 158, 11, 0.15)',
    danger: '#f43f5e',
    dangerSubtle: 'rgba(244, 63, 94, 0.15)',
    info: '#38bdf8',
    infoSubtle: 'rgba(56, 189, 248, 0.15)',
  },
  shadow: {
    ...lightThemeValues.shadow,
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.5)',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.6), 0 1px 2px -1px rgba(0, 0, 0, 0.6)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.6), 0 2px 4px -2px rgba(0, 0, 0, 0.6)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.7), 0 4px 6px -4px rgba(0, 0, 0, 0.7)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.8), 0 8px 10px -6px rgba(0, 0, 0, 0.8)',
    glow: '0 0 20px rgba(129, 140, 248, 0.3)',
  },
};

export const darkTheme = createTheme(themeContract, darkThemeValues);

export function applyDarkGlobalTheme(selector = '[data-theme="dark"]') {
  return createGlobalTheme(selector, themeContract, darkThemeValues);
}
