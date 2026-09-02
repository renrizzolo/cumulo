'use client';

import React, { useCallback, useState } from 'react';
import { recipe, style, cx, type RecipeVariants } from '@cumulo/css';
import { vars } from '../contract.js';
import type { ElementProps } from '../ElementProps.js';

export const switchRecipe = recipe(
  {
    base: {
      display: 'inline-flex',
      alignItems: 'center',
      position: 'relative',
      borderRadius: vars.radius.full,
      backgroundColor: vars.surface.secondary.DEFAULT,
      borderWidth: 1,
      borderStyle: 'solid',
      borderColor: vars.surface.border,
      cursor: 'pointer',
      userSelect: 'none',
      boxSizing: 'border-box',
      transition: `background-color ${vars.duration.fast} ${vars.ease.default}, border-color ${vars.duration.fast} ${vars.ease.default}`,
      outline: 'none',
      padding: '2px',
      flexShrink: 0,
      ':hover': {
        backgroundColor: vars.surface.secondary.hover,
      },
      ':focus-visible': {
        borderColor: vars.primary.DEFAULT,
        boxShadow: `0 0 0 3px ${vars.primary.subtle}`,
      },
    },
    variants: {
      size: {
        sm: {
          width: '2rem',
          height: '1.125rem',
        },
        md: {
          width: '2.5rem',
          height: '1.375rem',
        },
        lg: {
          width: '3rem',
          height: '1.625rem',
        },
      },
      checked: {
        true: {
          backgroundColor: vars.primary.DEFAULT,
          borderColor: vars.primary.DEFAULT,
          ':hover': {
            backgroundColor: vars.primary.hover,
            borderColor: vars.primary.hover,
          },
        },
        false: {},
      },
      disabled: {
        true: {
          opacity: 0.5,
          cursor: 'not-allowed',
          pointerEvents: 'none',
        },
        false: {},
      },
    },
    defaultVariants: {
      size: 'md',
      checked: false,
      disabled: false,
    },
  },
  'switch',
);

export const switchThumbRecipe = recipe(
  {
    base: {
      display: 'block',
      borderRadius: vars.radius.full,
      backgroundColor: vars.surface.bg.DEFAULT,
      boxShadow: vars.shadow['0'],
      transition: `transform ${vars.duration.fast} ${vars.ease.default}, background-color ${vars.duration.fast} ${vars.ease.default}`,
      pointerEvents: 'none',
    },
    variants: {
      size: {
        sm: {
          width: '0.875rem',
          height: '0.875rem',
        },
        md: {
          width: '1.125rem',
          height: '1.125rem',
        },
        lg: {
          width: '1.375rem',
          height: '1.375rem',
        },
      },
      checked: {
        true: {},
        false: {
          transform: 'translateX(0)',
        },
      },
    },
    compoundVariants: [
      {
        variants: { size: 'sm', checked: true },
        style: {
          transform: 'translateX(0.875rem)',
        },
      },
      {
        variants: { size: 'md', checked: true },
        style: {
          transform: 'translateX(1.125rem)',
        },
      },
      {
        variants: { size: 'lg', checked: true },
        style: {
          transform: 'translateX(1.375rem)',
        },
      },
    ],
    defaultVariants: {
      size: 'md',
      checked: false,
    },
  },
  'switch-thumb',
);

export type SwitchVariants = RecipeVariants<typeof switchRecipe>;

const visuallyHiddenInput = style({
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
  opacity: 0,
});

export interface SwitchProps extends Omit<ElementProps<HTMLInputElement>, 'size'> {
  size?: 'sm' | 'md' | 'lg';
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export function Switch({
  size = 'md',
  checked: controlledChecked,
  defaultChecked = false,
  disabled = false,
  className,
  id,
  onChange,
  onCheckedChange,
  ref,
  ...props
}: SwitchProps): React.JSX.Element {
  const [uncontrolledChecked, setUncontrolledChecked] = useState(defaultChecked);
  const isControlled = controlledChecked !== undefined;
  const isChecked = isControlled ? controlledChecked : uncontrolledChecked;

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const nextChecked = event.target.checked;
      if (!isControlled) {
        setUncontrolledChecked(nextChecked);
      }
      onChange?.(event);
      onCheckedChange?.(nextChecked);
    },
    [isControlled, onChange, onCheckedChange],
  );

  const classes = switchRecipe({
    size,
    checked: isChecked,
    disabled,
  });

  const thumbClasses = switchThumbRecipe({
    size,
    checked: isChecked,
  });

  return (
    <label className={cx(classes, className)}>
      <input
        ref={ref}
        type="checkbox"
        role="switch"
        id={id}
        checked={isChecked}
        disabled={disabled}
        onChange={handleChange}
        className={visuallyHiddenInput.className}
        aria-checked={isChecked}
        {...props}
      />
      <span className={thumbClasses} aria-hidden="true" />
    </label>
  );
}

Switch.displayName = 'Switch';
