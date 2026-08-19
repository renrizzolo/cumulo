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

export const buttonRecipe = recipe(
  {
    extend: [allIntentStyles, sizes],
    base: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: vars.spacing.xs,
      fontFamily: vars.font.sans,
      fontWeight: vars.font.weight.medium,
      borderRadius: vars.radius.lg,

      borderWidth: 1,
      borderStyle: 'solid',
      borderColor: 'transparent',
      outline: 'none',
      userSelect: 'none',
      transition: `all ${vars.duration.slow} ${vars.ease.default}`,
      willChange: 'transform',
      ':disabled': {
        opacity: 0.5,
        cursor: 'not-allowed',
      },
      ':active': {
        transform: 'scale(0.98)',
      },
      ':focus-visible': {
        boxShadow: `0 0 0 2px var(--surface-bg), 0 0 0 4px ${vars.primary.focus}`,
      },
    },
    variants: {
      width: {
        auto: { width: 'auto' },
        full: { width: '100%' },
      },
      shape: {
        default: {},
        round: { borderRadius: vars.radius.full },
      },
    },
    defaultVariants: {
      variant: 'primary',
      intent: 'primary',
      size: 'base',
      width: 'auto',
      shape: 'default',
    },
  },
  'btn',
);

export type ButtonVariants = RecipeVariants<typeof buttonRecipe>;

export interface ButtonProps extends ElementProps<HTMLButtonElement> {
  variant?: BaseVariant;
  intent?: Intent;
  size?: ComponentSize;
  width?: 'auto' | 'full';
  shape?: 'default' | 'round';
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'start' | 'end';
  children?: React.ReactNode;
}

export function Button({
  variant = 'primary',
  intent = 'primary',
  size = 'base',
  width = 'auto',
  shape = 'default',
  disabled,
  icon,
  iconPosition = 'start',
  className,
  children,
  ref,
  ...props
}: ButtonProps) {
  const classes = buttonRecipe({ variant, intent, size, width, shape });

  return (
    <button
      ref={ref}
      disabled={disabled}
      className={`${classes} ${className || ''}`.trim()}
      {...props}
    >
      {icon && iconPosition === 'start' ? icon : null}
      {children}
      {icon && iconPosition === 'end' ? icon : null}
    </button>
  );
}
