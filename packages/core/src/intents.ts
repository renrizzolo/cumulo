import { recipe } from '@cumulo/css';
import { vars } from './contract.js';

export type BaseVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type Intent = 'primary' | 'success' | 'warning' | 'error' | 'info';
export type ComponentSize = 'small' | 'base' | 'large';

const intentSecondaryVarMap = {
  success: vars.success.secondary,
  warning: vars.warning.secondary,
  error: vars.error.secondary,
  info: vars.info.secondary,
} as const;

/**
 * Creates primary, secondary, outline, ghost compound styles for given intents.
 */
export function createIntentCompoundVariants<T extends Intent>(intents: readonly T[]) {
  return intents.flatMap((intent) => {
    if (intent === 'primary') return [];
    if (!(intent in intentSecondaryVarMap)) return [];

    const secondary = intentSecondaryVarMap[intent as keyof typeof intentSecondaryVarMap];

    return [
      {
        variants: { intent, variant: 'secondary' as const },
        style: {
          backgroundColor: secondary.bg.DEFAULT,
          color: secondary.fg,
          borderColor: 'transparent',
          ':hover': {
            backgroundColor: secondary.bg.hover,
          },
        },
      },
      {
        variants: { intent, variant: 'outline' as const },
        style: {
          backgroundColor: 'transparent',
          color: secondary.fg,
          borderColor: secondary.border,
          ':hover': {
            backgroundColor: secondary.bg.DEFAULT,
          },
        },
      },
      {
        variants: { intent, variant: 'ghost' as const },
        style: {
          backgroundColor: 'transparent',
          color: secondary.fg,
          borderColor: 'transparent',
          ':hover': {
            backgroundColor: secondary.bg.DEFAULT,
          },
        },
      },
    ];
  });
}

/**
 * Base variants available across interactive elements (primary, secondary, outline, ghost).
 */
export const baseVariantStyles = recipe(
  {
    variants: {
      variant: {
        primary: {
          backgroundColor: vars.primary.DEFAULT,
          color: vars.primary.fg,
          borderColor: 'transparent',
          ':hover': {
            backgroundColor: vars.primary.hover,
          },
        },
        secondary: {
          backgroundColor: vars.surface.secondary.DEFAULT,
          color: vars.surface.fg,
          borderColor: 'transparent',
          ':hover': {
            backgroundColor: vars.surface.secondary.hover,
          },
        },
        outline: {
          backgroundColor: 'transparent',
          color: vars.surface.fg,
          borderColor: vars.surface.secondary.border,
          ':hover': {
            backgroundColor: vars.surface.secondary.DEFAULT,
          },
        },
        ghost: {
          backgroundColor: 'transparent',
          color: vars.surface.fg,
          borderColor: 'transparent',
          ':hover': {
            backgroundColor: vars.surface.secondary.DEFAULT,
          },
        },
      },
    },
    defaultVariants: {
      variant: 'primary',
    },
  },
  'base-var',
);

/**
 * Standard sizing scale (small, base, large).
 */
export const sizes = recipe(
  {
    variants: {
      size: {
        small: {
          height: vars.size.small,
          paddingLeft: vars.spacing.sm,
          paddingRight: vars.spacing.sm,
          fontSize: vars.font.size.sm,
        },
        base: {
          height: vars.size.base,
          paddingLeft: vars.spacing.md,
          paddingRight: vars.spacing.md,
          fontSize: vars.font.size.sm,
        },
        large: {
          height: vars.size.large,
          paddingLeft: vars.spacing.lg,
          paddingRight: vars.spacing.lg,
          fontSize: vars.font.size.base,
        },
      },
    },
    defaultVariants: {
      size: 'base',
    },
  },
  'size',
);

/**
 * Primary action intents (success, error).
 */
export const buttonIntentStyles = recipe(
  {
    extend: [baseVariantStyles],
    variants: {
      intent: {
        primary: {},
        success: {
          backgroundColor: vars.success.bg,
          color: vars.success.fg,
          ':hover': {
            backgroundColor: vars.success.hover,
          },
        },
        error: {
          backgroundColor: vars.error.bg,
          color: vars.error.fg,
          ':hover': {
            backgroundColor: vars.error.hover,
          },
        },
      },
    },
    compoundVariants: createIntentCompoundVariants(['success', 'error'] as const),
  },
  'btn-intent',
);

/**
 * Secondary / informational intents (warning, info).
 */
export const extraIntentStyles = recipe(
  {
    extend: [baseVariantStyles],
    variants: {
      intent: {
        warning: {
          backgroundColor: vars.warning.bg,
          color: vars.warning.fg,
          ':hover': {
            backgroundColor: vars.warning.hover,
          },
        },
        info: {
          backgroundColor: vars.info.bg,
          color: vars.info.fg,
          ':hover': {
            backgroundColor: vars.info.hover,
          },
        },
      },
    },
    compoundVariants: createIntentCompoundVariants(['warning', 'info'] as const),
  },
  'extra-intent',
);

/**
 * All intents combined (success, warning, error, info).
 */
export const allIntentStyles = recipe(
  {
    extend: [buttonIntentStyles, extraIntentStyles],
    variants: {},
  },
  'all-intent',
);

export const baseIntentStyles = allIntentStyles;

/**
 * Variant style for form inputs.
 */
export const fieldVariantStyles = recipe(
  {
    variants: {
      variant: {
        field: {
          backgroundColor: vars.surface.bg.DEFAULT,
          color: vars.surface.fg,
          borderColor: vars.surface.border,
          ':hover': {
            backgroundColor: vars.surface.bg.next,
          },
        },
      },
    },
  },
  'field-var',
);

/**
 * Field intent compound styles (e.g. error border for form inputs).
 */
export const fieldIntentStyles = recipe(
  {
    extend: [fieldVariantStyles],
    variants: {
      intent: {
        default: {},
        error: {
          borderColor: vars.error.bg,
          ':focus-visible': {
            borderColor: vars.error.bg,
          },
        },
      },
    },
    defaultVariants: {
      intent: 'default',
    },
  },
  'field-intent',
);
