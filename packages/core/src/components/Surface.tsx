import { recipe, cx, type RecipeVariants } from '@cumulo/css';
import React from 'react';

import { vars } from '../contract.js';
import { overflowStyles, paddingStyles, radiusStyles } from '../layout.js';
import { Stack, type StackProps } from './Stack.js';

const surfaceRecipe = recipe(
  {
    layer: 'components',
    extend: [overflowStyles, paddingStyles, radiusStyles],
    base: {
      backgroundColor: vars.surface.bg.DEFAULT,
      backgroundImage: vars.surface.bg.image,
      color: vars.surface.fg,
      transition: `background-color ${vars.duration.fast} ${vars.ease.default}, border-color ${vars.duration.fast} ${vars.ease.default}`,
    },
    variants: {
      level: {
        0: {},
        1: {},
        2: {},
      },
      bordered: {
        true: {
          borderWidth: vars.surface.stroke.width,
          borderStyle: 'solid',
          borderColor: vars.surface.border,
          boxShadow: vars.surface.shadow,
        },
        false: {
          borderWidth: 0,
        },
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
      level: 0,
      bordered: true,
      variant: 'default',
      radius: 'xl',
    },
  },
  'surface',
);

export type SurfaceVariants = RecipeVariants<typeof surfaceRecipe>;

export type SurfaceTag =
  | 'div'
  | 'section'
  | 'article'
  | 'header'
  | 'footer'
  | 'nav'
  | 'aside'
  | 'main';

export interface SurfaceProps extends Omit<StackProps, 'as'> {
  as?: SurfaceTag;
  /** Sometimes it's desired to have the background colour only. */
  bordered?: SurfaceVariants['bordered'];
  level?: SurfaceVariants['level'];
  variant?: SurfaceVariants['variant'];
  padding?: SurfaceVariants['padding'];
  radius?: SurfaceVariants['radius'];
  overflow?: SurfaceVariants['overflow'];
  children?: React.ReactNode;
}

export function Surface({
  as = 'div',
  level = 1,
  variant,
  padding,
  radius,
  bordered,
  overflow,
  className,
  children,
  ref,
  ...props
}: SurfaceProps): React.JSX.Element {
  const recipeClasses = surfaceRecipe({
    level,
    variant,
    padding,
    bordered,
    radius,
    overflow,
  });

  return (
    <Stack
      as={as}
      ref={ref}
      className={cx(
        variant === 'primary' && 'surface-primary',
        `surface-${level}`,
        recipeClasses,
        className,
      )}
      {...props}
    >
      {children}
    </Stack>
  );
}
