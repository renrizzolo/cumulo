import React from 'react';
import { recipe, cx, type RecipeVariants } from '@cumulo/css';
import { vars } from '../contract.js';
import type { ElementProps } from '../ElementProps.js';
import { flexStyles, overflowStyles, paddingStyles, radiusStyles } from '../layout.js';

export const surfaceRecipe = recipe(
  {
    extend: [flexStyles, overflowStyles, paddingStyles, radiusStyles],
    base: {
      display: 'flex',
      flexDirection: 'column',
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
      padding: 'none',
      radius: 'xl',
    },
  },
  'surface',
);

export type SurfaceVariants = RecipeVariants<typeof surfaceRecipe>;

export interface SurfaceProps extends ElementProps<HTMLDivElement> {
  level?: SurfaceVariants['level'];
  variant?: SurfaceVariants['variant'];
  padding?: SurfaceVariants['padding'];
  radius?: SurfaceVariants['radius'];
  flex?: SurfaceVariants['flex'];
  overflow?: SurfaceVariants['overflow'];
  children?: React.ReactNode;
}

export function Surface({
  level = 1,
  variant = 'default',
  padding = 'none',
  radius,
  flex,
  overflow,
  className,
  children,
  ref,
  ...props
}: SurfaceProps): React.JSX.Element {
  const surfaceClass = variant === 'primary' ? 'surface-primary' : `surface-${level}`;
  const recipeClasses = surfaceRecipe({ level, variant, padding, radius, flex, overflow });

  return (
    <div ref={ref} className={cx(surfaceClass, recipeClasses, className)} {...props}>
      {children}
    </div>
  );
}
