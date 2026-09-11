import { recipe, style, type RecipeVariants } from '@cumulo/css';
import { vars } from './contract.js';

export const familyStyles = recipe(
  {
    variants: {
      family: {
        sans: { fontFamily: vars.font.sans },
        mono: { fontFamily: vars.font.mono },
      },
    },
  },
  'type-family',
);

export const weightStyles = recipe(
  {
    variants: {
      weight: {
        normal: { fontWeight: vars.font.weight.normal },
        medium: { fontWeight: vars.font.weight.medium },
        semibold: { fontWeight: vars.font.weight.semibold },
        bold: { fontWeight: vars.font.weight.bold },
      },
    },
  },
  'type-weight',
);

export const lineHeightStyles = recipe(
  {
    variants: {
      lineHeight: {
        none: { lineHeight: vars.line.height.none },
        tight: { lineHeight: vars.line.height.tight },
        normal: { lineHeight: vars.line.height.normal },
        relaxed: { lineHeight: vars.line.height.relaxed },
      },
    },
  },
  'type-line-height',
);

export const textColorStyles = recipe(
  {
    variants: {
      color: {
        default: { color: vars.surface.fg },
        muted: { color: vars.surface.muted },
        subtle: { color: vars.subtle },
        primary: { color: vars.primary.DEFAULT },
        error: { color: vars.error.fg },
        success: { color: vars.success.fg },
        warning: { color: vars.warning.fg },
        inherit: { color: 'inherit' },
      },
    },
  },
  'type-color',
);

export const textSizeStyles = recipe(
  {
    variants: {
      size: {
        '2xs': { fontSize: vars.font.size['2xs'] },
        xs: { fontSize: vars.font.size.xs },
        sm: { fontSize: vars.font.size.sm },
        base: { fontSize: vars.font.size.base },
        md: { fontSize: vars.font.size.md },
        lg: { fontSize: vars.font.size.lg },
        xl: { fontSize: vars.font.size.xl },
        '2xl': { fontSize: vars.font.size['2xl'] },
        '3xl': { fontSize: vars.font.size['3xl'] },
        '4xl': { fontSize: vars.font.size['4xl'] },
      },
    },
  },
  'type-size',
);

export const alignStyles = recipe(
  {
    variants: {
      align: {
        left: { textAlign: 'left' },
        center: { textAlign: 'center' },
        right: { textAlign: 'right' },
        justify: { textAlign: 'justify' },
      },
    },
  },
  'type-align',
);

export const wrapStyles = recipe(
  {
    variants: {
      wrap: {
        wrap: { overflowWrap: 'break-word' },
        nowrap: { whiteSpace: 'nowrap' },
        balance: { textWrap: 'balance' },
        pretty: { textWrap: 'pretty' },
      },
    },
  },
  'type-wrap',
);

export const transformStyles = recipe(
  {
    variants: {
      transform: {
        uppercase: { textTransform: 'uppercase' },
        lowercase: { textTransform: 'lowercase' },
        capitalize: { textTransform: 'capitalize' },
        none: { textTransform: 'none' },
      },
    },
  },
  'type-transform',
);

export const truncateStyle = style(
  {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  'type-truncate',
);

export const textBase = {
  textBox: 'trim-both cap alphabetic',
  WebkitFontSmoothing: 'antialiased',
  MozOsxFontSmoothing: 'grayscale',
};

export const textBaseStyles = style(textBase);

export const textSharedRecipe = recipe(
  {
    extend: [weightStyles, lineHeightStyles, textColorStyles],
    base: {
      fontFamily: vars.font.sans,
      color: vars.surface.fg,
      ...textBase,
    },
  },
  'text-shared',
);

export type TextSharedVariants = RecipeVariants<typeof textSharedRecipe>;
