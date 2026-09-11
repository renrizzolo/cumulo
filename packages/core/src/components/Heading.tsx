import React from 'react';
import { recipe, cx, type RecipeVariants } from '@cumulo/css';
import { vars } from '../contract.js';
import type { ElementProps } from '../ElementProps.js';
import { textSharedRecipe } from '../typography.js';

export const headingRecipe = recipe(
  {
    extend: [textSharedRecipe],
    variants: {
      size: {
        xs: {
          fontSize: vars.font.size.xs,
          letterSpacing: '0.02em',
        },
        sm: {
          fontSize: vars.font.size.sm,
          letterSpacing: '0.01em',
        },
        md: {
          fontSize: vars.font.size.md,
          letterSpacing: '0',
        },
        lg: {
          fontSize: vars.font.size.lg,
          letterSpacing: '-0.01em',
        },
        xl: {
          fontSize: vars.font.size.xl,
          letterSpacing: '-0.015em',
        },
        '2xl': {
          fontSize: vars.font.size['2xl'],
          letterSpacing: '-0.02em',
        },
        '3xl': {
          fontSize: vars.font.size['3xl'],
          letterSpacing: '-0.025em',
        },
        '4xl': {
          fontSize: vars.font.size['4xl'],
          letterSpacing: '-0.03em',
        },
      },
    },
    defaultVariants: {
      size: 'xl',
      weight: 'bold',
      color: 'default',
    },
  },
  'heading',
);

export type HeadingVariants = RecipeVariants<typeof headingRecipe>;

export type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div' | 'span';

export interface HeadingProps extends ElementProps<HTMLElement> {
  as?: HeadingLevel;
  size?: HeadingVariants['size'];
  weight?: HeadingVariants['weight'];
  color?: HeadingVariants['color'];
  children?: React.ReactNode;
}

const defaultSizeForLevel: Record<string, HeadingProps['size']> = {
  h1: '3xl',
  h2: '2xl',
  h3: 'xl',
  h4: 'lg',
  h5: 'md',
  h6: 'sm',
  div: 'xl',
  span: 'xl',
};

export function Heading({
  as: Component = 'h2',
  size,
  weight = 'bold',
  color = 'default',
  className,
  children,
  ref,
  ...props
}: HeadingProps): React.JSX.Element {
  const resolvedSize = size ?? defaultSizeForLevel[Component] ?? 'xl';
  const classes = headingRecipe({ size: resolvedSize, weight, color });

  return React.createElement(
    Component,
    {
      ref,
      className: cx(classes, className),
      ...props,
    },
    children,
  );
}
