'use client';

import React from 'react';
import { recipe, cx, type RecipeVariants, style } from '@cumulo/css';
import { vars } from '../contract.js';
import type { ElementProps } from '../ElementProps.js';
import type { GapVariant } from '../layout.js';
import { markerIconBase, markerIconSizes } from './List.js';
import { Text, type TextProps, type TextVariants } from './Text.js';

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
    },
    variants: {
      layout: {
        default: {
          gridTemplateColumns: 'auto minmax(0, 1fr)',
          alignItems: 'baseline',
        },
        horizontal: {
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
        'stacked-horizontal': {
          gridAutoFlow: 'column',
          gridTemplateRows: 'auto auto',
          alignItems: 'baseline',
          selectors: {
            '& > dt:not(:first-child)': {
              marginTop: 0,
            },
            '& > div': {
              gridRow: 'span 2',
              display: 'flex',
              flexDirection: 'column',
              gap: `var(--dl-gap-y, ${vars.spacing.sm})`,
            },
          },
        },
      },
      responsive: {
        true: {
          containerType: 'inline-size',
        },
        false: {},
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
        none: { rowGap: vars.spacing.none, '--dl-gap-y': vars.spacing.none },
        '3xs': { rowGap: vars.spacing['3xs'], '--dl-gap-y': vars.spacing['3xs'] },
        '2xs': { rowGap: vars.spacing['2xs'], '--dl-gap-y': vars.spacing['2xs'] },
        xs: { rowGap: vars.spacing.xs, '--dl-gap-y': vars.spacing.xs },
        sm: { rowGap: vars.spacing.sm, '--dl-gap-y': vars.spacing.sm },
        md: { rowGap: vars.spacing.md, '--dl-gap-y': vars.spacing.md },
        lg: { rowGap: vars.spacing.lg, '--dl-gap-y': vars.spacing.lg },
        xl: { rowGap: vars.spacing.xl, '--dl-gap-y': vars.spacing.xl },
        '2xl': { rowGap: vars.spacing['2xl'], '--dl-gap-y': vars.spacing['2xl'] },
      },
    },
    compoundVariants: [
      {
        variants: { layout: 'default', responsive: true },
        style: {
          '@container': {
            '(max-width: 420px)': {
              gridTemplateColumns: 'minmax(0, 1fr)',
              alignItems: 'start',
            },
          },
        },
      },
      {
        variants: { layout: 'horizontal', responsive: true },
        style: {
          '@container': {
            '(max-width: 420px)': {
              gridTemplateColumns: 'minmax(0, 1fr)',
              alignItems: 'start',
            },
          },
        },
      },
      {
        variants: { layout: 'stacked-horizontal', responsive: true },
        style: {
          '@container': {
            '(max-width: 420px)': {
              gridAutoFlow: 'row',
              gridTemplateColumns: 'minmax(0, 1fr)',
              gridTemplateRows: 'auto',
              alignItems: 'start',
            },
          },
        },
      },
    ],
    defaultVariants: {
      layout: 'default',
      responsive: true,
      ...GAP_PRESETS['sm'],
    },
  },
  'description-list',
);

const descriptionListItemRecipe = recipe(
  {
    base: {
      display: 'flex',
      flexDirection: 'column',
      gap: `var(--dl-gap-y, ${vars.spacing.sm})`,
      margin: 0,
      padding: 0,
    },
    variants: {
      orientation: {
        vertical: {
          display: 'flex',
          flexDirection: 'column',
          gap: `var(--dl-gap-y, ${vars.spacing.sm})`,
        },
        horizontal: {
          gridRow: 'span 2',
          display: 'flex',
          flexDirection: 'column',
          gap: `var(--dl-gap-y, ${vars.spacing.sm})`,
          '@supports': {
            '(grid-template-rows: subgrid)': {
              display: 'grid',
              gridTemplateRows: 'subgrid',
              rowGap: `var(--dl-gap-y, ${vars.spacing.sm})`,
            },
          },
          '@container': {
            '(max-width: 420px)': {
              gridRow: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: `var(--dl-gap-y, ${vars.spacing.sm})`,
            },
          },
        },
      },
    },
    defaultVariants: {
      orientation: 'vertical',
    },
  },
  'description-list-item',
);

const descriptionListTermStyle = style(
  {
    display: 'inline-flex',
    alignItems: 'baseline',
    gap: vars.spacing.xs,
    margin: 0,
    padding: 0,
  },
  'description-list-term',
);

const descriptionListDescriptionStyle = style(
  {
    margin: 0,
    padding: 0,
    minWidth: 0,
  },
  'description-list-description',
);

const descriptionListIconRecipe = recipe(
  {
    base: markerIconBase,
    variants: {
      size: markerIconSizes,
    },
    defaultVariants: {
      size: 'md',
    },
  },
  'description-list-icon',
);

export type DescriptionListVariants = RecipeVariants<typeof descriptionListRecipe>;
export type DescriptionListItemVariants = RecipeVariants<typeof descriptionListItemRecipe>;
export type DescriptionListIconVariants = RecipeVariants<typeof descriptionListIconRecipe>;

interface DescriptionListContextValue {
  orientation: 'vertical' | 'horizontal';
  size?: TextVariants['size'];
}

const DescriptionListContext = React.createContext<DescriptionListContextValue>({
  orientation: 'vertical',
});

function mapFontSizeToIconSize(size?: TextVariants['size']): DescriptionListIconVariants['size'] {
  if (size === '2xs' || size === 'xs' || size === 'sm') return 'sm';
  if (size === 'lg' || size === 'xl' || size === '2xl' || size === '3xl') return 'lg';
  return 'md';
}

export interface DescriptionListRootProps extends ElementProps<HTMLDListElement> {
  /**
   * Proportional gap preset where the x-axis gap is wider than the y-axis gap.
   * @default 'sm'
   */
  gap?: GapVariant;
  /**
   * Explicit horizontal column gap spacing between terms and descriptions.
   * Overrides the horizontal gap from `gap`.
   */
  gapX?: GapVariant;
  /**
   * Explicit vertical row gap spacing between items.
   * Overrides the vertical gap from `gap`.
   */
  gapY?: GapVariant;
  /**
   * Layout arrangement for the description list.
   * - `'default'` / `'horizontal'`: Term and description are placed horizontally side-by-side.
   * - `'stacked'`: Term is placed on top of description.
   * - `'stacked-horizontal'`: Stacked items (term on top of description) are arranged horizontally in columns.
   * @default 'default'
   */
  layout?: DescriptionListVariants['layout'];
  /**
   * Orientation of stacked items when `layout="stacked"`.
   * When set to `'horizontal'`, stacked items are laid out horizontally in columns.
   * @default 'vertical'
   */
  orientation?: 'vertical' | 'horizontal';
  /**
   * Whether horizontal layouts should responsively collapse to stacked on smaller viewports.
   * @default true
   */
  responsive?: boolean;
  /**
   * Font size primitive applied to child terms and descriptions.
   */
  size?: TextVariants['size'];
  className?: string;
  children?: React.ReactNode;
}

export interface DescriptionListItemProps extends ElementProps<HTMLDivElement> {
  className?: string;
  children?: React.ReactNode;
}

export interface DescriptionListTermBaseProps extends Omit<TextProps, 'as'> {
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

export interface DescriptionListDescriptionProps extends Omit<TextProps, 'as'> {
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
  layout = 'default',
  orientation = 'vertical',
  responsive = true,
  size,
  className,
  children,
  ref,
  ...props
}: DescriptionListRootProps): React.JSX.Element {
  const preset = gap ? GAP_PRESETS[gap] : undefined;
  const resolvedGapX = gapX ?? preset?.gapX ?? 'lg';
  const resolvedGapY = gapY ?? preset?.gapY ?? 'sm';

  const isStackedHorizontal =
    layout === 'stacked-horizontal' || (layout === 'stacked' && orientation === 'horizontal');

  const resolvedLayout: DescriptionListVariants['layout'] = isStackedHorizontal
    ? 'stacked-horizontal'
    : layout;

  const resolvedOrientation: 'vertical' | 'horizontal' = isStackedHorizontal
    ? 'horizontal'
    : orientation;

  const contextValue = React.useMemo(
    (): DescriptionListContextValue => ({
      orientation: resolvedOrientation,
      size,
    }),
    [resolvedOrientation, size],
  );

  return (
    <DescriptionListContext value={contextValue}>
      <dl
        ref={ref}
        className={cx(
          descriptionListRecipe({
            layout: resolvedLayout,
            responsive,
            gapX: resolvedGapX,
            gapY: resolvedGapY,
          }),
          className,
        )}
        {...props}
      >
        {children}
      </dl>
    </DescriptionListContext>
  );
}

function DescriptionListItem({
  className,
  children,
  ref,
  ...props
}: DescriptionListItemProps): React.JSX.Element {
  const { orientation } = React.useContext(DescriptionListContext);

  return (
    <div ref={ref} className={cx(descriptionListItemRecipe({ orientation }), className)} {...props}>
      {children}
    </div>
  );
}

function DescriptionListIcon({
  size,
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
  iconSize: iconSizeProp,
  size: sizeProp,
  weight: weightProp,
  className,
  children,
  ref,
  ...props
}: DescriptionListTermProps): React.JSX.Element {
  const context = React.useContext(DescriptionListContext);
  const size = sizeProp ?? context.size;
  const weight = weightProp ?? 'semibold';
  const iconSize = iconSizeProp ?? mapFontSizeToIconSize(size);

  return (
    <Text
      as="dt"
      ref={ref}
      size={size}
      weight={weight}
      className={cx(descriptionListTermStyle, className)}
      {...props}
    >
      {icon !== undefined ? (
        <DescriptionListIcon size={iconSize}>{icon}</DescriptionListIcon>
      ) : null}
      {children}
    </Text>
  );
}

function DescriptionListDescription({
  size: sizeProp,
  weight: weightProp,
  className,
  children,
  ref,
  ...props
}: DescriptionListDescriptionProps): React.JSX.Element {
  const context = React.useContext(DescriptionListContext);
  const size = sizeProp ?? context.size;
  const weight = weightProp ?? 'normal';

  return (
    <Text
      as="dd"
      ref={ref}
      size={size}
      weight={weight}
      className={cx(descriptionListDescriptionStyle, className)}
      {...props}
    >
      {children}
    </Text>
  );
}

DescriptionListRoot.displayName = 'DescriptionList.Root';
DescriptionListItem.displayName = 'DescriptionList.Item';
DescriptionListTerm.displayName = 'DescriptionList.Term';
DescriptionListDescription.displayName = 'DescriptionList.Description';
DescriptionListIcon.displayName = 'DescriptionList.Icon';

export {
  DescriptionListRoot as Root,
  DescriptionListItem as Item,
  DescriptionListTerm as Term,
  DescriptionListDescription as Description,
  DescriptionListIcon as Icon,
  DescriptionListRoot,
  DescriptionListItem,
  DescriptionListTerm,
  DescriptionListDescription,
  DescriptionListIcon,
};

export type {
  DescriptionListRootProps as RootProps,
  DescriptionListItemProps as ItemProps,
  DescriptionListTermProps as TermProps,
  DescriptionListDescriptionProps as DescriptionProps,
  DescriptionListIconProps as IconProps,
  DescriptionListVariants as RootVariants,
  DescriptionListItemVariants as ItemVariants,
  DescriptionListIconVariants as IconVariants,
};
