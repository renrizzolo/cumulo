import React from 'react';
import { recipe, cx, type RecipeVariants } from '@cumulo/css';
import { vars } from '../contract.js';
import type { ElementProps } from '../ElementProps.js';

export const dividerRecipe = recipe(
  {
    base: {
      border: 'none',
      backgroundColor: vars.surface.border,
      boxSizing: 'border-box',
    },
    variants: {
      orientation: {
        horizontal: {
          height: '1px',
          width: '100%',
        },
        vertical: {
          width: '1px',
          height: '100%',
          alignSelf: 'stretch',
        },
      },
      spacing: {
        none: { margin: 0 },
        xs: { margin: `${vars.spacing.xs} 0` },
        sm: { margin: `${vars.spacing.sm} 0` },
        md: { margin: `${vars.spacing.md} 0` },
        lg: { margin: `${vars.spacing.lg} 0` },
        xl: { margin: `${vars.spacing.xl} 0` },
      },
    },
    defaultVariants: {
      orientation: 'horizontal',
      spacing: 'none',
    },
  },
  'divider',
);

export type DividerVariants = RecipeVariants<typeof dividerRecipe>;

export interface DividerProps extends ElementProps<HTMLHRElement> {
  orientation?: 'horizontal' | 'vertical';
  spacing?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export function Divider({
  orientation = 'horizontal',
  spacing = 'none',
  className,
  ref,
  ...props
}: DividerProps): React.JSX.Element {
  const classes = dividerRecipe({ orientation, spacing });

  return (
    <hr
      ref={ref}
      aria-orientation={orientation}
      className={cx(classes, className)}
      {...props}
    />
  );
}
