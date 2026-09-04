import { recipe, style } from '@cumulo/css';
import { vars } from './contract.js';

export type BaseVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type Intent = 'primary' | 'success' | 'warning' | 'error' | 'info';
export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

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
        xs: {
          height: vars.size.xs,
          paddingLeft: vars.spacing.xs,
          paddingRight: vars.spacing.xs,
          fontSize: vars.font.size.xs,
        },
        sm: {
          height: vars.size.sm,
          paddingLeft: vars.spacing.sm,
          paddingRight: vars.spacing.sm,
          fontSize: vars.font.size.sm,
        },
        md: {
          height: vars.size.md,
          paddingLeft: vars.spacing.md,
          paddingRight: vars.spacing.md,
          fontSize: vars.font.size.sm,
        },
        lg: {
          height: vars.size.lg,
          paddingLeft: vars.spacing.lg,
          paddingRight: vars.spacing.lg,
          fontSize: vars.font.size.base,
        },
        xl: {
          height: vars.size.xl,
          paddingLeft: vars.spacing.xl,
          paddingRight: vars.spacing.xl,
          fontSize: vars.font.size.lg,
        },
      },
    },
    defaultVariants: {
      size: 'md',
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
          backgroundColor: vars.surface.bg.DEFAULT,
          color: vars.surface.fg,
          borderColor: vars.surface.border,
          ':hover': {
            backgroundColor: vars.surface.bg.next,
          },
          ':focus': {
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

/**
 * Shared focus ring style and recipe for interactive components.
 */
export const focusRingStyles = {
  outline: 'none',
  ':focus-visible': {
    boxShadow: `0 0 0 2px ${vars.surface.bg.DEFAULT}, 0 0 0 4px ${vars.primary.focus}`,
  },
  ':has(:focus-visible)': {
    boxShadow: `0 0 0 2px ${vars.surface.bg.DEFAULT}, 0 0 0 4px ${vars.primary.focus}`,
  },
} as const;

export const focusRing = recipe(
  {
    base: focusRingStyles,
  },
  'focus-ring',
);

/**
 * Accessible visually hidden style for hidden input elements and screen-reader content.
 */
export const visuallyHidden = style(
  {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: 0,
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    border: 0,
    opacity: 0,
  },
  'visually-hidden',
);

/**
 * Full-coverage transparent input style for custom interactive controls (e.g. Checkbox, Switch).
 * Stretches across the parent container to natively capture click, touch, and focus events without wrapping in a label.
 */
export const controlInput = style(
  {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    opacity: 0,
    margin: 0,
    padding: 0,
    cursor: 'inherit',
    zIndex: 1,
  },
  'control-input',
);
