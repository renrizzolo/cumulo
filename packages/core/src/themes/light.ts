import { createThemeSeed, applyThemeSeed } from './index.js';

export const lightTheme = createThemeSeed({
  primary: '#2563eb',
  success: '#009b50',
  warning: '#e79212',
  error: '#d10d27',
  info: '#0284c7',
  grey: '#96938e',
});

export function applyLightGlobalTheme(selector = ':root') {
  return applyThemeSeed(selector, {
    primary: '#2563eb',
    success: '#009b50',
    warning: '#e79212',
    error: '#d10d27',
    info: '#0284c7',
    grey: '#96938e',
  });
}
