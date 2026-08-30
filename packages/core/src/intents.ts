import { recipe } from '@cumulo/css';
import { vars } from './contract.js';

export type BaseVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type Intent = 'primary' | 'success' | 'warning' | 'error' | 'info';
export type ComponentSize = 'xSmall' | 'small' | 'base' | 'large';

const intentSecondaryVarMap = {
  success: vars.success.secondary,
  warning: vars.warning.secondary,
  error: vars.error.secondary,
  info: vars.info.secondary,
} as const;

/**
 * Creates static primary, secondary, outline, ghost compound styles for given intents (no hover).
 */
export function createStaticIntentCompoundVariants<T extends Intent>(intents: readonly T[]) {
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
        },
      },
      {
        variants: { intent, variant: 'outline' as const },
        style: {
          backgroundColor: 'transparent',
          color: secondary.fg,
          borderColor: secondary.border,
        },
      },
      {
        variants: { intent, variant: 'ghost' as const },
        style: {
          backgroundColor: 'transparent',
          color: secondary.fg,
          borderColor: 'transparent',
        },
      },
    ];
  });
}

/**
 * Creates interactive hover compound styles for given intents.
 */
export function createInteractiveIntentCompoundVariants<T extends Intent>(intents: readonly T[]) {
  return intents.flatMap((intent) => {
    if (intent === 'primary') return [];
    if (!(intent in intentSecondaryVarMap)) return [];

    const secondary = intentSecondaryVarMap[intent as keyof typeof intentSecondaryVarMap];

    return [
      {
        variants: { intent, variant: 'secondary' as const },
        style: {
          ':hover': {
            backgroundColor: secondary.bg.hover,
          },
        },
      },
      {
        variants: { intent, variant: 'outline' as const },
        style: {
          ':hover': {
            backgroundColor: secondary.bg.DEFAULT,
          },
        },
      },
      {
        variants: { intent, variant: 'ghost' as const },
        style: {
          ':hover': {
            backgroundColor: secondary.bg.DEFAULT,
          },
        },
      },
    ];
  });
}

/**
 * Creates combined compound styles for given intents (includes hover for backward compatibility).
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
 * Static base variants (primary, secondary, outline, ghost) without hover.
 */
export const staticBaseVariantStyles = recipe(
  {
    variants: {
      variant: {
        primary: {
          backgroundColor: vars.primary.DEFAULT,
          color: vars.primary.fg,
          borderColor: 'transparent',
        },
        secondary: {
          backgroundColor: vars.surface.secondary.DEFAULT,
          color: vars.surface.fg,
          borderColor: 'transparent',
        },
        outline: {
          backgroundColor: 'transparent',
          color: vars.surface.fg,
          borderColor: vars.surface.secondary.border,
        },
        ghost: {
          backgroundColor: 'transparent',
          color: vars.surface.fg,
          borderColor: 'transparent',
        },
      },
    },
    defaultVariants: {
      variant: 'primary',
    },
  },
  'static-base-var',
);

/**
 * Interactive hover styles for base variants.
 */
export const interactiveBaseVariantStyles = recipe(
  {
    variants: {
      variant: {
        primary: {
          ':hover': {
            backgroundColor: vars.primary.hover,
          },
        },
        secondary: {
          ':hover': {
            backgroundColor: vars.surface.secondary.hover,
          },
        },
        outline: {
          ':hover': {
            backgroundColor: vars.surface.secondary.DEFAULT,
          },
        },
        ghost: {
          ':hover': {
            backgroundColor: vars.surface.secondary.DEFAULT,
          },
        },
      },
    },
  },
  'interactive-base-var',
);

/**
 * Base variants available across interactive elements (primary, secondary, outline, ghost).
 */
export const baseVariantStyles = recipe(
  {
    extend: [staticBaseVariantStyles, interactiveBaseVariantStyles],
    variants: {},
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
        xSmall: {
          height: vars.size.xSmall,
          paddingLeft: vars.spacing['xs'],
          paddingRight: vars.spacing['xs'],
          fontSize: vars.font.size.xs,
        },
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
 * Static intent styles without hover (success, warning, error, info).
 */
export const staticIntentStyles = recipe(
  {
    extend: [staticBaseVariantStyles],
    variants: {
      intent: {
        primary: {},
        success: {
          backgroundColor: vars.success.bg,
          color: vars.success.fg,
        },
        warning: {
          backgroundColor: vars.warning.bg,
          color: vars.warning.fg,
        },
        error: {
          backgroundColor: vars.error.bg,
          color: vars.error.fg,
        },
        info: {
          backgroundColor: vars.info.bg,
          color: vars.info.fg,
        },
      },
    },
    compoundVariants: createStaticIntentCompoundVariants([
      'success',
      'warning',
      'error',
      'info',
    ] as const),
    defaultVariants: {
      variant: 'primary',
      intent: 'primary',
    },
  },
  'static-intent',
);

export const baseIntentStyles = staticIntentStyles;

/**
 * Interactive intent styles with hover (success, warning, error, info).
 */
export const interactiveIntentStyles = recipe(
  {
    extend: [staticIntentStyles, interactiveBaseVariantStyles],
    variants: {
      intent: {
        primary: {},
        success: {
          ':hover': {
            backgroundColor: vars.success.hover,
          },
        },
        warning: {
          ':hover': {
            backgroundColor: vars.warning.hover,
          },
        },
        error: {
          ':hover': {
            backgroundColor: vars.error.hover,
          },
        },
        info: {
          ':hover': {
            backgroundColor: vars.info.hover,
          },
        },
      },
    },
    compoundVariants: createInteractiveIntentCompoundVariants([
      'success',
      'warning',
      'error',
      'info',
    ] as const),
    defaultVariants: {
      variant: 'primary',
      intent: 'primary',
    },
  },
  'interactive-intent',
);

export const allIntentStyles = interactiveIntentStyles;
export const buttonIntentStyles = interactiveIntentStyles;

/**
 * Variant style for form inputs.
 */
export const fieldVariantStyles = recipe(
  {
    variants: {
      variant: {
        field: {
          backgroundColor: vars.surface.secondary.DEFAULT,
          color: vars.surface.fg,
          borderColor: vars.surface.border,
          ':hover': {
            backgroundColor: vars.surface.secondary.hover,
          },
          ':focus': {
            backgroundColor: vars.surface.secondary.hover,
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
