'use client';

import React from 'react';
import { recipe, cx, type RecipeVariants, style } from '@cumulo/css';
import { vars } from '../contract.js';
import type { ElementProps } from '../ElementProps.js';
import type { GapVariant } from '../layout.js';

const GAP_PRESETS: Record<
  NonNullable<GapVariant>,
  { gapX: NonNullable<GapVariant>; gapY: NonNullable<GapVariant> }
> = {
  none: { gapX: 'none', gapY: 'none' },
  '3xs': { gapX: '2xs', gapY: '3xs' },
  '2xs': { gapX: 'xs', gapY: '2xs' },
  xs: { gapX: 'md', gapY: 'xs' },
  sm: { gapX: 'lg', gapY: 'sm' },
  md: { gapX: 'xl', gapY: 'md' },
  lg: { gapX: '2xl', gapY: 'lg' },
  xl: { gapX: '2xl', gapY: 'xl' },
  '2xl': { gapX: '2xl', gapY: '2xl' },
};

const descriptionListRecipe = recipe(
  {
    base: {
      display: 'grid',
      margin: 0,
      padding: 0,
      fontFamily: vars.font.sans,
    },
    variants: {
      layout: {
        default: {
          gridTemplateColumns: 'auto minmax(0, 1fr)',
          alignItems: 'baseline',
        },
        stacked: {
          gridTemplateColumns: 'minmax(0, 1fr)',
          alignItems: 'start',
          selectors: {
            '& > dt:not(:first-child)': {
              marginTop: vars.spacing.sm,
            },
          },
        },
      },
      gapX: {
        none: { columnGap: vars.spacing.none },
        '3xs': { columnGap: vars.spacing['3xs'] },
        '2xs': { columnGap: vars.spacing['2xs'] },
        xs: { columnGap: vars.spacing.xs },
        sm: { columnGap: vars.spacing.sm },
        md: { columnGap: vars.spacing.md },
        lg: { columnGap: vars.spacing.lg },
        xl: { columnGap: vars.spacing.xl },
        '2xl': { columnGap: vars.spacing['2xl'] },
      },
      gapY: {
        none: { rowGap: vars.spacing.none },
        '3xs': { rowGap: vars.spacing['3xs'] },
        '2xs': { rowGap: vars.spacing['2xs'] },
        xs: { rowGap: vars.spacing.xs },
        sm: { rowGap: vars.spacing.sm },
        md: { rowGap: vars.spacing.md },
        lg: { rowGap: vars.spacing.lg },
        xl: { rowGap: vars.spacing.xl },
        '2xl': { rowGap: vars.spacing['2xl'] },
      },
    },
    defaultVariants: {
      layout: 'default',
      gapX: 'lg',
      gapY: 'sm',
    },
  },
  'description-list',
);

const descriptionListTermStyle = style(
  {
    display: 'inline-flex',
    alignItems: 'baseline',
    gap: vars.spacing.xs,
    margin: 0,
    padding: 0,
    fontFamily: vars.font.sans,
    fontWeight: vars.font.weight.semibold,
    color: vars.surface.fg,
    lineHeight: vars.line.height.normal,
  },
  'description-list-term',
);

const descriptionListDescriptionStyle = style(
  {
    margin: 0,
    padding: 0,
    fontFamily: vars.font.sans,
    fontWeight: vars.font.weight.normal,
    color: vars.surface.fg,
    lineHeight: vars.line.height.normal,
    minWidth: 0,
  },
  'description-list-description',
);

const descriptionListIconRecipe = recipe(
  {
    base: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      lineHeight: vars.line.height.none,
      userSelect: 'none',
    },
    variants: {
      size: {
        sm: {
          width: vars.size['3xs'],
          height: vars.size['3xs'],
          fontSize: vars.font.size.sm,
        },
        md: {
          width: vars.size['2xs'],
          height: vars.size['2xs'],
          fontSize: vars.font.size.base,
        },
        lg: {
          width: vars.size.xs,
          height: vars.size.xs,
          fontSize: vars.font.size.lg,
        },
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
  'description-list-icon',
);

export type DescriptionListVariants = RecipeVariants<typeof descriptionListRecipe>;
export type DescriptionListIconVariants = RecipeVariants<typeof descriptionListIconRecipe>;

export interface DescriptionListRootProps extends ElementProps<HTMLDListElement> {
  /**
   * Proportional gap preset where the x-axis gap is wider than the y-axis gap.
   * @default 'sm'
   */
  gap?: GapVariant;
  /**
   * Explicit horizontal column gap spacing between terms and descriptions.
   * Overrides the horizontal gap from `gap`.
   * @default 'lg'
   */
  gapX?: GapVariant;
  /**
   * Explicit vertical row gap spacing between items.
   * Overrides the vertical gap from `gap`.
   * @default 'sm'
   */
  gapY?: GapVariant;
  /**
   * Layout arrangement for the description list.
   * @default 'grid'
   */
  layout?: DescriptionListVariants['layout'];
  className?: string;
  children?: React.ReactNode;
}

export interface DescriptionListTermBaseProps extends ElementProps<HTMLElement> {
  className?: string;
  children?: React.ReactNode;
}

export interface DescriptionListTermIconProps {
  /**
   * Icon or emoji marker displayed before the term text.
   */
  icon: React.ReactNode;
  /**
   * Size of the icon marker.
   * @default 'md'
   */
  iconSize?: DescriptionListIconVariants['size'];
}

export interface DescriptionListTermNoIconProps {
  icon?: never;
  iconSize?: never;
}

export type DescriptionListTermProps = DescriptionListTermBaseProps &
  (DescriptionListTermIconProps | DescriptionListTermNoIconProps);

export interface DescriptionListDescriptionProps extends ElementProps<HTMLElement> {
  className?: string;
  children?: React.ReactNode;
}

export interface DescriptionListIconProps extends ElementProps<HTMLSpanElement> {
  /**
   * Size of the icon marker.
   * @default 'md'
   */
  size?: DescriptionListIconVariants['size'];
  className?: string;
  children?: React.ReactNode;
}

function DescriptionListRoot({
  gap,
  gapX,
  gapY,
  layout,
  className,
  children,
  ref,
  ...props
}: DescriptionListRootProps): React.JSX.Element {
  const preset = gap ? GAP_PRESETS[gap] : undefined;
  const resolvedGapX = gapX ?? preset?.gapX ?? 'lg';
  const resolvedGapY = gapY ?? preset?.gapY ?? 'sm';

  return React.createElement(
    'dl',
    {
      ref,
      className: cx(
        descriptionListRecipe({
          layout,
          gapX: resolvedGapX,
          gapY: resolvedGapY,
        }),
        className,
      ),
      ...props,
    },
    children,
  );
}

function DescriptionListIcon({
  size = 'md',
  className,
  children,
  ref,
  ...props
}: DescriptionListIconProps): React.JSX.Element {
  return (
    <span
      ref={ref}
      aria-hidden="true"
      className={cx(descriptionListIconRecipe({ size }), className)}
      {...props}
    >
      {children}
    </span>
  );
}

function DescriptionListTerm({
  icon,
  iconSize = 'md',
  className,
  children,
  ref,
  ...props
}: DescriptionListTermProps): React.JSX.Element {
  return (
    <dt ref={ref} className={cx(descriptionListTermStyle, className)} {...props}>
      {icon !== undefined ? (
        <DescriptionListIcon size={iconSize}>{icon}</DescriptionListIcon>
      ) : null}
      {children}
    </dt>
  );
}

function DescriptionListDescription({
  className,
  children,
  ref,
  ...props
}: DescriptionListDescriptionProps): React.JSX.Element {
  return (
    <dd ref={ref} className={cx(descriptionListDescriptionStyle, className)} {...props}>
      {children}
    </dd>
  );
}

DescriptionListRoot.displayName = 'DescriptionList.Root';
DescriptionListTerm.displayName = 'DescriptionList.Term';
DescriptionListDescription.displayName = 'DescriptionList.Description';
DescriptionListIcon.displayName = 'DescriptionList.Icon';

export {
  DescriptionListRoot as Root,
  DescriptionListTerm as Term,
  DescriptionListDescription as Description,
  DescriptionListIcon as Icon,
  DescriptionListRoot,
  DescriptionListTerm,
  DescriptionListDescription,
  DescriptionListIcon,
};

export type {
  DescriptionListRootProps as RootProps,
  DescriptionListTermProps as TermProps,
  DescriptionListDescriptionProps as DescriptionProps,
  DescriptionListIconProps as IconProps,
  DescriptionListVariants as RootVariants,
  DescriptionListIconVariants as IconVariants,
};
