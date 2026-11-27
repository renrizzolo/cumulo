import { recipe, cx, type RecipeVariants } from '@cumulo/css';
import React from 'react';

import { vars } from '../contract.js';
import type { ElementProps } from '../ElementProps.js';
import {
  mergeResponsiveStyles,
  respMaxWidth,
  respPaddingInline,
  splitResponsive,
  type ResponsiveProp,
} from '../responsive.js';

const CONTAINER_SIZE_VALUES = {
  sm: vars.container.sm,
  md: vars.container.md,
  lg: vars.container.lg,
  xl: vars.container.xl,
  '2xl': vars.container['2xl'],
  full: '100%',
} as const;

const CONTAINER_PADDING_VALUES = {
  none: '0px',
  xs: vars.spacing.xs,
  sm: vars.spacing.sm,
  md: vars.spacing.md,
  lg: vars.spacing.lg,
  xl: vars.spacing.xl,
} as const;

const containerRecipe = recipe(
  {
    layer: 'components',
    base: {
      width: '100%',
      boxSizing: 'border-box',
      marginLeft: 'auto',
      marginRight: 'auto',
    },
    variants: {
      size: {
        sm: { maxWidth: vars.container.sm },
        md: { maxWidth: vars.container.md },
        lg: { maxWidth: vars.container.lg },
        xl: { maxWidth: vars.container.xl },
        '2xl': { maxWidth: vars.container['2xl'] },
        full: { maxWidth: '100%' },
      },
      padding: {
        none: { paddingInline: 0 },
        xs: { paddingInline: vars.spacing.xs },
        sm: { paddingInline: vars.spacing.sm },
        md: { paddingInline: vars.spacing.md },
        lg: { paddingInline: vars.spacing.lg },
        xl: { paddingInline: vars.spacing.xl },
      },
    },
  },
  'container',
);

type StaticContainerVariants = RecipeVariants<typeof containerRecipe>;

export type ContainerVariants = {
  size?: ResponsiveProp<NonNullable<StaticContainerVariants['size']>>;
  padding?: ResponsiveProp<NonNullable<StaticContainerVariants['padding']>>;
};

export interface ContainerProps extends ElementProps<HTMLDivElement> {
  size?: ContainerVariants['size'];
  padding?: ContainerVariants['padding'];
  children?: React.ReactNode;
}

export function Container({
  size = 'lg',
  padding = 'md',
  style: styleProp,
  className,
  children,
  ref,
  ...props
}: ContainerProps): React.JSX.Element {
  const sizeRes = splitResponsive(size, CONTAINER_SIZE_VALUES, '--c-mw', respMaxWidth, 'lg');
  const paddingRes = splitResponsive(
    padding,
    CONTAINER_PADDING_VALUES,
    '--c-pi',
    respPaddingInline,
    'md',
  );

  const classes = containerRecipe({
    size: sizeRes.staticValue,
    padding: paddingRes.staticValue,
  });

  const mergedStyle = mergeResponsiveStyles(styleProp, sizeRes.vars, paddingRes.vars);

  return (
    <div
      ref={ref}
      style={mergedStyle}
      className={cx(classes, sizeRes.className, paddingRes.className, className)}
      {...props}
    >
      {children}
    </div>
  );
}
