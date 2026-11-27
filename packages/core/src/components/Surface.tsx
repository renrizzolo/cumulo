import { recipe, cx, type RecipeVariants } from '@cumulo/css';
import React from 'react';

import { vars } from '../contract.js';
import {
  OVERFLOW_VALUES,
  PADDING_VALUES,
  RADIUS_VALUES,
  overflowStyles,
  paddingStyles,
  radiusStyles,
  type OverflowVariant,
  type PaddingVariant,
  type RadiusVariant,
} from '../layout.js';
import {
  mergeResponsiveStyles,
  respOverflow,
  respPadding,
  respRadius,
  splitResponsive,
} from '../responsive.js';
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
    },
  },
  'surface',
);

type StaticSurfaceVariants = RecipeVariants<typeof surfaceRecipe>;

export type SurfaceVariants = {
  level?: StaticSurfaceVariants['level'];
  bordered?: StaticSurfaceVariants['bordered'];
  variant?: StaticSurfaceVariants['variant'];
  padding?: PaddingVariant;
  radius?: RadiusVariant;
  overflow?: OverflowVariant;
};

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
  radius = 'xl',
  bordered,
  overflow,
  style: styleProp,
  className,
  children,
  ref,
  ...props
}: SurfaceProps): React.JSX.Element {
  const paddingRes = splitResponsive(padding, PADDING_VALUES, '--c-pad', respPadding);
  const radiusRes = splitResponsive(radius, RADIUS_VALUES, '--c-rad', respRadius, 'xl');
  const overflowRes = splitResponsive(overflow, OVERFLOW_VALUES, '--c-ovf', respOverflow);

  const recipeClasses = surfaceRecipe({
    level,
    variant,
    padding: paddingRes.staticValue,
    bordered,
    radius: radiusRes.staticValue,
    overflow: overflowRes.staticValue,
  });

  const mergedStyle = mergeResponsiveStyles(
    styleProp,
    paddingRes.vars,
    radiusRes.vars,
    overflowRes.vars,
  );

  return (
    <Stack
      as={as}
      ref={ref}
      style={mergedStyle}
      className={cx(
        variant === 'primary' && 'surface-primary',
        `surface-${level}`,
        recipeClasses,
        paddingRes.className,
        radiusRes.className,
        overflowRes.className,
        className,
      )}
      {...props}
    >
      {children}
    </Stack>
  );
}
