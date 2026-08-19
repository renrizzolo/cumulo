import React from 'react';
import { recipe, type RecipeVariants } from '@cumulo/css';
import { vars } from '../contract.js';
import { ElementProps } from '../ElementProps.js';
import {
  allIntentStyles,
  sizes,
  type BaseVariant,
  type Intent,
  type ComponentSize,
} from '../intents.js';

export const badgeRecipe = recipe(
  {
    extend: [allIntentStyles, sizes],
    base: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: vars.font.weight.semibold,
      borderRadius: vars.radius.full,
      lineHeight: vars.line.height.none,
      userSelect: 'none',
    },
    variants: {},
    defaultVariants: {
      variant: 'primary',
      intent: 'primary',
      size: 'small',
    },
  },
  'badge',
);

export type BadgeVariants = RecipeVariants<typeof badgeRecipe>;

export interface BadgeProps extends ElementProps<HTMLSpanElement> {
  variant?: BaseVariant;
  intent?: Intent;
  size?: ComponentSize;
  children?: React.ReactNode;
}

export function Badge({
  variant = 'primary',
  intent = 'primary',
  size = 'small',
  className,
  children,
  ref,
  ...props
}: BadgeProps) {
  const classes = badgeRecipe({ variant, intent, size });

  return (
    <span ref={ref} className={`${classes} ${className || ''}`.trim()} {...props}>
      {children}
    </span>
  );
}
