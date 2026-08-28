import React from 'react';
import { recipe, cx } from '@cumulo/css';
import { vars } from '../contract.js';
import { Surface, SurfaceProps } from './Surface.js';

export const cardRecipe = recipe(
  {
    base: {
      display: 'flex',
      flexDirection: 'column',
    },
    variants: {
      padding: {
        none: { padding: 0 },
        sm: { padding: vars.spacing.sm },
        md: { padding: vars.spacing.md },
        lg: { padding: vars.spacing.lg },
      },
    },
    defaultVariants: {
      padding: 'md',
    },
  },
  'card',
);

export interface CardProps extends SurfaceProps {
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({
  level = 1,
  padding = 'md',
  variant = 'default',
  className,
  children,
  ref,
  ...props
}: CardProps) {
  const cardClasses = cardRecipe({ padding });

  return (
    <Surface
      ref={ref}
      level={level}
      variant={variant}
      className={cx(cardClasses, className)}
      {...props}
    >
      {children}
    </Surface>
  );
}
