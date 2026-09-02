'use client';

import React from 'react';
import { recipe, cx, type RecipeVariants } from '@cumulo/css';
import { vars } from '../contract.js';
import type { ElementProps } from '../ElementProps.js';
import { fieldIntentStyles, type ComponentSize } from '../intents.js';

export const textareaRecipe = recipe(
  {
    extend: [fieldIntentStyles],
    base: {
      display: 'flex',
      width: '100%',
      fontFamily: vars.font.sans,
      color: vars.surface.fg,
      borderWidth: 1,
      borderStyle: 'solid',
      borderColor: vars.surface.border,
      borderRadius: vars.radius.md,
      outline: 'none',
      boxSizing: 'border-box',
      transition: `all ${vars.duration.fast} ${vars.ease.default}`,
      minHeight: '5rem',
      '::placeholder': {
        color: vars.surface.subtle,
      },
      ':focus-visible': {
        borderColor: vars.primary.DEFAULT,
        boxShadow: `0 0 0 3px ${vars.primary.subtle}`,
      },
      ':disabled': {
        opacity: 0.5,
        cursor: 'not-allowed',
      },
    },
    variants: {
      size: {
        xs: {
          padding: `${vars.spacing['2xs']} ${vars.spacing.xs}`,
          fontSize: vars.font.size.xs,
        },
        sm: {
          padding: `${vars.spacing.xs} ${vars.spacing.sm}`,
          fontSize: vars.font.size.sm,
        },
        md: {
          padding: `${vars.spacing.sm} ${vars.spacing.md}`,
          fontSize: vars.font.size.sm,
        },
        lg: {
          padding: `${vars.spacing.md} ${vars.spacing.lg}`,
          fontSize: vars.font.size.base,
        },
        xl: {
          padding: `${vars.spacing.lg} ${vars.spacing.xl}`,
          fontSize: vars.font.size.lg,
        },
        inherit: {
          padding: vars.spacing.sm,
        },
      },
      resize: {
        none: { resize: 'none' },
        vertical: { resize: 'vertical' },
        horizontal: { resize: 'horizontal' },
        both: { resize: 'both' },
      },
    },
    defaultVariants: {
      variant: 'field',
      intent: 'default',
      size: 'md',
      resize: 'vertical',
    },
  },
  'textarea',
);

export type TextareaVariants = RecipeVariants<typeof textareaRecipe>;

export interface TextareaProps extends ElementProps<HTMLTextAreaElement> {
  size?: ComponentSize | 'inherit';
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
  intent?: 'default' | 'error';
}

export function Textarea({
  size = 'md',
  resize = 'vertical',
  intent = 'default',
  className,
  id,
  ref,
  ...props
}: TextareaProps): React.JSX.Element {
  const classes = textareaRecipe({
    variant: 'field',
    intent,
    size,
    resize,
  });

  return <textarea ref={ref} id={id} className={cx(classes, className)} {...props} />;
}

Textarea.displayName = 'Textarea';
