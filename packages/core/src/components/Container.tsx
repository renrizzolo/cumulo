import React from 'react';
import { recipe, cx, type RecipeVariants } from '@cumulo/css';
import { vars } from '../contract.js';
import type { ElementProps } from '../ElementProps.js';

export const containerRecipe = recipe(
  {
    base: {
      width: '100%',
      boxSizing: 'border-box',
      marginLeft: 'auto',
      marginRight: 'auto',
    },
    variants: {
      size: {
        sm: { maxWidth: '640px' },
        md: { maxWidth: '768px' },
        lg: { maxWidth: '1024px' },
        xl: { maxWidth: '1280px' },
        full: { maxWidth: '100%' },
      },
      padding: {
        none: { paddingLeft: 0, paddingRight: 0 },
        xs: { paddingLeft: vars.spacing.xs, paddingRight: vars.spacing.xs },
        sm: { paddingLeft: vars.spacing.sm, paddingRight: vars.spacing.sm },
        md: { paddingLeft: vars.spacing.md, paddingRight: vars.spacing.md },
        lg: { paddingLeft: vars.spacing.lg, paddingRight: vars.spacing.lg },
        xl: { paddingLeft: vars.spacing.xl, paddingRight: vars.spacing.xl },
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
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
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
