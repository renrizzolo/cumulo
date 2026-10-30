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
        xs: {},
        sm: {},
        md: {},
        lg: {},
        xl: {},
      },
    },
    compoundVariants: [
      {
        variants: { orientation: 'horizontal', spacing: 'xs' },
        style: { margin: `${vars.spacing.xs} 0` },
      },
      {
        variants: { orientation: 'horizontal', spacing: 'sm' },
        style: { margin: `${vars.spacing.sm} 0` },
      },
      {
        variants: { orientation: 'horizontal', spacing: 'md' },
        style: { margin: `${vars.spacing.md} 0` },
      },
      {
        variants: { orientation: 'horizontal', spacing: 'lg' },
        style: { margin: `${vars.spacing.lg} 0` },
      },
      {
        variants: { orientation: 'horizontal', spacing: 'xl' },
        style: { margin: `${vars.spacing.xl} 0` },
      },
      {
        variants: { orientation: 'vertical', spacing: 'xs' },
        style: { margin: `0 ${vars.spacing.xs}` },
      },
      {
        variants: { orientation: 'vertical', spacing: 'sm' },
        style: { margin: `0 ${vars.spacing.sm}` },
      },
      {
        variants: { orientation: 'vertical', spacing: 'md' },
        style: { margin: `0 ${vars.spacing.md}` },
      },
      {
        variants: { orientation: 'vertical', spacing: 'lg' },
        style: { margin: `0 ${vars.spacing.lg}` },
      },
      {
        variants: { orientation: 'vertical', spacing: 'xl' },
        style: { margin: `0 ${vars.spacing.xl}` },
      },
    ],
    defaultVariants: {
      orientation: 'horizontal',
      spacing: 'none',
    },
  },
  'divider',
);

export type DividerVariants = RecipeVariants<typeof dividerRecipe>;

export interface DividerProps extends ElementProps<HTMLHRElement> {
  orientation?: DividerVariants['orientation'];
  spacing?: DividerVariants['spacing'];
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
    <hr ref={ref} aria-orientation={orientation} className={cx(classes, className)} {...props} />
  );
}
