import React from 'react';
import { recipe, cx, type RecipeVariants } from '@cumulo/css';
import { vars } from '../contract.js';
import type { ElementProps } from '../ElementProps.js';
import { Surface, type SurfaceProps } from './Surface.js';

export const cardRecipe = recipe(
  {
    base: {
      borderRadius: vars.radius.lg,
      borderWidth: 1,
      borderStyle: 'solid',
      borderColor: vars.surface.border,
      boxShadow: vars.shadow['0'],
    },
    variants: {
      padding: {
        none: { padding: vars.spacing.none },
        xs: { padding: vars.spacing.xs },
        sm: { padding: vars.spacing.sm },
        md: { padding: vars.spacing.md },
        lg: { padding: vars.spacing.lg },
        xl: { padding: vars.spacing.xl },
        '2xl': { padding: vars.spacing['2xl'] },
      },
    },
    defaultVariants: {
      padding: 'md',
    },
  },
  'card',
);

export type CardVariants = RecipeVariants<typeof cardRecipe>;

export interface CardProps extends ElementProps<HTMLDivElement> {
  level?: SurfaceProps['level'];
  variant?: SurfaceProps['variant'];
  padding?: CardVariants['padding'];
  children?: React.ReactNode;
}

export function Card({
  level = 1,
  variant = 'default',
  padding = 'md',
  className,
  children,
  ref,
  ...props
}: CardProps): React.JSX.Element {
  const classes = cardRecipe({ padding });

  return (
    <Surface
      ref={ref}
      level={level}
      variant={variant}
      className={cx(classes, className)}
      {...props}
    >
      {children}
    </Surface>
  );
}
