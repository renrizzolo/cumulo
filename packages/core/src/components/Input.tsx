import React from 'react';
import { recipe, cx, type RecipeVariants } from '@cumulo/css';
import { vars } from '../contract.js';
import { ElementProps } from '../ElementProps.js';
import { fieldIntentStyles, sizes, type ComponentSize } from '../intents.js';

export const inputRecipe = recipe(
  {
    extend: [fieldIntentStyles, sizes],
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
        small: {
          height: vars.size.small,
          paddingLeft: vars.spacing.sm,
          paddingRight: vars.spacing.sm,
          fontSize: vars.font.size.sm,
        },
        base: {
          height: vars.size.base,
          paddingLeft: vars.spacing.md,
          paddingRight: vars.spacing.md,
          fontSize: vars.font.size.sm,
        },
        large: {
          height: vars.size.large,
          paddingLeft: vars.spacing.lg,
          paddingRight: vars.spacing.lg,
          fontSize: vars.font.size.base,
        },
        inherit: {
          height: 'auto',
        },
      },
    },
    defaultVariants: {
      variant: 'field',
      intent: 'default',
      size: 'base',
    },
  },
  'input',
);

export type InputVariants = RecipeVariants<typeof inputRecipe>;

export type InputProps = ElementProps<HTMLInputElement> & {
  intent?: 'default' | 'error';
  size?: ComponentSize | 'inherit';
};

export function Input({
  intent = 'default',
  size = 'base',
  className,
  type = 'text',
  value,
  onChange,
  placeholder,
  ref,
  ...props
}: InputProps) {
  const classes = inputRecipe({
    variant: 'field',
    intent,
    size: size === 'inherit' ? 'inherit' : size,
  });

  return (
    <input
      ref={ref}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={cx(classes, className)}
      {...props}
    />
  );
}
