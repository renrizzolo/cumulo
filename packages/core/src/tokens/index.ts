import type { vars } from '../contract.js';

export * from './colors.js';
export * from './space.js';
export * from './radii.js';
export * from './typography.js';
export * from './shadows.js';
export * from './themeTokens.js';

export type ThemeVars = typeof vars;

export type VarPath<T = typeof vars, Prefix extends string = 'vars'> = T extends string
  ? Prefix
  : {
      [K in keyof T & string]: T[K] extends string
        ? K extends `${number}${string}`
          ? `${Prefix}["${K}"]`
          : `${Prefix}.${K}`
        : K extends `${number}${string}`
          ? VarPath<T[K], `${Prefix}["${K}"]`>
          : VarPath<T[K], `${Prefix}.${K}`>;
    }[keyof T & string];
