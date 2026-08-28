import React from 'react';
import { recipe, cx, type RecipeVariants } from '@cumulo/css';
import { vars } from '../contract.js';
import type { ElementProps } from '../ElementProps.js';

export const codeRecipe = recipe(
  {
    base: {
      fontFamily: vars.font.mono,
      fontSize: vars.font.size.xs,
      borderRadius: vars.radius.md,
      borderWidth: 1,
      borderStyle: 'solid',
      padding: `${vars.spacing['2xs']} ${vars.spacing['xs']}`,
      lineHeight: vars.line.height.tight,
      display: 'inline-block',
      verticalAlign: 'baseline',
    },
    variants: {
      variant: {
        subtle: {
          backgroundColor: vars.surface.bg.next,
          borderColor: vars.surface.border,
          color: vars.surface.fg,
        },
        primary: {
          backgroundColor: vars.primary['50'],
          borderColor: vars.primary.border,
          color: vars.primary.DEFAULT,
        },
        ghost: {
          backgroundColor: 'transparent',
          borderColor: 'transparent',
          color: vars.surface.fg,
          padding: 0,
        },
      },
    },
    defaultVariants: {
      variant: 'subtle',
    },
  },
  'code',
);

export type CodeVariants = RecipeVariants<typeof codeRecipe>;

export interface CodeProps extends ElementProps<HTMLElement> {
  variant?: 'subtle' | 'primary' | 'ghost';
  children?: React.ReactNode;
}

export function Code({
  variant = 'subtle',
  className,
  children,
  ref,
  ...props
}: CodeProps): React.JSX.Element {
  const classes = codeRecipe({ variant });

  return (
    <code
      ref={ref}
      className={cx(classes, className)}
      {...props}
    >
      {children}
    </code>
  );
}
