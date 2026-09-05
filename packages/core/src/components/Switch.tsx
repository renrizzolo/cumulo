'use client';

import React, { useCallback, useState } from 'react';
import { recipe, cx, type RecipeVariants } from '@cumulo/css';
import { vars } from '../contract.js';
import type { ElementProps } from '../ElementProps.js';
import { focusRing, controlInput } from '../intents.js';

export const switchRecipe = recipe(
  {
    extend: [focusRing],
    base: {
      display: 'inline-flex',
      alignItems: 'center',
      position: 'relative',
      width: vars.size.sm,
      height: vars.font.size.lg,
      borderRadius: vars.radius.full,
      backgroundColor: vars.surface.secondary.DEFAULT,
      borderWidth: 1,
      borderStyle: 'solid',
      borderColor: vars.surface.border,
      cursor: 'pointer',
      userSelect: 'none',
      boxSizing: 'border-box',
      transition: `background-color ${vars.duration.fast} ${vars.ease.default}, border-color ${vars.duration.fast} ${vars.ease.default}`,
      padding: vars.spacing['3xs'],
      flexShrink: 0,
      ':hover': {
        backgroundColor: vars.surface.secondary.hover,
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
  'switch',
);

export const switchThumbRecipe = recipe(
  {
    base: {
      display: 'block',
      width: vars.font.size.sm,
      height: vars.font.size.sm,
      borderRadius: vars.radius.full,
      backgroundColor: vars.surface.bg.DEFAULT,
      boxShadow: vars.shadow['0'],
      transition: `transform ${vars.duration.fast} ${vars.ease.default}, background-color ${vars.duration.fast} ${vars.ease.default}`,
      pointerEvents: 'none',
      flexShrink: 0,
    },
    variants: {
      checked: {
        true: {
          transform: `translateX(${vars.spacing.sm})`,
        },
        false: {
          transform: 'translateX(0)',
        },
      },
    },
    defaultVariants: {
      checked: false,
    },
  },
  'switch-thumb',
);

export type SwitchVariants = RecipeVariants<typeof switchRecipe>;

export interface SwitchProps extends ElementProps<HTMLInputElement> {
  checked?: boolean;
  defaultChecked?: boolean;
  intent?: 'default' | 'error';
  onCheckedChange?: (checked: boolean) => void;
}

export function Switch({
  checked: controlledChecked,
  defaultChecked = false,
  intent = 'default',
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
    checked: isChecked,
    disabled,
    intent,
  });

  const thumbClasses = switchThumbRecipe({
    checked: isChecked,
  });

  return (
    <span className={cx(classes, className)}>
      <input
        ref={ref}
        type="checkbox"
        role="switch"
        id={id}
        checked={isChecked}
        disabled={disabled}
        onChange={handleChange}
        className={controlInput.className}
        aria-checked={isChecked}
        aria-invalid={intent === 'error' ? true : undefined}
        {...props}
      />
      <span className={thumbClasses} aria-hidden="true" />
    </span>
  );
}

Switch.displayName = 'Switch';
