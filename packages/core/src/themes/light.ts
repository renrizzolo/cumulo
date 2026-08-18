import { createTheme, createGlobalTheme } from '@cumulo/css';
import { themeContract } from '../contract.js';
import {
  defaultColorTokens,
  defaultSpaceTokens,
  defaultRadiiTokens,
  defaultTypographyTokens,
  defaultShadowTokens,
  defaultTransitionTokens,
  defaultZIndexTokens,
} from '../tokens/index.js';

export const lightThemeValues = {
  color: {
    bg: '#ffffff',
    bgSubtle: defaultColorTokens.slate[50],
    bgSurface: '#ffffff',
    bgElevated: '#ffffff',
    bgOverlay: 'rgba(15, 23, 42, 0.6)',

    fg: defaultColorTokens.slate[900],
    fgMuted: defaultColorTokens.slate[600],
    fgSubtle: defaultColorTokens.slate[400],
    fgInverted: '#ffffff',

    border: defaultColorTokens.slate[200],
    borderMuted: defaultColorTokens.slate[100],
    borderFocus: defaultColorTokens.brand[500],

    primary: defaultColorTokens.brand[600],
    primaryHover: defaultColorTokens.brand[700],
    primaryActive: defaultColorTokens.brand[800],
    primaryFg: '#ffffff',
    primarySubtle: defaultColorTokens.brand[50],

    secondary: defaultColorTokens.slate[100],
    secondaryHover: defaultColorTokens.slate[200],
    secondaryFg: defaultColorTokens.slate[800],

    success: defaultColorTokens.success.DEFAULT,
    successSubtle: defaultColorTokens.success.light,
    successFg: '#ffffff',

    warning: defaultColorTokens.warning.DEFAULT,
    warningSubtle: defaultColorTokens.warning.light,
    warningFg: '#ffffff',

    danger: defaultColorTokens.danger.DEFAULT,
    dangerSubtle: defaultColorTokens.danger.light,
    dangerFg: '#ffffff',

    info: defaultColorTokens.info.DEFAULT,
    infoSubtle: defaultColorTokens.info.light,
    infoFg: '#ffffff',
  },

  space: defaultSpaceTokens,
  radii: defaultRadiiTokens,
  fontFamily: defaultTypographyTokens.fontFamily,
  fontSize: defaultTypographyTokens.fontSize,
  fontWeight: defaultTypographyTokens.fontWeight,
  shadow: defaultShadowTokens,
  transition: defaultTransitionTokens,
  zIndex: {
    hide: defaultZIndexTokens.hide,
    base: defaultZIndexTokens.base,
    dropdown: defaultZIndexTokens.dropdown,
    sticky: defaultZIndexTokens.sticky,
    overlay: defaultZIndexTokens.overlay,
    modal: defaultZIndexTokens.modal,
    toast: defaultZIndexTokens.toast,
    tooltip: defaultZIndexTokens.tooltip,
  },
};

export const lightTheme = createTheme(themeContract, lightThemeValues);

export function applyLightGlobalTheme(selector = ':root') {
  return createGlobalTheme(selector, themeContract, lightThemeValues);
}
