import { recipe, type RecipeVariants } from '@cumulo/css';
import { vars } from './contract.js';

/**
 * Shared flex variants for layout primitives (Surface, Stack, Card).
 */
export const flexStyles = recipe(
  {
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

export type FlexVariants = RecipeVariants<typeof flexStyles>;
export type FlexVariant = FlexVariants['flex'];

/**
 * Shared overflow variants for layout primitives (Surface, Card).
 */
export const overflowStyles = recipe(
  {
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

export type OverflowVariants = RecipeVariants<typeof overflowStyles>;
export type OverflowVariant = OverflowVariants['overflow'];

/**
 * Shared 4-sided padding scale with CSS variable propagation for nested calculations.
 */
export const paddingStyles = recipe(
  {
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

export type PaddingVariants = RecipeVariants<typeof paddingStyles>;
export type PaddingVariant = PaddingVariants['padding'];

/**
 * Shared border-radius scale with concentric nested curve computation.
 */
export const radiusStyles = recipe(
  {
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

export type RadiusVariants = RecipeVariants<typeof radiusStyles>;
export type RadiusVariant = RadiusVariants['radius'];

/**
 * Shared gap scale for flex and grid layouts.
 */
export const gapStyles = recipe(
  {
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

export type GapVariants = RecipeVariants<typeof gapStyles>;
export type GapVariant = GapVariants['gap'];
