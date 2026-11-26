import { recipe, style } from '@cumulo/css';

import { vars } from './contract.js';

export type BaseVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type Intent = 'primary' | 'success' | 'warning' | 'error' | 'info';
export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

type SecondaryIntent = Exclude<Intent, 'primary'>;

function getIntentSecondaryVarMap() {
  return {
    success: {
      bg: {
        DEFAULT: vars.success.secondary.bg.DEFAULT,
        hover: vars.success.secondary.bg.hover,
      },
      fg: vars.success.secondary.fg,
      border: vars.success.secondary.border,
    },
    warning: {
      bg: {
        DEFAULT: vars.warning.secondary.bg.DEFAULT,
        hover: vars.warning.secondary.bg.hover,
      },
      fg: vars.warning.secondary.fg,
      border: vars.warning.secondary.border,
    },
    error: {
      bg: {
        DEFAULT: vars.error.secondary.bg.DEFAULT,
        hover: vars.error.secondary.bg.hover,
      },
      fg: vars.error.secondary.fg,
      border: vars.error.secondary.border,
    },
    info: {
      bg: {
        DEFAULT: vars.info.secondary.bg.DEFAULT,
        hover: vars.info.secondary.bg.hover,
      },
      fg: vars.info.secondary.fg,
      border: vars.info.secondary.border,
    },
  } as const;
}

function isSecondaryIntent(intent: Intent): intent is SecondaryIntent {
  return intent !== 'primary';
}

function flatMapSecondaryIntents<T extends Intent, R>(
  intents: readonly T[],
  mapper: (
    intent: T,
    secondary: ReturnType<typeof getIntentSecondaryVarMap>[SecondaryIntent],
  ) => R[],
): R[] {
  const secondaryVarMap = getIntentSecondaryVarMap();
  return intents.flatMap((intent) =>
    isSecondaryIntent(intent) ? mapper(intent, secondaryVarMap[intent]) : [],
  );
}

/**
 * Creates static primary, secondary, outline, ghost compound styles for given intents (no hover).
 */
export function createStaticIntentCompoundVariants<T extends Intent>(intents: readonly T[]) {
  return flatMapSecondaryIntents(intents, (intent, secondary) => [
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
  ]);
}

/**
 * Creates interactive hover compound styles for given intents.
 */
export function createInteractiveIntentCompoundVariants<T extends Intent>(intents: readonly T[]) {
  return flatMapSecondaryIntents(intents, (intent, secondary) => [
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
  ]);
}

/**
 * Static base variants (primary, secondary, outline, ghost) without hover.
 */
export const staticBaseVariantStyles = recipe(
  {
    layer: 'components',
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
 * Interactive hover, active, and control appearance styles for base variants.
 * Kept separate from staticBaseVariantStyles so non-interactive Badges and Alerts remain flat.
 */
export const interactiveBaseVariantStyles = recipe(
  {
    layer: 'components',
    variants: {
      variant: {
        primary: {
          backgroundImage: vars.control.bg.image.DEFAULT,
          borderColor: vars.control.primary.border,
          boxShadow: vars.control.shadow.DEFAULT,
          textShadow: vars.control.text.shadow,
          ':hover': {
            backgroundColor: vars.primary.hover,
            backgroundImage: vars.control.bg.image.hover,
            boxShadow: vars.control.shadow.hover,
          },
          ':active': {
            boxShadow: vars.control.shadow.active,
          },
        },
        secondary: {
          backgroundImage: vars.control.bg.image.DEFAULT,
          borderColor: vars.control.secondary.border,
          boxShadow: vars.control.shadow.DEFAULT,
          ':hover': {
            backgroundColor: vars.surface.secondary.hover,
            backgroundImage: vars.control.bg.image.hover,
            boxShadow: vars.control.shadow.hover,
          },
          ':active': {
            boxShadow: vars.control.shadow.active,
          },
        },
        outline: {
          backgroundImage: 'none',
          boxShadow: vars.control.shadow.DEFAULT,
          ':hover': {
            backgroundColor: vars.surface.secondary.DEFAULT,
            boxShadow: vars.control.shadow.hover,
          },
          ':active': {
            boxShadow: vars.control.shadow.active,
          },
        },
        ghost: {
          backgroundImage: 'none',
          boxShadow: 'none',
          ':hover': {
            backgroundColor: vars.surface.secondary.DEFAULT,
            backgroundImage: 'none',
            boxShadow: 'none',
          },
          ':active': {
            boxShadow: 'none',
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
    layer: 'components',
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
    layer: 'components',
    variants: {
      size: {
        '2xs': {
          height: vars.size['2xs'],
          paddingLeft: vars.spacing['2xs'],
          paddingRight: vars.spacing['2xs'],
          fontSize: vars.font.size['2xs'],
        },
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
    layer: 'components',
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
    layer: 'components',
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
    layer: 'components',
    variants: {
      variant: {
        field: {
          backgroundColor: vars.surface.bg.DEFAULT,
          backgroundImage: vars.field.bg.image,
          color: vars.surface.fg,
          borderColor: vars.surface.border,
          boxShadow: vars.field.shadow.DEFAULT,
          ':hover': {
            backgroundColor: vars.surface.bg.next,
          },
          ':focus-visible': {
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
    layer: 'components',
    extend: [fieldVariantStyles],
    variants: {
      intent: {
        default: {},
        error: {
          borderColor: vars.error['600'],
          ':focus-visible': {
            borderColor: vars.error['600'],
          },
          ':focus-within': {
            borderColor: vars.error['600'],
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
 * Uses `outline` + `outlineOffset` so custom control `boxShadow` tokens are preserved on focus.
 */
export const focusRingStyles = {
  outline: `2px none ${vars.primary.focus}`,
  outlineOffset: '2px',
  ':focus-visible': {
    outline: `2px solid ${vars.primary.focus}`,
    outlineOffset: '2px',
  },
  ':has(:focus-visible)': {
    outline: `2px solid ${vars.primary.focus}`,
    outlineOffset: '2px',
  },
} as const;

export const focusRing = recipe(
  {
    layer: 'components',
    base: focusRingStyles,
    variants: {
      variant: { default: {} },
    },
  },
  'focus-ring',
);

/**
 * Shared intent styles for custom selection controls (e.g. Checkbox, Radio, Switch).
 */
export const controlIntent = recipe(
  {
    layer: 'components',
    base: {
      display: 'inline-flex',
      alignItems: 'center',
      position: 'relative',
      borderStyle: 'solid',
      borderColor: vars.surface.border,
      cursor: 'pointer',
      userSelect: 'none',
      boxSizing: 'border-box',
      flexShrink: 0,
    },
    variants: {
      checked: {
        true: {
          backgroundColor: vars.primary.DEFAULT,
          backgroundImage: vars.control.bg.image.DEFAULT,
          borderColor: vars.primary.DEFAULT,
          boxShadow: vars.control.shadow.DEFAULT,
          selectors: {
            '&:has(input:hover)': {
              backgroundColor: vars.primary.hover,
              backgroundImage: vars.control.bg.image.hover,
              borderColor: vars.primary.hover,
            },
          },
        },
        false: {},
      },
      disabled: {
        true: {
          opacity: 0.5,
          cursor: 'not-allowed',
          pointerEvents: 'none',
        },
        false: {},
      },
      intent: {
        default: {},
        error: {
          borderColor: vars.error['600'],
          outlineColor: vars.error['600'],
          selectors: {
            '&:has(input:hover)': {
              borderColor: vars.error['700'],
            },
          },
          ':focus-visible': {
            borderColor: vars.error['600'],
            outline: `2px solid ${vars.error['600']}`,
            outlineOffset: '2px',
          },
          ':has(:focus-visible)': {
            borderColor: vars.error['600'],
            outline: `2px solid ${vars.error['600']}`,
            outlineOffset: '2px',
          },
        },
      },
    },
    compoundVariants: [
      {
        variants: { intent: 'error', checked: true },
        style: {
          backgroundColor: vars.error.bg,
          borderColor: vars.error.bg,
          color: vars.error.fg,
          selectors: {
            '&:has(input:hover)': {
              backgroundColor: vars.error.hover,
              borderColor: vars.error.hover,
            },
          },
        },
      },
      {
        variants: { intent: 'error', checked: false },
        style: {
          color: vars.error['600'],
        },
      },
    ],
    defaultVariants: {
      checked: false,
      disabled: false,
      intent: 'default',
    },
  },
  'control-intent',
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
  { prefix: 'visually-hidden', layer: 'components' },
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
  { prefix: 'control-input', layer: 'components' },
);
