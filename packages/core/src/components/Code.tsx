import React from 'react';
import { recipe, cx, type RecipeVariants } from '@cumulo/css';
import { vars } from '../contract.js';
import type { ElementProps } from '../ElementProps.js';
import { textBase, wrapStyles } from '../typography.js';

export const codeRecipe = recipe(
  {
    extend: [wrapStyles],
    base: {
      ...textBase,
      fontWeight: vars.font.weight.medium,
      fontFamily: vars.font.mono,
      fontSize: '0.9em',
      borderRadius: vars.radius.md,
      borderWidth: 0,
      borderStyle: 'solid',
      padding: `5px ${vars.spacing['2xs']}`,
      lineHeight: vars.line.height.normal,
      display: 'inline-block',
      verticalAlign: 'baseline',
      maxWidth: '100%',
      overflowWrap: 'break-word',
      wordBreak: 'break-word',
    },
    variants: {
      variant: {
        base: {
          color: vars.grey[700],
          backgroundColor: vars.beige.bg,
        },
        subtle: {
          backgroundColor: vars.surface.bg.next,
          borderColor: vars.surface.border,
          color: vars.surface.fg,
        },
        primary: {
          backgroundColor: vars.surface.primary.DEFAULT,
          borderColor: vars.surface.primary.DEFAULT,
          color: vars.surface.primary.fg,
        },
      },
    },
    defaultVariants: {
      variant: 'subtle',
      wrap: 'wrap',
    },
  },
  'code',
);

export type CodeVariants = RecipeVariants<typeof codeRecipe>;

export interface CodeProps extends ElementProps<HTMLElement> {
  variant?: CodeVariants['variant'];
  wrap?: CodeVariants['wrap'];
  children?: React.ReactNode;
}

export function Code({
  variant = 'base',
  wrap = 'wrap',
  className,
  children,
  ref,
  ...props
}: CodeProps): React.JSX.Element {
  const classes = codeRecipe({ variant, wrap });

  return (
    <code ref={ref} className={cx(classes, className)} {...props}>
      {children}
    </code>
  );
}
