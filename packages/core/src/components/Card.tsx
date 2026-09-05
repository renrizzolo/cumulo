import React from 'react';
import { recipe, cx, type RecipeVariants } from '@cumulo/css';
import { vars } from '../contract.js';
import type { ElementProps } from '../ElementProps.js';
import { flexStyles, overflowStyles, paddingStyles, radiusStyles } from '../layout.js';
import { Surface, type SurfaceProps } from './Surface.js';

export const cardRecipe = recipe(
  {
    extend: [flexStyles, overflowStyles, paddingStyles, radiusStyles],
    base: {
      borderWidth: 1,
      borderStyle: 'solid',
      borderColor: vars.surface.border,
      boxShadow: vars.shadow['0'],
    },
    variants: {},
    defaultVariants: {
      padding: 'md',
      overflow: 'hidden',
      radius: 'lg',
    },
  },
  'card',
);

export type CardVariants = RecipeVariants<typeof cardRecipe>;

export interface CardProps extends ElementProps<HTMLDivElement> {
  level?: SurfaceProps['level'];
  variant?: SurfaceProps['variant'];
  padding?: CardVariants['padding'];
  overflow?: CardVariants['overflow'];
  flex?: CardVariants['flex'];
  radius?: CardVariants['radius'];
  children?: React.ReactNode;
}

export function Card({
  level = 1,
  variant = 'default',
  padding = 'md',
  overflow = 'hidden',
  flex,
  radius = 'lg',
  className,
  children,
  ref,
  ...props
}: CardProps): React.JSX.Element {
  const classes = cardRecipe({ padding, overflow, flex, radius });

  return (
    <Surface
      ref={ref}
      level={level}
      variant={variant}
      padding={padding}
      radius={radius}
      overflow={overflow}
      flex={flex}
      className={cx(classes, className)}
      {...props}
    >
      {children}
    </Surface>
  );
}
