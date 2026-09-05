import { cx, recipe, type RecipeVariants } from '@cumulo/css';
import React from 'react';
import { vars } from '../contract.js';
import { type ElementProps } from '../ElementProps.js';
import {
  ComponentSize,
  sizes,
  staticIntentStyles,
  type BaseVariant,
  type Intent,
} from '../intents.js';

export const badgeRecipe = recipe(
  {
    extend: [staticIntentStyles, sizes],
    base: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: vars.font.weight.semibold,
      borderRadius: vars.radius.full,
      lineHeight: vars.line.height.none,
      userSelect: 'none',
      borderWidth: 1,
      borderStyle: 'solid',
      borderColor: 'transparent',
    },
    variants: {
      color: {
        yellow: {
          backgroundColor: vars.yellow.bg,
          color: vars.yellow.fg,
        },
        blue: {
          backgroundColor: vars.blue.bg,
          color: vars.blue.fg,
        },
        green: {
          backgroundColor: vars.green.bg,
          color: vars.green.fg,
        },
        beige: {
          backgroundColor: vars.beige.bg,
          color: vars.beige.fg,
        },
        pink: {
          backgroundColor: vars.pink.bg,
          color: vars.pink.fg,
        },
        purple: {
          backgroundColor: vars.purple.bg,
          color: vars.purple.fg,
        },
        sky: {
          backgroundColor: vars.sky.bg,
          color: vars.sky.fg,
        },
      },
    },
    defaultVariants: {
      variant: 'primary',
      intent: 'primary',
      size: 'xs',
    },
  },
  'badge',
);

export type BadgeVariants = RecipeVariants<typeof badgeRecipe>;

export type BadgeColor = 'yellow' | 'blue' | 'green' | 'beige' | 'pink' | 'purple' | 'sky';

export interface BadgeProps extends ElementProps<HTMLSpanElement> {
  variant?: BaseVariant;
  intent?: Intent;
  size?: ComponentSize;
  color?: BadgeColor;
  children?: React.ReactNode;
}

export function Badge({
  variant,
  intent,
  size = 'xs',
  color,
  className,
  children,
  ref,
  ...props
}: BadgeProps): React.JSX.Element {
  const classes = badgeRecipe({ variant, intent, size, color });

  return (
    <span ref={ref} className={cx(classes, className)} {...props}>
      {children}
    </span>
  );
}
