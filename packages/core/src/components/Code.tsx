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
      padding: `0 ${vars.spacing['xs']}`,
      lineHeight: vars.line.height.normal,
      display: 'inline-block',
      verticalAlign: 'baseline',
      whiteSpace: 'nowrap',
    },
    variants: {
      variant: {
        subtle: {
          backgroundColor: vars.surface.bg.next,
          borderColor: vars.surface.border,
          color: vars.surface.fg,
        },
        primary: {
          backgroundColor: vars.surface.primary.DEFAULT,
          borderColor: vars.surface.primary.border,
          color: vars.surface.primary.fg,
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
  variant?: CodeVariants['variant'];
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
    <code ref={ref} className={cx(classes, className)} {...props}>
      {children}
    </code>
  );
}
