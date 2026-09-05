'use client';

import React, { useCallback, useState, useRef, useEffect } from 'react';
import { recipe, style, cx, type RecipeVariants } from '@cumulo/css';
import { vars } from '../contract.js';
import type { ElementProps } from '../ElementProps.js';
import { focusRing, controlInput } from '../intents.js';
import { useMergeRefs } from '../hooks/useMergeRefs.js';

export const checkboxRecipe = recipe(
  {
    extend: [focusRing],
    base: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      width: vars.font.size.lg,
      height: vars.font.size.lg,
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
      flexShrink: 0,
      ':hover': {
        borderColor: vars.primary.DEFAULT,
        backgroundColor: vars.surface.bg.next,
      },
    },
    variants: {
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
            boxShadow: `0 0 0 2px ${vars.surface.bg.DEFAULT}, 0 0 0 4px ${vars.error.bg}`,
          },
          ':has(:focus-visible)': {
            borderColor: vars.error.bg,
            boxShadow: `0 0 0 2px ${vars.surface.bg.DEFAULT}, 0 0 0 4px ${vars.error.bg}`,
          },
        },
      },
    },
    defaultVariants: {
      checked: false,
      disabled: false,
      intent: 'default',
    },
  },
  'checkbox',
);

export type CheckboxVariants = RecipeVariants<typeof checkboxRecipe>;

const iconStyle = style({
  width: '75%',
  height: '75%',
  display: 'block',
  flexShrink: 0,
  pointerEvents: 'none',
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

export interface CheckboxProps extends ElementProps<HTMLInputElement> {
  checked?: boolean;
  defaultChecked?: boolean;
  indeterminate?: boolean;
  defaultIndeterminate?: boolean;
  intent?: 'default' | 'error';
  onCheckedChange?: (checked: boolean) => void;
  onIndeterminateChange?: (indeterminate: boolean) => void;
}

export function Checkbox({
  checked: controlledChecked,
  defaultChecked = false,
  indeterminate: controlledIndeterminate,
  defaultIndeterminate = false,
  intent = 'default',
  disabled = false,
  className,
  id,
  onChange,
  onCheckedChange,
  onIndeterminateChange,
  ref,
  ...props
}: CheckboxProps): React.JSX.Element {
  const [uncontrolledChecked, setUncontrolledChecked] = useState(defaultChecked);
  const [uncontrolledIndeterminate, setUncontrolledIndeterminate] = useState(
    controlledIndeterminate !== undefined ? controlledIndeterminate : defaultIndeterminate,
  );

  const isCheckedControlled = controlledChecked !== undefined;
  const isChecked = isCheckedControlled ? controlledChecked : uncontrolledChecked;

  const isIndeterminateControlled = controlledIndeterminate !== undefined;
  const isIndeterminate = isIndeterminateControlled
    ? controlledIndeterminate
    : uncontrolledIndeterminate;

  const inputRef = useRef<HTMLInputElement>(null);
  const mergedRef = useMergeRefs(ref, inputRef);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = Boolean(isIndeterminate);
    }
  }, [isIndeterminate]);

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const nextChecked = event.target.checked;
      if (!isCheckedControlled) {
        setUncontrolledChecked(nextChecked);
      }
      if (!isIndeterminateControlled) {
        setUncontrolledIndeterminate(false);
      }
      onIndeterminateChange?.(false);
      onChange?.(event);
      onCheckedChange?.(nextChecked);
    },
    [
      isCheckedControlled,
      isIndeterminateControlled,
      onChange,
      onCheckedChange,
      onIndeterminateChange,
    ],
  );

  const classes = checkboxRecipe({
    checked: isChecked || isIndeterminate,
    disabled,
    intent,
  });

  return (
    <span className={cx(classes, className)}>
      <input
        ref={mergedRef}
        type="checkbox"
        id={id}
        checked={isChecked}
        disabled={disabled}
        onChange={handleChange}
        className={controlInput.className}
        aria-checked={isIndeterminate ? 'mixed' : isChecked}
        aria-invalid={intent === 'error' ? true : undefined}
        {...props}
      />
      {isIndeterminate ? <IndeterminateIcon /> : isChecked ? <CheckIcon /> : null}
    </span>
  );
}

Checkbox.displayName = 'Checkbox';
