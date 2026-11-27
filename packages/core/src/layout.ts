import { recipe, type RecipeVariants } from '@cumulo/css';

import { vars } from './contract.js';
import type { ResponsiveProp } from './responsive.js';

export const FLEX_VALUES = {
  1: '1',
  auto: 'auto',
  initial: 'initial',
  none: 'none',
} as const;

/**
 * Shared flex variants for layout primitives (Surface, Stack, Card).
 */
export const flexStyles = recipe(
  {
    layer: 'components',
    variants: {
      flex: {
        1: { flex: 1 },
        auto: { flex: 'auto' },
        initial: { flex: 'initial' },
        none: { flex: 'none' },
      },
    },
  },
  'layout-flex',
);

export type StaticFlexVariant = NonNullable<RecipeVariants<typeof flexStyles>['flex']>;
export type FlexVariant = ResponsiveProp<StaticFlexVariant>;
export type FlexVariants = { flex?: FlexVariant };

export const OVERFLOW_VALUES = {
  hidden: 'hidden',
  visible: 'visible',
  auto: 'auto',
  scroll: 'scroll',
} as const;

/**
 * Shared overflow variants for layout primitives (Surface, Card).
 */
export const overflowStyles = recipe(
  {
    layer: 'components',
    variants: {
      overflow: {
        hidden: { overflow: 'hidden' },
        visible: { overflow: 'visible' },
        auto: { overflow: 'auto' },
        scroll: { overflow: 'scroll' },
      },
    },
  },
  'layout-overflow',
);

export type StaticOverflowVariant = NonNullable<RecipeVariants<typeof overflowStyles>['overflow']>;
export type OverflowVariant = ResponsiveProp<StaticOverflowVariant>;
export type OverflowVariants = { overflow?: OverflowVariant };

export const PADDING_VALUES = {
  none: '0px',
  xs: vars.spacing.xs,
  sm: vars.spacing.sm,
  md: vars.spacing.md,
  lg: vars.spacing.lg,
  xl: vars.spacing.xl,
  '2xl': vars.spacing['2xl'],
} as const;

/**
 * Shared 4-sided padding scale with CSS variable propagation for nested calculations.
 */
export const paddingStyles = recipe(
  {
    layer: 'components',
    variants: {
      padding: {
        none: {
          padding: vars.spacing.none,
          '--surface-padding': '0px',
          selectors: {
            '& > *': {
              '--parent-padding': '0px',
            },
          },
        },
        xs: {
          padding: vars.spacing.xs,
          '--surface-padding': vars.spacing.xs,
          selectors: {
            '& > *': {
              '--parent-padding': vars.spacing.xs,
            },
          },
        },
        sm: {
          padding: vars.spacing.sm,
          '--surface-padding': vars.spacing.sm,
          selectors: {
            '& > *': {
              '--parent-padding': vars.spacing.sm,
            },
          },
        },
        md: {
          padding: vars.spacing.md,
          '--surface-padding': vars.spacing.md,
          selectors: {
            '& > *': {
              '--parent-padding': vars.spacing.md,
            },
          },
        },
        lg: {
          padding: vars.spacing.lg,
          '--surface-padding': vars.spacing.lg,
          selectors: {
            '& > *': {
              '--parent-padding': vars.spacing.lg,
            },
          },
        },
        xl: {
          padding: vars.spacing.xl,
          '--surface-padding': vars.spacing.xl,
          selectors: {
            '& > *': {
              '--parent-padding': vars.spacing.xl,
            },
          },
        },
        '2xl': {
          padding: vars.spacing['2xl'],
          '--surface-padding': vars.spacing['2xl'],
          selectors: {
            '& > *': {
              '--parent-padding': vars.spacing['2xl'],
            },
          },
        },
      },
    },
  },
  'layout-padding',
);

export type StaticPaddingVariant = NonNullable<RecipeVariants<typeof paddingStyles>['padding']>;
export type PaddingVariant = ResponsiveProp<StaticPaddingVariant>;
export type PaddingVariants = { padding?: PaddingVariant };

export const RADIUS_VALUES = {
  none: vars.radius.none,
  control: vars.radius.control,
  md: vars.radius.md,
  lg: vars.radius.lg,
  xl: vars.radius.xl,
  '2xl': vars.radius['2xl'],
  full: vars.radius.full,
  auto: 'max(0px, calc(var(--parent-radius, var(--theme-radius-xl)) - var(--parent-padding, 0px)))',
} as const;

/**
 * Shared border-radius scale with concentric nested curve computation.
 */
export const radiusStyles = recipe(
  {
    layer: 'components',
    variants: {
      radius: {
        none: {
          borderRadius: vars.radius.none,
          '--surface-radius': vars.radius.none,
          selectors: {
            '& > *': {
              '--parent-radius': vars.radius.none,
            },
          },
        },
        control: {
          borderRadius: vars.radius.control,
        },
        md: {
          borderRadius: vars.radius.md,
          '--surface-radius': vars.radius.md,
          selectors: {
            '& > *': {
              '--parent-radius': vars.radius.md,
            },
          },
        },
        lg: {
          borderRadius: vars.radius.lg,
          '--surface-radius': vars.radius.lg,
          selectors: {
            '& > *': {
              '--parent-radius': vars.radius.lg,
            },
          },
        },
        xl: {
          borderRadius: vars.radius.xl,
          '--surface-radius': vars.radius.xl,
          selectors: {
            '& > *': {
              '--parent-radius': vars.radius.xl,
            },
          },
        },
        '2xl': {
          borderRadius: vars.radius['2xl'],
          '--surface-radius': vars.radius['2xl'],
          selectors: {
            '& > *': {
              '--parent-radius': vars.radius['2xl'],
            },
          },
        },
        full: {
          borderRadius: vars.radius.full,
          '--surface-radius': vars.radius.full,
          selectors: {
            '& > *': {
              '--parent-radius': vars.radius.full,
            },
          },
        },
        auto: {
          borderRadius:
            'max(0px, calc(var(--parent-radius, var(--theme-radius-xl)) - var(--parent-padding, 0px)))',
        },
      },
    },
  },
  'layout-radius',
);

export type StaticRadiusVariant = NonNullable<RecipeVariants<typeof radiusStyles>['radius']>;
export type RadiusVariant = ResponsiveProp<StaticRadiusVariant>;
export type RadiusVariants = { radius?: RadiusVariant };

export const GAP_VALUES = {
  none: vars.spacing.none,
  '3xs': vars.spacing['3xs'],
  '2xs': vars.spacing['2xs'],
  xs: vars.spacing.xs,
  sm: vars.spacing.sm,
  md: vars.spacing.md,
  lg: vars.spacing.lg,
  xl: vars.spacing.xl,
  '2xl': vars.spacing['2xl'],
} as const;

/**
 * Shared gap scale for flex and grid layouts.
 */
export const gapStyles = recipe(
  {
    layer: 'components',
    variants: {
      gap: {
        none: { gap: vars.spacing.none },
        '3xs': { gap: vars.spacing['3xs'] },
        '2xs': { gap: vars.spacing['2xs'] },
        xs: { gap: vars.spacing.xs },
        sm: { gap: vars.spacing.sm },
        md: { gap: vars.spacing.md },
        lg: { gap: vars.spacing.lg },
        xl: { gap: vars.spacing.xl },
        '2xl': { gap: vars.spacing['2xl'] },
      },
    },
  },
  'layout-gap',
);

export type StaticGapVariant = NonNullable<RecipeVariants<typeof gapStyles>['gap']>;
export type GapVariant = ResponsiveProp<StaticGapVariant>;
export type GapVariants = { gap?: GapVariant };
