import { createTheme, createGlobalTheme } from '@cumulo/css';
import { themeContract } from '../contract.js';
import { lightThemeValues } from './light.js';

export const cloudThemeValues = {
  ...lightThemeValues,
  color: {
    ...lightThemeValues.color,
    bg: '#f0f4f8',
    bgSubtle: '#e2e8f0',
    bgSurface: 'rgba(255, 255, 255, 0.85)',
    bgElevated: 'rgba(255, 255, 255, 0.95)',
    bgOverlay: 'rgba(30, 41, 59, 0.5)',

    fg: '#1e293b',
    fgMuted: '#475569',
    fgSubtle: '#64748b',

    border: 'rgba(203, 213, 225, 0.7)',
    borderMuted: 'rgba(226, 232, 240, 0.7)',
    borderFocus: '#6366f1',

    primary: '#4f46e5',
    primaryHover: '#4338ca',
    primaryActive: '#3730a3',
    primaryFg: '#ffffff',
    primarySubtle: 'rgba(99, 102, 241, 0.1)',
  },
  shadow: {
    ...lightThemeValues.shadow,
    sm: '0 2px 8px -2px rgba(99, 102, 241, 0.08), 0 1px 4px -1px rgba(0, 0, 0, 0.04)',
    md: '0 8px 20px -4px rgba(99, 102, 241, 0.12), 0 4px 8px -2px rgba(0, 0, 0, 0.05)',
    lg: '0 16px 32px -6px rgba(99, 102, 241, 0.16), 0 8px 16px -4px rgba(0, 0, 0, 0.06)',
    glow: '0 0 25px rgba(99, 102, 241, 0.25)',
  },
};

export const cloudTheme = createTheme(themeContract, cloudThemeValues);

export function applyCloudGlobalTheme(selector = '[data-theme="cloud"]') {
  return createGlobalTheme(selector, themeContract, cloudThemeValues);
}
