import { createThemeSeed, applyThemeSeed } from './index.js';

export const cloudTheme = createThemeSeed({
  primary: '#6366f1',
  grey: '#64748b',
  chromaScale: 0.85,
  contrastScale: 0.95,
});

export function applyCloudGlobalTheme(selector = '[data-theme="cloud"]') {
  return applyThemeSeed(selector, {
    primary: '#6366f1',
    grey: '#64748b',
    chromaScale: 0.85,
    contrastScale: 0.95,
  });
}
