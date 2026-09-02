'use client';

import React, { useCallback, useState } from 'react';
import { recipe, style, cx, type RecipeVariants } from '@cumulo/css';
import { vars } from '../contract.js';
import type { ElementProps } from '../ElementProps.js';

export const checkboxRecipe = recipe(
  {
    base: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      borderRadius: vars.radius.md,
      borderWidth: 1,
      borderStyle: 'solid',
      borderColor: vars.surface.border,
      backgroundColor: vars.surface.bg.DEFAULT,
      color: vars.primary.fg,
      cursor: 'pointer',
      userSelect: 'none',
      boxSizing: 'border-box',
      transition: `all ${vars.duration.fast} ${vars.ease.default}`,
      outline: 'none',
      flexShrink: 0,
      ':hover': {
        borderColor: vars.primary.DEFAULT,
        backgroundColor: vars.surface.bg.next,
      },
      ':focus-visible': {
        borderColor: vars.primary.DEFAULT,
        boxShadow: `0 0 0 3px ${vars.primary.subtle}`,
      },
    },
    variants: {
      size: {
        sm: {
          width: '1rem',
          height: '1rem',
        },
        md: {
          width: '1.25rem',
          height: '1.25rem',
        },
        lg: {
          width: '1.5rem',
          height: '1.5rem',
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
      intent: {
        default: {},
        error: {
          borderColor: vars.error.bg,
          ':focus-visible': {
            borderColor: vars.error.bg,
          },
        },
      },
    },
    defaultVariants: {
      size: 'md',
      checked: false,
      disabled: false,
      intent: 'default',
    },
  },
  'checkbox',
);

export type CheckboxVariants = RecipeVariants<typeof checkboxRecipe>;

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

const iconStyle = style({
  width: '75%',
  height: '75%',
  display: 'block',
});

function CheckIcon({ className }: { className?: string } = {}): React.JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cx(iconStyle, className)}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IndeterminateIcon({ className }: { className?: string } = {}): React.JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cx(iconStyle, className)}
    >
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

export interface CheckboxProps extends Omit<ElementProps<HTMLInputElement>, 'size'> {
  size?: 'sm' | 'md' | 'lg';
  checked?: boolean;
  defaultChecked?: boolean;
  indeterminate?: boolean;
  intent?: 'default' | 'error';
  onCheckedChange?: (checked: boolean) => void;
}

export function Checkbox({
  size = 'md',
  checked: controlledChecked,
  defaultChecked = false,
  indeterminate = false,
  intent = 'default',
  disabled = false,
  className,
  id,
  onChange,
  onCheckedChange,
  ref,
  ...props
}: CheckboxProps): React.JSX.Element {
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

  const classes = checkboxRecipe({
    size,
    checked: isChecked || indeterminate,
    disabled,
    intent,
  });

  return (
    <label className={cx(classes, className)}>
      <input
        ref={ref}
        type="checkbox"
        id={id}
        checked={isChecked}
        disabled={disabled}
        onChange={handleChange}
        className={visuallyHiddenInput.className}
        aria-checked={indeterminate ? 'mixed' : isChecked}
        aria-invalid={intent === 'error' ? true : undefined}
        {...props}
      />
      {indeterminate ? <IndeterminateIcon /> : isChecked ? <CheckIcon /> : null}
    </label>
  );
}

Checkbox.displayName = 'Checkbox';
