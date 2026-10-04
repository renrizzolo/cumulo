// Auto-generated from theme.css by @cumulo/core theme generator

import { type themeVars } from './tokens/themeTokens.js';

export const vars = {
  shadow: {
    /** 0 1px 3px 0 var(--shadow-color) */
    '0': 'var(--theme-shadow-0)',
    /** 0 4px 6px -1px var(--shadow-color), 0 2px 4px -2px var(--shadow-color) */
    '1': 'var(--theme-shadow-1)',
    /** 0 10px 15px -3px var(--shadow-color), 0 4px 6px -4px var(--shadow-color) */
    '2': 'var(--theme-shadow-2)',
    /** light-dark(rgb(0 0 0 / 0.07), rgb(0 0 0 / 0.5)) */
    color: 'var(--shadow-color)',
  },
  radius: {
    /** 0px */
    none: 'var(--theme-radius-none)',
    /** 0.375rem */
    control: 'var(--theme-radius-control)',
    /** 0.375rem */
    md: 'var(--theme-radius-md)',
    /** 0.5rem */
    lg: 'var(--theme-radius-lg)',
    /** 0.75rem */
    xl: 'var(--theme-radius-xl)',
    /** 1rem */
    '2xl': 'var(--theme-radius-2xl)',
    /** 9999px */
    full: 'var(--theme-radius-full)',
  },
  size: {
    /** 0.75rem */
    '4xs': 'var(--theme-size-4xs)',
    /** 1rem */
    '3xs': 'var(--theme-size-3xs)',
    /** 1.25rem */
    '2xs': 'var(--theme-size-2xs)',
    /** 1.5rem */
    xs: 'var(--theme-size-xs)',
    /** 2rem */
    sm: 'var(--theme-size-sm)',
    /** 2.5rem */
    md: 'var(--theme-size-md)',
    /** 3rem */
    lg: 'var(--theme-size-lg)',
    /** 3.5rem */
    xl: 'var(--theme-size-xl)',
  },
  container: {
    /** 640px */
    sm: 'var(--theme-container-sm)',
    /** 768px */
    md: 'var(--theme-container-md)',
    /** 1024px */
    lg: 'var(--theme-container-lg)',
    /** 1280px */
    xl: 'var(--theme-container-xl)',
  },
  spacing: {
    /** 0px */
    none: 'var(--theme-spacing-none)',
    /** 0.125rem */
    '3xs': 'var(--theme-spacing-3xs)',
    /** 0.25rem */
    '2xs': 'var(--theme-spacing-2xs)',
    /** 0.5rem */
    xs: 'var(--theme-spacing-xs)',
    /** 0.75rem */
    sm: 'var(--theme-spacing-sm)',
    /** 1rem */
    md: 'var(--theme-spacing-md)',
    /** 1.5rem */
    lg: 'var(--theme-spacing-lg)',
    /** 2rem */
    xl: 'var(--theme-spacing-xl)',
    /** 3rem */
    '2xl': 'var(--theme-spacing-2xl)',
  },
  duration: {
    /** 55ms */
    snappy: 'var(--theme-duration-snappy)',
    /** 125ms */
    fast: 'var(--theme-duration-fast)',
    /** 235ms */
    normal: 'var(--theme-duration-normal)',
    /** 400ms */
    slow: 'var(--theme-duration-slow)',
  },
  ease: {
    /** cubic-bezier(0.4, 0, 0.2, 1) */
    default: 'var(--theme-ease-default)',
  },
  font: {
    /** system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif */
    sans: 'var(--theme-font-sans)',
    /** ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace */
    mono: 'var(--theme-font-mono)',
    size: {
      /** 0.6875rem */
      '2xs': 'var(--theme-font-size-2xs)',
      /** 0.75rem */
      xs: 'var(--theme-font-size-xs)',
      /** 0.875rem */
      sm: 'var(--theme-font-size-sm)',
      /** 1rem */
      base: 'var(--theme-font-size-base)',
      /** 1.125rem */
      md: 'var(--theme-font-size-md)',
      /** 1.25rem */
      lg: 'var(--theme-font-size-lg)',
      /** 1.5rem */
      xl: 'var(--theme-font-size-xl)',
      /** 1.875rem */
      '2xl': 'var(--theme-font-size-2xl)',
      /** 2.25rem */
      '3xl': 'var(--theme-font-size-3xl)',
      /** 3rem */
      '4xl': 'var(--theme-font-size-4xl)',
    },
    weight: {
      /** 400 */
      normal: 'var(--theme-font-weight-normal)',
      /** 500 */
      medium: 'var(--theme-font-weight-medium)',
      /** 600 */
      semibold: 'var(--theme-font-weight-semibold)',
      /** 700 */
      bold: 'var(--theme-font-weight-bold)',
    },
  },
  line: {
    height: {
      /** 1 */
      none: 'var(--theme-line-height-none)',
      /** 1.25 */
      tight: 'var(--theme-line-height-tight)',
      /** 1.4 */
      normal: 'var(--theme-line-height-normal)',
      /** 1.65 */
      relaxed: 'var(--theme-line-height-relaxed)',
    },
  },
  bg: {
    /** light-dark(#ffffff, #030712) */
    '0': 'var(--theme-bg-0)',
    /** light-dark( color-mix(in oklch, var(--theme-bg-0), black 1.2%), color-mix(in oklch, var(--theme-bg-0), white 8%) ) */
    '1': 'var(--theme-bg-1)',
    /** light-dark( color-mix(in oklch, var(--theme-bg-0), black 3.5%), color-mix(in oklch, var(--theme-bg-0), white 12%) ) */
    '2': 'var(--theme-bg-2)',
    /** light-dark( color-mix(in oklch, var(--theme-bg-0), black 10%), color-mix(in oklch, var(--theme-bg-0), white 23%) ) */
    '3': 'var(--theme-bg-3)',
    /** light-dark( color-mix(in oklch, var(--theme-bg-0), black 14%), color-mix(in oklch, var(--theme-bg-0), white 30%) ) */
    '4': 'var(--theme-bg-4)',
  },
  /** light-dark(#0f172a, #f8fafc) */
  fg: 'var(--theme-fg)',
  /** var(--theme-grey-700) */
  muted: 'var(--theme-muted)',
  /** var(--theme-grey-500) */
  subtle: 'var(--theme-subtle)',
  /** light-dark( color-mix(in oklch, var(--theme-bg-0), black 12%), color-mix(in oklch, var(--theme-bg-0), white 17%) ) */
  border: 'var(--theme-border)',
  seed: {
    /** #2563eb */
    primary: 'var(--color-primary-base)',
    /** #009b50 */
    success: 'var(--color-success-base)',
    /** #e79212 */
    warning: 'var(--color-warning-base)',
    /** #d10d27 */
    error: 'var(--color-error-base)',
    /** #0284c7 */
    info: 'var(--color-info-base)',
    /** #96938e */
    grey: 'var(--color-grey-base)',
  },
  chroma: {
    /** 1 */
    scale: 'var(--theme-chroma-scale)',
  },
  contrast: {
    /** 1 */
    scale: 'var(--theme-contrast-scale)',
  },
  lightness: {
    /** 0 */
    offset: 'var(--theme-lightness-offset)',
  },
  step: {
    '50': {
      /** 0.04 */
      t: 'var(--theme-step-50-t)',
      l: {
        /** calc( clamp( 0.02, 0.98 - (0.8 * var(--theme-step-50-t) * var(--theme-contrast-scale)) + var(--theme-lightness-offset, 0), 0.98 ) ) */
        light: 'var(--theme-step-50-l-light)',
        /** calc( clamp( 0.02, 0.12 + (0.8 * var(--theme-step-50-t) * var(--theme-contrast-scale)) + var(--theme-lightness-offset, 0), 0.98 ) ) */
        dark: 'var(--theme-step-50-l-dark)',
      },
      /** calc(sin(var(--theme-step-50-t) * pi) * var(--theme-chroma-scale)) */
      c: 'var(--theme-step-50-c)',
      /** 12 */
      h: 'var(--theme-step-50-h)',
    },
    '100': {
      /** 0.08 */
      t: 'var(--theme-step-100-t)',
      l: {
        /** calc( clamp( 0.02, 0.98 - (0.8 * var(--theme-step-100-t) * var(--theme-contrast-scale)) + var(--theme-lightness-offset, 0), 0.98 ) ) */
        light: 'var(--theme-step-100-l-light)',
        /** calc( clamp( 0.02, 0.12 + (0.8 * var(--theme-step-100-t) * var(--theme-contrast-scale)) + var(--theme-lightness-offset, 0), 0.98 ) ) */
        dark: 'var(--theme-step-100-l-dark)',
      },
      /** calc(sin(var(--theme-step-100-t) * pi) * var(--theme-chroma-scale)) */
      c: 'var(--theme-step-100-c)',
      /** 8 */
      h: 'var(--theme-step-100-h)',
    },
    '200': {
      /** 0.16 */
      t: 'var(--theme-step-200-t)',
      l: {
        /** calc( clamp( 0.02, 0.98 - (0.8 * var(--theme-step-200-t) * var(--theme-contrast-scale)) + var(--theme-lightness-offset, 0), 0.98 ) ) */
        light: 'var(--theme-step-200-l-light)',
        /** calc( clamp( 0.02, 0.12 + (0.8 * var(--theme-step-200-t) * var(--theme-contrast-scale)) + var(--theme-lightness-offset, 0), 0.98 ) ) */
        dark: 'var(--theme-step-200-l-dark)',
      },
      /** calc(sin(var(--theme-step-200-t) * pi) * var(--theme-chroma-scale)) */
      c: 'var(--theme-step-200-c)',
      /** 4 */
      h: 'var(--theme-step-200-h)',
    },
    '300': {
      /** 0.28 */
      t: 'var(--theme-step-300-t)',
      l: {
        /** calc( clamp( 0.02, 0.98 - (0.8 * var(--theme-step-300-t) * var(--theme-contrast-scale)) + var(--theme-lightness-offset, 0), 0.98 ) ) */
        light: 'var(--theme-step-300-l-light)',
        /** calc( clamp( 0.02, 0.12 + (0.8 * var(--theme-step-300-t) * var(--theme-contrast-scale)) + var(--theme-lightness-offset, 0), 0.98 ) ) */
        dark: 'var(--theme-step-300-l-dark)',
      },
      /** calc(sin(var(--theme-step-300-t) * pi) * var(--theme-chroma-scale)) */
      c: 'var(--theme-step-300-c)',
      /** 0 */
      h: 'var(--theme-step-300-h)',
    },
    '400': {
      /** 0.4 */
      t: 'var(--theme-step-400-t)',
      l: {
        /** calc( clamp( 0.02, 0.98 - (0.8 * var(--theme-step-400-t) * var(--theme-contrast-scale)) + var(--theme-lightness-offset, 0), 0.98 ) ) */
        light: 'var(--theme-step-400-l-light)',
        /** calc( clamp( 0.02, 0.12 + (0.8 * var(--theme-step-400-t) * var(--theme-contrast-scale)) + var(--theme-lightness-offset, 0), 0.98 ) ) */
        dark: 'var(--theme-step-400-l-dark)',
      },
      /** calc(sin(var(--theme-step-400-t) * pi) * var(--theme-chroma-scale)) */
      c: 'var(--theme-step-400-c)',
      /** 0 */
      h: 'var(--theme-step-400-h)',
    },
    '500': {
      /** 0.55 */
      t: 'var(--theme-step-500-t)',
      l: {
        /** calc( clamp( 0.02, 0.98 - (0.8 * var(--theme-step-500-t) * var(--theme-contrast-scale)) + var(--theme-lightness-offset, 0), 0.98 ) ) */
        light: 'var(--theme-step-500-l-light)',
        /** calc( clamp( 0.02, 0.12 + (0.8 * var(--theme-step-500-t) * var(--theme-contrast-scale)) + var(--theme-lightness-offset, 0), 0.98 ) ) */
        dark: 'var(--theme-step-500-l-dark)',
      },
      /** calc(sin(var(--theme-step-500-t) * pi) * var(--theme-chroma-scale)) */
      c: 'var(--theme-step-500-c)',
      /** 0 */
      h: 'var(--theme-step-500-h)',
    },
    '600': {
      /** 0.65 */
      t: 'var(--theme-step-600-t)',
      l: {
        /** calc( clamp( 0.02, 0.98 - (0.8 * var(--theme-step-600-t) * var(--theme-contrast-scale)) + var(--theme-lightness-offset, 0), 0.98 ) ) */
        light: 'var(--theme-step-600-l-light)',
        /** calc( clamp( 0.02, 0.12 + (0.8 * var(--theme-step-600-t) * var(--theme-contrast-scale)) + var(--theme-lightness-offset, 0), 0.98 ) ) */
        dark: 'var(--theme-step-600-l-dark)',
      },
      /** calc(sin(var(--theme-step-600-t) * pi) * var(--theme-chroma-scale)) */
      c: 'var(--theme-step-600-c)',
      /** 0 */
      h: 'var(--theme-step-600-h)',
    },
    '700': {
      /** 0.78 */
      t: 'var(--theme-step-700-t)',
      l: {
        /** calc( clamp( 0.02, 0.98 - (0.8 * var(--theme-step-700-t) * var(--theme-contrast-scale)) + var(--theme-lightness-offset, 0), 0.98 ) ) */
        light: 'var(--theme-step-700-l-light)',
        /** calc( clamp( 0.02, 0.12 + (0.8 * var(--theme-step-700-t) * var(--theme-contrast-scale)) + var(--theme-lightness-offset, 0), 0.98 ) ) */
        dark: 'var(--theme-step-700-l-dark)',
      },
      /** calc(sin(var(--theme-step-700-t) * pi) * var(--theme-chroma-scale)) */
      c: 'var(--theme-step-700-c)',
      /** -4 */
      h: 'var(--theme-step-700-h)',
    },
    '800': {
      /** 0.88 */
      t: 'var(--theme-step-800-t)',
      l: {
        /** calc( clamp( 0.02, 0.98 - (0.8 * var(--theme-step-800-t) * var(--theme-contrast-scale)) + var(--theme-lightness-offset, 0), 0.98 ) ) */
        light: 'var(--theme-step-800-l-light)',
        /** calc( clamp( 0.02, 0.12 + (0.8 * var(--theme-step-800-t) * var(--theme-contrast-scale)) + var(--theme-lightness-offset, 0), 0.98 ) ) */
        dark: 'var(--theme-step-800-l-dark)',
      },
      /** calc(sin(var(--theme-step-800-t) * pi) * var(--theme-chroma-scale)) */
      c: 'var(--theme-step-800-c)',
      /** -8 */
      h: 'var(--theme-step-800-h)',
    },
    '900': {
      /** 0.95 */
      t: 'var(--theme-step-900-t)',
      l: {
        /** calc( clamp( 0.02, 0.98 - (0.8 * var(--theme-step-900-t) * var(--theme-contrast-scale)) + var(--theme-lightness-offset, 0), 0.98 ) ) */
        light: 'var(--theme-step-900-l-light)',
        /** calc( clamp( 0.02, 0.12 + (0.8 * var(--theme-step-900-t) * var(--theme-contrast-scale)) + var(--theme-lightness-offset, 0), 0.98 ) ) */
        dark: 'var(--theme-step-900-l-dark)',
      },
      /** calc(sin(var(--theme-step-900-t) * pi) * var(--theme-chroma-scale)) */
      c: 'var(--theme-step-900-c)',
      /** -12 */
      h: 'var(--theme-step-900-h)',
    },
  },
  primary: {
    /** light-dark( oklch( from var(--color-primary-base) var(--theme-step-50-l-light) calc(c * var(--theme-step-50-c)) calc(h + var(--theme-step-50-h)) ), oklch( from var(--color-primary-base) var(--theme-step-50-l-dark) calc(c * var(--theme-step-50-c)) calc(h + var(--theme-step-50-h)) ) ) */
    '50': 'var(--theme-primary-50)',
    /** light-dark( oklch( from var(--color-primary-base) var(--theme-step-100-l-light) calc(c * var(--theme-step-100-c)) calc(h + var(--theme-step-100-h)) ), oklch( from var(--color-primary-base) var(--theme-step-100-l-dark) calc(c * var(--theme-step-100-c)) calc(h + var(--theme-step-100-h)) ) ) */
    '100': 'var(--theme-primary-100)',
    /** light-dark( oklch( from var(--color-primary-base) var(--theme-step-200-l-light) calc(c * var(--theme-step-200-c)) calc(h + var(--theme-step-200-h)) ), oklch( from var(--color-primary-base) var(--theme-step-200-l-dark) calc(c * var(--theme-step-200-c)) calc(h + var(--theme-step-200-h)) ) ) */
    '200': 'var(--theme-primary-200)',
    /** light-dark( oklch( from var(--color-primary-base) var(--theme-step-300-l-light) calc(c * var(--theme-step-300-c)) calc(h + var(--theme-step-300-h)) ), oklch( from var(--color-primary-base) var(--theme-step-300-l-dark) calc(c * var(--theme-step-300-c)) calc(h + var(--theme-step-300-h)) ) ) */
    '300': 'var(--theme-primary-300)',
    /** light-dark( oklch( from var(--color-primary-base) var(--theme-step-400-l-light) calc(c * var(--theme-step-400-c)) calc(h + var(--theme-step-400-h)) ), oklch( from var(--color-primary-base) var(--theme-step-400-l-dark) calc(c * var(--theme-step-400-c)) calc(h + var(--theme-step-400-h)) ) ) */
    '400': 'var(--theme-primary-400)',
    /** light-dark( oklch( from var(--color-primary-base) var(--theme-step-500-l-light) calc(c * var(--theme-step-500-c)) calc(h + var(--theme-step-500-h)) ), oklch( from var(--color-primary-base) var(--theme-step-500-l-dark) calc(c * var(--theme-step-500-c)) calc(h + var(--theme-step-500-h)) ) ) */
    '500': 'var(--theme-primary-500)',
    /** light-dark( oklch( from var(--color-primary-base) var(--theme-step-600-l-light) calc(c * var(--theme-step-600-c)) calc(h + var(--theme-step-600-h)) ), oklch( from var(--color-primary-base) var(--theme-step-600-l-dark) calc(c * var(--theme-step-600-c)) calc(h + var(--theme-step-600-h)) ) ) */
    '600': 'var(--theme-primary-600)',
    /** light-dark( oklch( from var(--color-primary-base) var(--theme-step-700-l-light) calc(c * var(--theme-step-700-c)) calc(h + var(--theme-step-700-h)) ), oklch( from var(--color-primary-base) var(--theme-step-700-l-dark) calc(c * var(--theme-step-700-c)) calc(h + var(--theme-step-700-h)) ) ) */
    '700': 'var(--theme-primary-700)',
    /** light-dark( oklch( from var(--color-primary-base) var(--theme-step-800-l-light) calc(c * var(--theme-step-800-c)) calc(h + var(--theme-step-800-h)) ), oklch( from var(--color-primary-base) var(--theme-step-800-l-dark) calc(c * var(--theme-step-800-c)) calc(h + var(--theme-step-800-h)) ) ) */
    '800': 'var(--theme-primary-800)',
    /** light-dark( oklch( from var(--color-primary-base) var(--theme-step-900-l-light) calc(c * var(--theme-step-900-c)) calc(h + var(--theme-step-900-h)) ), oklch( from var(--color-primary-base) var(--theme-step-900-l-dark) calc(c * var(--theme-step-900-c)) calc(h + var(--theme-step-900-h)) ) ) */
    '900': 'var(--theme-primary-900)',
    /** var(--theme-primary-600) */
    DEFAULT: 'var(--theme-primary)',
    /** var(--theme-primary-700) */
    hover: 'var(--theme-primary-hover)',
    /** light-dark(var(--theme-primary-300), var(--theme-primary-400)) */
    focus: 'var(--theme-primary-focus)',
    /** var(--theme-primary-200) */
    border: 'var(--theme-primary-border)',
    /** var(--color-white) */
    fg: 'var(--theme-primary-fg)',
    /** var(--theme-primary-50) */
    subtle: 'var(--theme-primary-subtle)',
  },
  success: {
    /** light-dark( oklch( from var(--color-success-base) var(--theme-step-50-l-light) calc(c * var(--theme-step-50-c)) calc(h - var(--theme-step-50-h)) ), oklch( from var(--color-success-base) var(--theme-step-50-l-dark) calc(c * var(--theme-step-50-c)) calc(h - var(--theme-step-50-h)) ) ) */
    '50': 'var(--theme-success-50)',
    /** light-dark( oklch( from var(--color-success-base) var(--theme-step-100-l-light) calc(c * var(--theme-step-100-c)) calc(h - var(--theme-step-100-h)) ), oklch( from var(--color-success-base) var(--theme-step-100-l-dark) calc(c * var(--theme-step-100-c)) calc(h - var(--theme-step-100-h)) ) ) */
    '100': 'var(--theme-success-100)',
    /** light-dark( oklch( from var(--color-success-base) var(--theme-step-200-l-light) calc(c * var(--theme-step-200-c)) calc(h - var(--theme-step-200-h)) ), oklch( from var(--color-success-base) var(--theme-step-200-l-dark) calc(c * var(--theme-step-200-c)) calc(h - var(--theme-step-200-h)) ) ) */
    '200': 'var(--theme-success-200)',
    /** light-dark( oklch( from var(--color-success-base) var(--theme-step-300-l-light) calc(c * var(--theme-step-300-c)) calc(h - var(--theme-step-300-h)) ), oklch( from var(--color-success-base) var(--theme-step-300-l-dark) calc(c * var(--theme-step-300-c)) calc(h - var(--theme-step-300-h)) ) ) */
    '300': 'var(--theme-success-300)',
    /** light-dark( oklch( from var(--color-success-base) var(--theme-step-400-l-light) calc(c * var(--theme-step-400-c)) calc(h - var(--theme-step-400-h)) ), oklch( from var(--color-success-base) var(--theme-step-400-l-dark) calc(c * var(--theme-step-400-c)) calc(h - var(--theme-step-400-h)) ) ) */
    '400': 'var(--theme-success-400)',
    /** light-dark( oklch( from var(--color-success-base) var(--theme-step-500-l-light) calc(c * var(--theme-step-500-c)) calc(h - var(--theme-step-500-h)) ), oklch( from var(--color-success-base) var(--theme-step-500-l-dark) calc(c * var(--theme-step-500-c)) calc(h - var(--theme-step-500-h)) ) ) */
    '500': 'var(--theme-success-500)',
    /** light-dark( oklch( from var(--color-success-base) var(--theme-step-600-l-light) calc(c * var(--theme-step-600-c)) calc(h - var(--theme-step-600-h)) ), oklch( from var(--color-success-base) var(--theme-step-600-l-dark) calc(c * var(--theme-step-600-c)) calc(h - var(--theme-step-600-h)) ) ) */
    '600': 'var(--theme-success-600)',
    /** light-dark( oklch( from var(--color-success-base) var(--theme-step-700-l-light) calc(c * var(--theme-step-700-c)) calc(h - var(--theme-step-700-h)) ), oklch( from var(--color-success-base) var(--theme-step-700-l-dark) calc(c * var(--theme-step-700-c)) calc(h - var(--theme-step-700-h)) ) ) */
    '700': 'var(--theme-success-700)',
    /** light-dark( oklch( from var(--color-success-base) var(--theme-step-800-l-light) calc(c * var(--theme-step-800-c)) calc(h - var(--theme-step-800-h)) ), oklch( from var(--color-success-base) var(--theme-step-800-l-dark) calc(c * var(--theme-step-800-c)) calc(h - var(--theme-step-800-h)) ) ) */
    '800': 'var(--theme-success-800)',
    /** light-dark( oklch( from var(--color-success-base) var(--theme-step-900-l-light) calc(c * var(--theme-step-900-c)) calc(h - var(--theme-step-900-h)) ), oklch( from var(--color-success-base) var(--theme-step-900-l-dark) calc(c * var(--theme-step-900-c)) calc(h - var(--theme-step-900-h)) ) ) */
    '900': 'var(--theme-success-900)',
    /** var(--theme-success-600) */
    bg: 'var(--theme-success-bg)',
    /** var(--theme-success-700) */
    hover: 'var(--theme-success-hover)',
    /** #ffffff */
    fg: 'var(--theme-success-fg)',
    secondary: {
      bg: {
        /** var(--theme-success-50) */
        DEFAULT: 'var(--theme-success-secondary-bg)',
        /** light-dark( var(--theme-success-100), var(--theme-success-200) ) */
        hover: 'var(--theme-success-secondary-bg-hover)',
      },
      /** var(--theme-success-700) */
      fg: 'var(--theme-success-secondary-fg)',
      /** light-dark( var(--theme-success-200), var(--theme-success-300) ) */
      border: 'var(--theme-success-secondary-border)',
    },
  },
  warning: {
    /** light-dark( oklch( from var(--color-warning-base) var(--theme-step-50-l-light) calc(c * var(--theme-step-50-c)) calc(h + var(--theme-step-50-h)) ), oklch( from var(--color-warning-base) var(--theme-step-50-l-dark) calc(c * var(--theme-step-50-c)) calc(h + var(--theme-step-50-h)) ) ) */
    '50': 'var(--theme-warning-50)',
    /** light-dark( oklch( from var(--color-warning-base) var(--theme-step-100-l-light) calc(c * var(--theme-step-100-c)) calc(h + var(--theme-step-100-h)) ), oklch( from var(--color-warning-base) var(--theme-step-100-l-dark) calc(c * var(--theme-step-100-c)) calc(h + var(--theme-step-100-h)) ) ) */
    '100': 'var(--theme-warning-100)',
    /** light-dark( oklch( from var(--color-warning-base) var(--theme-step-200-l-light) calc(c * var(--theme-step-200-c)) calc(h + var(--theme-step-200-h)) ), oklch( from var(--color-warning-base) var(--theme-step-200-l-dark) calc(c * var(--theme-step-200-c)) calc(h + var(--theme-step-200-h)) ) ) */
    '200': 'var(--theme-warning-200)',
    /** light-dark( oklch( from var(--color-warning-base) var(--theme-step-300-l-light) calc(c * var(--theme-step-300-c)) calc(h + var(--theme-step-300-h)) ), oklch( from var(--color-warning-base) var(--theme-step-300-l-dark) calc(c * var(--theme-step-300-c)) calc(h + var(--theme-step-300-h)) ) ) */
    '300': 'var(--theme-warning-300)',
    /** light-dark( oklch( from var(--color-warning-base) var(--theme-step-400-l-light) calc(c * var(--theme-step-400-c)) calc(h + var(--theme-step-400-h)) ), oklch( from var(--color-warning-base) var(--theme-step-400-l-dark) calc(c * var(--theme-step-400-c)) calc(h + var(--theme-step-400-h)) ) ) */
    '400': 'var(--theme-warning-400)',
    /** light-dark( oklch( from var(--color-warning-base) var(--theme-step-500-l-light) calc(c * var(--theme-step-500-c)) calc(h + var(--theme-step-500-h)) ), oklch( from var(--color-warning-base) var(--theme-step-500-l-dark) calc(c * var(--theme-step-500-c)) calc(h + var(--theme-step-500-h)) ) ) */
    '500': 'var(--theme-warning-500)',
    /** light-dark( oklch( from var(--color-warning-base) var(--theme-step-600-l-light) calc(c * var(--theme-step-600-c)) calc(h + var(--theme-step-600-h)) ), oklch( from var(--color-warning-base) var(--theme-step-600-l-dark) calc(c * var(--theme-step-600-c)) calc(h + var(--theme-step-600-h)) ) ) */
    '600': 'var(--theme-warning-600)',
    /** light-dark( oklch( from var(--color-warning-base) var(--theme-step-700-l-light) calc(c * var(--theme-step-700-c)) calc(h + var(--theme-step-700-h)) ), oklch( from var(--color-warning-base) var(--theme-step-700-l-dark) calc(c * var(--theme-step-700-c)) calc(h + var(--theme-step-700-h)) ) ) */
    '700': 'var(--theme-warning-700)',
    /** light-dark( oklch( from var(--color-warning-base) var(--theme-step-800-l-light) calc(c * var(--theme-step-800-c)) calc(h + var(--theme-step-800-h)) ), oklch( from var(--color-warning-base) var(--theme-step-800-l-dark) calc(c * var(--theme-step-800-c)) calc(h + var(--theme-step-800-h)) ) ) */
    '800': 'var(--theme-warning-800)',
    /** light-dark( oklch( from var(--color-warning-base) var(--theme-step-900-l-light) calc(c * var(--theme-step-900-c)) calc(h + var(--theme-step-900-h)) ), oklch( from var(--color-warning-base) var(--theme-step-900-l-dark) calc(c * var(--theme-step-900-c)) calc(h + var(--theme-step-900-h)) ) ) */
    '900': 'var(--theme-warning-900)',
    /** var(--theme-warning-600) */
    bg: 'var(--theme-warning-bg)',
    /** var(--theme-warning-700) */
    hover: 'var(--theme-warning-hover)',
    /** #ffffff */
    fg: 'var(--theme-warning-fg)',
    secondary: {
      bg: {
        /** var(--theme-warning-50) */
        DEFAULT: 'var(--theme-warning-secondary-bg)',
        /** light-dark( var(--theme-warning-100), var(--theme-warning-200) ) */
        hover: 'var(--theme-warning-secondary-bg-hover)',
      },
      /** var(--theme-warning-700) */
      fg: 'var(--theme-warning-secondary-fg)',
      /** light-dark( var(--theme-warning-200), var(--theme-warning-300) ) */
      border: 'var(--theme-warning-secondary-border)',
    },
  },
  error: {
    /** light-dark( oklch( from var(--color-error-base) var(--theme-step-50-l-light) calc(c * var(--theme-step-50-c)) calc(h - var(--theme-step-50-h)) ), oklch( from var(--color-error-base) var(--theme-step-50-l-dark) calc(c * var(--theme-step-50-c)) calc(h - var(--theme-step-50-h)) ) ) */
    '50': 'var(--theme-error-50)',
    /** light-dark( oklch( from var(--color-error-base) var(--theme-step-100-l-light) calc(c * var(--theme-step-100-c)) calc(h - var(--theme-step-100-h)) ), oklch( from var(--color-error-base) var(--theme-step-100-l-dark) calc(c * var(--theme-step-100-c)) calc(h - var(--theme-step-100-h)) ) ) */
    '100': 'var(--theme-error-100)',
    /** light-dark( oklch( from var(--color-error-base) var(--theme-step-200-l-light) calc(c * var(--theme-step-200-c)) calc(h - var(--theme-step-200-h)) ), oklch( from var(--color-error-base) var(--theme-step-200-l-dark) calc(c * var(--theme-step-200-c)) calc(h - var(--theme-step-200-h)) ) ) */
    '200': 'var(--theme-error-200)',
    /** light-dark( oklch( from var(--color-error-base) var(--theme-step-300-l-light) calc(c * var(--theme-step-300-c)) calc(h - var(--theme-step-300-h)) ), oklch( from var(--color-error-base) var(--theme-step-300-l-dark) calc(c * var(--theme-step-300-c)) calc(h - var(--theme-step-300-h)) ) ) */
    '300': 'var(--theme-error-300)',
    /** light-dark( oklch( from var(--color-error-base) var(--theme-step-400-l-light) calc(c * var(--theme-step-400-c)) calc(h - var(--theme-step-400-h)) ), oklch( from var(--color-error-base) var(--theme-step-400-l-dark) calc(c * var(--theme-step-400-c)) calc(h - var(--theme-step-400-h)) ) ) */
    '400': 'var(--theme-error-400)',
    /** light-dark( oklch( from var(--color-error-base) var(--theme-step-500-l-light) calc(c * var(--theme-step-500-c)) calc(h - var(--theme-step-500-h)) ), oklch( from var(--color-error-base) var(--theme-step-500-l-dark) calc(c * var(--theme-step-500-c)) calc(h - var(--theme-step-500-h)) ) ) */
    '500': 'var(--theme-error-500)',
    /** light-dark( oklch( from var(--color-error-base) var(--theme-step-600-l-light) calc(c * var(--theme-step-600-c)) calc(h - var(--theme-step-600-h)) ), oklch( from var(--color-error-base) var(--theme-step-600-l-dark) calc(c * var(--theme-step-600-c)) calc(h - var(--theme-step-600-h)) ) ) */
    '600': 'var(--theme-error-600)',
    /** light-dark( oklch( from var(--color-error-base) var(--theme-step-700-l-light) calc(c * var(--theme-step-700-c)) calc(h - var(--theme-step-700-h)) ), oklch( from var(--color-error-base) var(--theme-step-700-l-dark) calc(c * var(--theme-step-700-c)) calc(h - var(--theme-step-700-h)) ) ) */
    '700': 'var(--theme-error-700)',
    /** light-dark( oklch( from var(--color-error-base) var(--theme-step-800-l-light) calc(c * var(--theme-step-800-c)) calc(h - var(--theme-step-800-h)) ), oklch( from var(--color-error-base) var(--theme-step-800-l-dark) calc(c * var(--theme-step-800-c)) calc(h - var(--theme-step-800-h)) ) ) */
    '800': 'var(--theme-error-800)',
    /** light-dark( oklch( from var(--color-error-base) var(--theme-step-900-l-light) calc(c * var(--theme-step-900-c)) calc(h - var(--theme-step-900-h)) ), oklch( from var(--color-error-base) var(--theme-step-900-l-dark) calc(c * var(--theme-step-900-c)) calc(h - var(--theme-step-900-h)) ) ) */
    '900': 'var(--theme-error-900)',
    /** var(--theme-error-600) */
    bg: 'var(--theme-error-bg)',
    /** var(--theme-error-700) */
    hover: 'var(--theme-error-hover)',
    /** #ffffff */
    fg: 'var(--theme-error-fg)',
    secondary: {
      bg: {
        /** var(--theme-error-50) */
        DEFAULT: 'var(--theme-error-secondary-bg)',
        /** light-dark(var(--theme-error-100), var(--theme-error-200)) */
        hover: 'var(--theme-error-secondary-bg-hover)',
      },
      /** var(--theme-error-600) */
      fg: 'var(--theme-error-secondary-fg)',
      /** light-dark(var(--theme-error-200), var(--theme-error-300)) */
      border: 'var(--theme-error-secondary-border)',
    },
  },
  info: {
    /** light-dark( oklch( from var(--color-info-base) var(--theme-step-50-l-light) calc(c * var(--theme-step-50-c)) calc(h - var(--theme-step-50-h)) ), oklch( from var(--color-info-base) var(--theme-step-50-l-dark) calc(c * var(--theme-step-50-c)) calc(h - var(--theme-step-50-h)) ) ) */
    '50': 'var(--theme-info-50)',
    /** light-dark( oklch( from var(--color-info-base) var(--theme-step-100-l-light) calc(c * var(--theme-step-100-c)) calc(h - var(--theme-step-100-h)) ), oklch( from var(--color-info-base) var(--theme-step-100-l-dark) calc(c * var(--theme-step-100-c)) calc(h - var(--theme-step-100-h)) ) ) */
    '100': 'var(--theme-info-100)',
    /** light-dark( oklch( from var(--color-info-base) var(--theme-step-200-l-light) calc(c * var(--theme-step-200-c)) calc(h - var(--theme-step-200-h)) ), oklch( from var(--color-info-base) var(--theme-step-200-l-dark) calc(c * var(--theme-step-200-c)) calc(h - var(--theme-step-200-h)) ) ) */
    '200': 'var(--theme-info-200)',
    /** light-dark( oklch( from var(--color-info-base) var(--theme-step-300-l-light) calc(c * var(--theme-step-300-c)) calc(h - var(--theme-step-300-h)) ), oklch( from var(--color-info-base) var(--theme-step-300-l-dark) calc(c * var(--theme-step-300-c)) calc(h - var(--theme-step-300-h)) ) ) */
    '300': 'var(--theme-info-300)',
    /** light-dark( oklch( from var(--color-info-base) var(--theme-step-400-l-light) calc(c * var(--theme-step-400-c)) calc(h - var(--theme-step-400-h)) ), oklch( from var(--color-info-base) var(--theme-step-400-l-dark) calc(c * var(--theme-step-400-c)) calc(h - var(--theme-step-400-h)) ) ) */
    '400': 'var(--theme-info-400)',
    /** light-dark( oklch( from var(--color-info-base) var(--theme-step-500-l-light) calc(c * var(--theme-step-500-c)) calc(h - var(--theme-step-500-h)) ), oklch( from var(--color-info-base) var(--theme-step-500-l-dark) calc(c * var(--theme-step-500-c)) calc(h - var(--theme-step-500-h)) ) ) */
    '500': 'var(--theme-info-500)',
    /** light-dark( oklch( from var(--color-info-base) var(--theme-step-600-l-light) calc(c * var(--theme-step-600-c)) calc(h - var(--theme-step-600-h)) ), oklch( from var(--color-info-base) var(--theme-step-600-l-dark) calc(c * var(--theme-step-600-c)) calc(h - var(--theme-step-600-h)) ) ) */
    '600': 'var(--theme-info-600)',
    /** light-dark( oklch( from var(--color-info-base) var(--theme-step-700-l-light) calc(c * var(--theme-step-700-c)) calc(h - var(--theme-step-700-h)) ), oklch( from var(--color-info-base) var(--theme-step-700-l-dark) calc(c * var(--theme-step-700-c)) calc(h - var(--theme-step-700-h)) ) ) */
    '700': 'var(--theme-info-700)',
    /** light-dark( oklch( from var(--color-info-base) var(--theme-step-800-l-light) calc(c * var(--theme-step-800-c)) calc(h - var(--theme-step-800-h)) ), oklch( from var(--color-info-base) var(--theme-step-800-l-dark) calc(c * var(--theme-step-800-c)) calc(h - var(--theme-step-800-h)) ) ) */
    '800': 'var(--theme-info-800)',
    /** light-dark( oklch( from var(--color-info-base) var(--theme-step-900-l-light) calc(c * var(--theme-step-900-c)) calc(h - var(--theme-step-900-h)) ), oklch( from var(--color-info-base) var(--theme-step-900-l-dark) calc(c * var(--theme-step-900-c)) calc(h - var(--theme-step-900-h)) ) ) */
    '900': 'var(--theme-info-900)',
    /** var(--theme-info-600) */
    bg: 'var(--theme-info-bg)',
    /** var(--theme-info-700) */
    hover: 'var(--theme-info-hover)',
    /** #ffffff */
    fg: 'var(--theme-info-fg)',
    secondary: {
      bg: {
        /** var(--theme-info-50) */
        DEFAULT: 'var(--theme-info-secondary-bg)',
        /** light-dark(var(--theme-info-100), var(--theme-info-200)) */
        hover: 'var(--theme-info-secondary-bg-hover)',
      },
      /** var(--theme-info-700) */
      fg: 'var(--theme-info-secondary-fg)',
      /** light-dark(var(--theme-info-200), var(--theme-info-300)) */
      border: 'var(--theme-info-secondary-border)',
    },
  },
  grey: {
    /** light-dark( oklch( from var(--color-grey-base) var(--theme-step-50-l-light) calc(c * var(--theme-step-50-c)) h ), oklch( from var(--color-grey-base) var(--theme-step-50-l-dark) calc(c * var(--theme-step-50-c)) h ) ) */
    '50': 'var(--theme-grey-50)',
    /** light-dark( oklch( from var(--color-grey-base) var(--theme-step-100-l-light) calc(c * var(--theme-step-100-c)) h ), oklch( from var(--color-grey-base) var(--theme-step-100-l-dark) calc(c * var(--theme-step-100-c)) h ) ) */
    '100': 'var(--theme-grey-100)',
    /** light-dark( oklch( from var(--color-grey-base) var(--theme-step-200-l-light) calc(c * var(--theme-step-200-c)) h ), oklch( from var(--color-grey-base) var(--theme-step-200-l-dark) calc(c * var(--theme-step-200-c)) h ) ) */
    '200': 'var(--theme-grey-200)',
    /** light-dark( oklch( from var(--color-grey-base) var(--theme-step-300-l-light) calc(c * var(--theme-step-300-c)) h ), oklch( from var(--color-grey-base) var(--theme-step-300-l-dark) calc(c * var(--theme-step-300-c)) h ) ) */
    '300': 'var(--theme-grey-300)',
    /** light-dark( oklch( from var(--color-grey-base) var(--theme-step-400-l-light) calc(c * var(--theme-step-400-c)) h ), oklch( from var(--color-grey-base) var(--theme-step-400-l-dark) calc(c * var(--theme-step-400-c)) h ) ) */
    '400': 'var(--theme-grey-400)',
    /** light-dark( oklch( from var(--color-grey-base) var(--theme-step-500-l-light) calc(c * var(--theme-step-500-c)) h ), oklch( from var(--color-grey-base) var(--theme-step-500-l-dark) calc(c * var(--theme-step-500-c)) h ) ) */
    '500': 'var(--theme-grey-500)',
    /** light-dark( oklch( from var(--color-grey-base) var(--theme-step-600-l-light) calc(c * var(--theme-step-600-c)) h ), oklch( from var(--color-grey-base) var(--theme-step-600-l-dark) calc(c * var(--theme-step-600-c)) h ) ) */
    '600': 'var(--theme-grey-600)',
    /** light-dark( oklch( from var(--color-grey-base) var(--theme-step-700-l-light) calc(c * var(--theme-step-700-c)) h ), oklch( from var(--color-grey-base) var(--theme-step-700-l-dark) calc(c * var(--theme-step-700-c)) h ) ) */
    '700': 'var(--theme-grey-700)',
    /** light-dark( oklch( from var(--color-grey-base) var(--theme-step-800-l-light) calc(c * var(--theme-step-800-c)) h ), oklch( from var(--color-grey-base) var(--theme-step-800-l-dark) calc(c * var(--theme-step-800-c)) h ) ) */
    '800': 'var(--theme-grey-800)',
    /** light-dark( oklch( from var(--color-grey-base) var(--theme-step-900-l-light) calc(c * var(--theme-step-900-c)) h ), oklch( from var(--color-grey-base) var(--theme-step-900-l-dark) calc(c * var(--theme-step-900-c)) h ) ) */
    '900': 'var(--theme-grey-900)',
  },
  surface: {
    primary: {
      /** var(--theme-surface-primary) */
      DEFAULT: 'var(--surface-primary)',
      /** light-dark(var(--theme-primary-100), var(--theme-primary-200)) */
      hover: 'var(--surface-primary-hover)',
      /** var(--theme-fg) */
      fg: 'var(--surface-primary-fg)',
      /** var(--theme-primary-border) */
      border: 'var(--surface-primary-border)',
    },
    bg: {
      /** var(--theme-bg-0) */
      DEFAULT: 'var(--surface-bg)',
      /** var(--theme-bg-1) */
      next: 'var(--surface-bg-next)',
    },
    /** var(--theme-fg) */
    fg: 'var(--surface-fg)',
    /** var(--theme-muted) */
    muted: 'var(--surface-muted)',
    /** var(--theme-subtle) */
    subtle: 'var(--surface-subtle)',
    /** var(--theme-border) */
    border: 'var(--surface-border)',
    secondary: {
      /** light-dark(var(--theme-grey-50), var(--theme-grey-100)) */
      DEFAULT: 'var(--surface-secondary)',
      /** light-dark(var(--theme-grey-100), var(--theme-grey-200)) */
      hover: 'var(--surface-secondary-hover)',
      /** var(--theme-fg) */
      fg: 'var(--surface-secondary-fg)',
      /** var(--theme-border) */
      border: 'var(--surface-secondary-border)',
    },
    /** var(--theme-shadow-0) */
    shadow: 'var(--surface-shadow)',
  },
  yellow: {
    /** light-dark(#fef9c3, #422006) */
    bg: 'var(--theme-yellow-bg)',
    /** light-dark(#713f12, #fef08a) */
    fg: 'var(--theme-yellow-fg)',
  },
  blue: {
    /** light-dark(#dbeafe, #172554) */
    bg: 'var(--theme-blue-bg)',
    /** light-dark(#1e40af, #93c5fd) */
    fg: 'var(--theme-blue-fg)',
  },
  green: {
    /** light-dark(#dcfce7, #052e16) */
    bg: 'var(--theme-green-bg)',
    /** light-dark(#15803d, #86efac) */
    fg: 'var(--theme-green-fg)',
  },
  beige: {
    /** light-dark(#f5f0eb, #2e2a27) */
    bg: 'var(--theme-beige-bg)',
    /** light-dark(#4c3921, #ead9c4) */
    fg: 'var(--theme-beige-fg)',
  },
  pink: {
    /** light-dark(#fce7f3, #500724) */
    bg: 'var(--theme-pink-bg)',
    /** light-dark(#9d174d, #fbcfe8) */
    fg: 'var(--theme-pink-fg)',
  },
  purple: {
    /** light-dark(#f3e8ff, #3b0764) */
    bg: 'var(--theme-purple-bg)',
    /** light-dark(#6b21a8, #e9d5ff) */
    fg: 'var(--theme-purple-fg)',
  },
  sky: {
    /** light-dark(#e0f2fe, #082f49) */
    bg: 'var(--theme-sky-bg)',
    /** light-dark(#0369a1, #7dd3fc) */
    fg: 'var(--theme-sky-fg)',
  },
} as const;

export const themeContract = vars;

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

export type ExtractThemeVarByType<T extends string> = {
  [
    K in keyof typeof themeVars as K extends `--theme-${T}-${infer _Rest}` ? K : never
  ]: (typeof themeVars)[K];
};
