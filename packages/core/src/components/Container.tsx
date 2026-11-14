import React from 'react';
import { recipe, cx, type RecipeVariants } from '@cumulo/css';
import { vars } from '../contract.js';
import type { ElementProps } from '../ElementProps.js';

const containerRecipe = recipe(
  {
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
    defaultVariants: {
      size: 'lg',
      padding: 'md',
    },
  },
  'container',
);

export type ContainerVariants = RecipeVariants<typeof containerRecipe>;

export interface ContainerProps extends ElementProps<HTMLDivElement> {
  size?: ContainerVariants['size'];
  padding?: ContainerVariants['padding'];
  children?: React.ReactNode;
}

export function Container({
  size = 'lg',
  padding = 'md',
  className,
  children,
  ref,
  ...props
}: ContainerProps): React.JSX.Element {
  const classes = containerRecipe({ size, padding });

  return (
    <div ref={ref} className={cx(classes, className)} {...props}>
      {children}
    </div>
  );
}
