import React from 'react';
import { recipe, cx, type RecipeVariants } from '@cumulo/css';
import { vars } from '../contract.js';
import type { ElementProps } from '../ElementProps.js';

export const kbdRecipe = recipe(
  {
    base: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: vars.font.mono,
      fontWeight: vars.font.weight.medium,
      lineHeight: vars.line.height.none,
      color: vars.surface.subtle,
      backgroundColor: vars.surface.bg.next,
      borderWidth: 1,
      borderStyle: 'solid',
      borderColor: vars.surface.border,
      borderRadius: vars.radius.md,
      boxShadow: `0 1px 0 0 ${vars.surface.border}`,
      userSelect: 'none',
      whiteSpace: 'nowrap',
      letterSpacing: '1px',
    },
    variants: {
      size: {
        xs: {
          paddingInline: vars.spacing['2xs'],
          paddingBlock: vars.spacing['3xs'],
          fontSize: vars.font.size['2xs'],
        },
        sm: {
          paddingInline: vars.spacing.xs,
          paddingBlock: vars.spacing['2xs'],
          fontSize: vars.font.size.xs,
        },
        md: {
          paddingInline: vars.spacing.sm,
          paddingBlock: vars.spacing.xs,
          fontSize: vars.font.size.sm,
        },
      },
    },
    defaultVariants: {
      size: 'xs',
    },
  },
  'kbd',
);

export type KbdVariants = RecipeVariants<typeof kbdRecipe>;

export interface KbdProps extends ElementProps<HTMLElement> {
  /**
   * Size scale of the keyboard shortcut badge.
   * @default 'sm'
   */
  size?: KbdVariants['size'];
  children?: React.ReactNode;
}

export function Kbd({
  size = 'sm',
  className,
  children,
  ref,
  ...props
}: KbdProps): React.JSX.Element {
  const classes = kbdRecipe({ size });

  return (
    <kbd ref={ref} className={cx(classes, className)} {...props}>
      {children}
    </kbd>
  );
}

Kbd.displayName = 'Kbd';
