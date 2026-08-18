import { createThemeContract } from '@cumulo/css';

export const themeContract = createThemeContract({
  color: {
    // Canvas / Surfaces
    bg: null,
    bgSubtle: null,
    bgSurface: null,
    bgElevated: null,
    bgOverlay: null,

    // Text / Foregrounds
    fg: null,
    fgMuted: null,
    fgSubtle: null,
    fgInverted: null,

    // Borders / Dividers
    border: null,
    borderMuted: null,
    borderFocus: null,

    // Brand Primary
    primary: null,
    primaryHover: null,
    primaryActive: null,
    primaryFg: null,
    primarySubtle: null,

    // Secondary / Neutral
    secondary: null,
    secondaryHover: null,
    secondaryFg: null,

    // Feedback
    success: null,
    successSubtle: null,
    successFg: null,
    warning: null,
    warningSubtle: null,
    warningFg: null,
    danger: null,
    dangerSubtle: null,
    dangerFg: null,
    info: null,
    infoSubtle: null,
    infoFg: null,
  },

  space: {
    none: null,
    '3xs': null,
    '2xs': null,
    xs: null,
    sm: null,
    md: null,
    lg: null,
    xl: null,
    '2xl': null,
    '3xl': null,
    '4xl': null,
  },

  radii: {
    none: null,
    xs: null,
    sm: null,
    md: null,
    lg: null,
    xl: null,
    '2xl': null,
    full: null,
  },

  fontFamily: {
    sans: null,
    mono: null,
    serif: null,
  },

  fontSize: {
    '2xs': null,
    xs: null,
    sm: null,
    base: null,
    lg: null,
    xl: null,
    '2xl': null,
    '3xl': null,
    '4xl': null,
  },

  fontWeight: {
    normal: null,
    medium: null,
    semibold: null,
    bold: null,
  },

  shadow: {
    xs: null,
    sm: null,
    md: null,
    lg: null,
    xl: null,
    glow: null,
  },

  transition: {
    fast: null,
    base: null,
    slow: null,
    bounce: null,
  },

  zIndex: {
    hide: null,
    base: null,
    dropdown: null,
    sticky: null,
    overlay: null,
    modal: null,
    toast: null,
    tooltip: null,
  },
});

export const vars = themeContract;
