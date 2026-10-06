'use client';

import React, { useCallback, useState } from 'react';
import { recipe, cx, type RecipeVariants, createThemeContract, createTheme } from '@cumulo/css';
import { vars } from '../contract.js';
import type { ElementProps } from '../ElementProps.js';
import { focusRing, controlInput } from '../intents.js';

const switchContract = createThemeContract({
  track: {
    width: null,
    height: null,
    padding: null,
    borderWidth: null,
  },
  thumb: {
    size: null,
  },
});

const switchTheme = createTheme(switchContract, {
  track: {
    width: vars.size.sm,
    height: `calc(${switchContract.track.padding} * 2 + ${switchContract.thumb.size} + ${switchContract.track.borderWidth} * 2)`,
    padding: vars.spacing['3xs'],
    borderWidth: '1px',
  },
  thumb: {
    size: vars.size['4xs'],
  },
});

export const switchRecipe = recipe(
  {
    extend: [focusRing],
    base: {
      display: 'inline-flex',
      alignItems: 'center',
      position: 'relative',
      width: switchContract.track.width,
      height: switchContract.track.height,
      borderRadius: vars.radius.full,
      backgroundColor: vars.surface.secondary.DEFAULT,
      borderWidth: switchContract.track.borderWidth,
      borderStyle: 'solid',
      borderColor: vars.surface.border,
      cursor: 'pointer',
      userSelect: 'none',
      boxSizing: 'border-box',
      transition: `background-color ${vars.duration.fast} ${vars.ease.default}, border-color ${vars.duration.fast} ${vars.ease.default}`,
      padding: switchContract.track.padding,
      flexShrink: 0,
      selectors: {
        '&:has(input:hover)': {
          backgroundColor: vars.surface.secondary.hover,
        },
      },
    },
    variants: {
      checked: {
        true: {
          backgroundColor: vars.primary.DEFAULT,
          borderColor: vars.primary.DEFAULT,
          selectors: {
            '&:has(input:hover)': {
              backgroundColor: vars.primary.hover,
              borderColor: vars.primary.hover,
            },
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
      width: switchContract.thumb.size,
      height: switchContract.thumb.size,
      borderRadius: vars.radius.full,
      backgroundColor: vars.primary.fg,
      transition: `transform ${vars.duration.fast} ${vars.ease.default}, background-color ${vars.duration.fast} ${vars.ease.default}`,
      pointerEvents: 'none',
      flexShrink: 0,
    },
    variants: {
      checked: {
        true: {
          transform: `translateX(calc(${switchContract.track.width} - (${switchContract.track.padding} * 2) - (${switchContract.thumb.size}) - (${switchContract.track.borderWidth} * 2)))`,
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
  intent?: SwitchVariants['intent'];
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
    <span className={cx(switchTheme.className, classes, className)}>
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
