import { createThemeSeed, applyThemeSeed } from './index.js';

export const darkTheme = createThemeSeed({
  primary: '#3b82f6',
  chromaScale: 1,
  contrastScale: 1,
});

export function applyDarkGlobalTheme(selector = '[data-theme="dark"]') {
  return applyThemeSeed(selector, {
    primary: '#3b82f6',
    chromaScale: 1,
    contrastScale: 1,
  });
}
