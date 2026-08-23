import React from 'react';
import { recipe, cx, type RecipeVariants } from '@cumulo/css';
import { vars } from '../contract.js';
import { type ElementProps } from '../ElementProps.js';
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
        square: {
          aspectRatio: '1 / 1',
        },
      },
      shape: {
        default: {},
        round: { borderRadius: vars.radius.full },
      },
    },
    compoundVariants: [
      {
        variants: { width: 'square', size: 'small' },
        style: {
          width: vars.size.small,
          paddingLeft: 0,
          paddingRight: 0,
        },
      },
      {
        variants: { width: 'square', size: 'base' },
        style: {
          width: vars.size.base,
          paddingLeft: 0,
          paddingRight: 0,
        },
      },
      {
        variants: { width: 'square', size: 'large' },
        style: {
          width: vars.size.large,
          paddingLeft: 0,
          paddingRight: 0,
        },
      },
    ],
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
  width?: 'auto' | 'full' | 'square';
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
}: ButtonProps): React.JSX.Element {
  const classes = buttonRecipe({ variant, intent, size, width, shape });

  return (
    <button ref={ref} disabled={disabled} className={cx(classes, className)} {...props}>
      {icon && iconPosition === 'start' ? icon : null}
      {children}
      {icon && iconPosition === 'end' ? icon : null}
    </button>
  );
}
