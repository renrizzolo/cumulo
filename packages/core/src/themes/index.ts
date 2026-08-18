import { createGlobalStyles } from '@cumulo/css';

export interface ThemeSeedOptions {
  primary?: string;
  success?: string;
  warning?: string;
  error?: string;
  info?: string;
  grey?: string;
  chromaScale?: number;
  contrastScale?: number;
}

export function createThemeSeed(seeds: ThemeSeedOptions) {
  const vars: Record<string, string> = {};
  if (seeds.primary) vars['--color-primary-base'] = seeds.primary;
  if (seeds.success) vars['--color-success-base'] = seeds.success;
  if (seeds.warning) vars['--color-warning-base'] = seeds.warning;
  if (seeds.error) vars['--color-error-base'] = seeds.error;
  if (seeds.info) vars['--color-info-base'] = seeds.info;
  if (seeds.grey) vars['--color-grey-base'] = seeds.grey;
  if (seeds.chromaScale !== undefined) vars['--theme-chroma-scale'] = String(seeds.chromaScale);
  if (seeds.contrastScale !== undefined)
    vars['--theme-contrast-scale'] = String(seeds.contrastScale);

  return {
    vars,
    cssBody: Object.entries(vars)
      .map(([k, v]) => `${k}:${v};`)
      .join(''),
  };
}

export function applyThemeSeed(selector: string, seeds: ThemeSeedOptions) {
  const { vars: seedVars } = createThemeSeed(seeds);
  return createGlobalStyles(selector, seedVars);
}

export * from './light.js';
export * from './dark.js';
export * from './cloud.js';
