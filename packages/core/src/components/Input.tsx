import React from 'react';
import { recipe, style, cx, type RecipeVariants } from '@cumulo/css';
import { vars } from '../contract.js';
import { ElementProps } from '../ElementProps.js';
import { fieldIntentStyles, sizes } from '../intents.js';

export const inputRecipe = recipe(
  {
    extend: [fieldIntentStyles, sizes],
    base: {
      display: 'flex',
      alignItems: 'center',
      gap: vars.spacing.xs,
      width: '100%',
      fontFamily: vars.font.sans,
      color: vars.surface.fg,
      borderWidth: 1,
      borderStyle: 'solid',
      borderColor: vars.surface.border,
      borderRadius: vars.radius.control,
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
      ':focus-within': {
        borderColor: vars.primary.DEFAULT,
        boxShadow: `0 0 0 3px ${vars.primary.subtle}`,
      },
      ':disabled': {
        opacity: 0.5,
        cursor: 'not-allowed',
      },
      selectors: {
        '&:has(:disabled)': {
          opacity: 0.5,
          cursor: 'not-allowed',
        },
      },
    },
    variants: {
      size: {
        '2xs': {
          height: vars.size['2xs'],
          paddingLeft: vars.spacing['2xs'],
          paddingRight: vars.spacing['2xs'],
          fontSize: vars.font.size['2xs'],
        },
        xs: {
          height: vars.size.xs,
          paddingLeft: vars.spacing.xs,
          paddingRight: vars.spacing.xs,
          fontSize: vars.font.size.xs,
        },
        sm: {
          height: vars.size.sm,
          paddingLeft: vars.spacing.sm,
          paddingRight: vars.spacing.sm,
          fontSize: vars.font.size.sm,
        },
        md: {
          height: vars.size.md,
          paddingLeft: vars.spacing.md,
          paddingRight: vars.spacing.md,
          fontSize: vars.font.size.sm,
        },
        lg: {
          height: vars.size.lg,
          paddingLeft: vars.spacing.lg,
          paddingRight: vars.spacing.lg,
          fontSize: vars.font.size.base,
        },
        xl: {
          height: vars.size.xl,
          paddingLeft: vars.spacing.xl,
          paddingRight: vars.spacing.xl,
          fontSize: vars.font.size.lg,
        },
        inherit: {
          height: 'auto',
        },
      },
    },
    defaultVariants: {
      variant: 'field',
      intent: 'default',
      size: 'md',
    },
  },
  'input',
);

const innerInputStyle = style(
  {
    flex: 1,
    minWidth: 0,
    width: '100%',
    height: '100%',
    padding: 0,
    margin: 0,
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
    color: 'inherit',
    fontFamily: 'inherit',
    fontSize: 'inherit',
    lineHeight: 'inherit',
    '::placeholder': {
      color: vars.surface.subtle,
    },
    ':disabled': {
      cursor: 'not-allowed',
    },
  },
  'input-inner',
);

const adornmentSlotStyle = style(
  {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    color: vars.surface.subtle,
    transition: `color ${vars.duration.fast} ${vars.ease.default}`,
    selectors: {
      '[data-input-wrapper="true"]:focus-within &': {
        color: vars.surface.fg,
      },
    },
  },
  'input-adornment',
);

export type InputVariants = RecipeVariants<typeof inputRecipe>;

export interface InputProps extends ElementProps<HTMLInputElement> {
  intent?: InputVariants['intent'];
  size?: InputVariants['size'];
  /**
   * Optional icon or adornment rendered at the start of the input.
   */
  leading?: React.ReactNode;
  /**
   * Optional icon, badge, or action button rendered at the end of the input.
   */
  trailing?: React.ReactNode;
}

export function Input({
  intent = 'default',
  size = 'md',
  leading,
  trailing,
  className,
  type = 'text',
  value,
  onChange,
  placeholder,
  ref,
  ...props
}: InputProps): React.JSX.Element {
  const classes = inputRecipe({
    variant: 'field',
    intent,
    size: size === 'inherit' ? 'inherit' : size,
  });

  if (!leading && !trailing) {
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

  return (
    <div data-input-wrapper="true" className={cx(classes, className)}>
      {leading ? <span className={adornmentSlotStyle.className}>{leading}</span> : null}
      <input
        ref={ref}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={innerInputStyle.className}
        {...props}
      />
      {trailing ? <span className={adornmentSlotStyle.className}>{trailing}</span> : null}
    </div>
  );
}
