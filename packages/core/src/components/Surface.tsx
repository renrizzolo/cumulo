import React from 'react';
import { recipe, cx, type RecipeVariants } from '@cumulo/css';
import { vars } from '../contract.js';
import { ElementProps } from '../ElementProps.js';

export const surfaceRecipe = recipe(
  {
    base: {
      borderRadius: vars.radius.xl,
      borderWidth: 1,
      borderStyle: 'solid',
      borderColor: vars.surface.border,
      backgroundColor: vars.surface.bg.DEFAULT,
      color: vars.surface.fg,
      boxShadow: vars.surface.shadow,
      transition: `background-color ${vars.duration.fast} ${vars.ease.default}, border-color ${vars.duration.fast} ${vars.ease.default}`,
    },
    variants: {
      level: {
        0: {},
        1: {},
        2: {},
      },
      variant: {
        default: {},
        primary: {
          backgroundColor: vars.surface.primary.DEFAULT,
          color: vars.surface.primary.fg,
          borderColor: vars.surface.primary.border,
        },
      },
    },
    defaultVariants: {
      level: 1,
      variant: 'default',
    },
  },
  'surface',
);

export type SurfaceVariants = RecipeVariants<typeof surfaceRecipe>;

export interface SurfaceProps extends ElementProps<HTMLDivElement> {
  level?: 0 | 1 | 2;
  variant?: 'default' | 'primary';
  children?: React.ReactNode;
}

export function Surface({
  level = 1,
  variant = 'default',
  className,
  children,
  ref,
  ...props
}: SurfaceProps) {
  const surfaceClass = variant === 'primary' ? 'surface-primary' : `surface-${level}`;
  const recipeClasses = surfaceRecipe({ level, variant });

  return (
    <div ref={ref} className={cx(surfaceClass, recipeClasses, className)} {...props}>
      {children}
    </div>
  );
}
