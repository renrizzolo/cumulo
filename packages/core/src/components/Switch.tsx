'use client';

import React, { useCallback, useState } from 'react';
import { recipe, cx, type RecipeVariants, createThemeContract, createTheme } from '@cumulo/css';
import { vars } from '../contract.js';
import type { ElementProps } from '../ElementProps.js';
import { focusRing, controlIntent, controlInput } from '../intents.js';

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
    extend: [focusRing, controlIntent],
    base: {
      width: switchContract.track.width,
      height: switchContract.track.height,
      borderRadius: vars.radius.full,
      backgroundColor: vars.surface.secondary.DEFAULT,
      borderWidth: switchContract.track.borderWidth,
      transition: `background-color ${vars.duration.fast} ${vars.ease.default}, border-color ${vars.duration.fast} ${vars.ease.default}`,
      padding: switchContract.track.padding,
      selectors: {
        '&:has(input:hover)': {
          backgroundColor: vars.surface.secondary.hover,
        },
      },
    },
    variants: {
      size: {
        sm: switchContract.$set({
          track: {
            width: vars.size.xs,
            height: `calc(${switchContract.track.padding} * 2 + ${switchContract.thumb.size} + ${switchContract.track.borderWidth} * 2)`,
            padding: vars.spacing['3xs'],
            borderWidth: '1px',
          },
          thumb: {
            size: `calc(${vars.size['4xs']} - 2px)`,
          },
        }),
        md: switchContract.$set({
          track: {
            width: vars.size.sm,
            height: `calc(${switchContract.track.padding} * 2 + ${switchContract.thumb.size} + ${switchContract.track.borderWidth} * 2)`,
            padding: vars.spacing['3xs'],
            borderWidth: '1px',
          },
          thumb: {
            size: vars.size['4xs'],
          },
        }),
        lg: switchContract.$set({
          track: {
            width: vars.size.md,
            height: `calc(${switchContract.track.padding} * 2 + ${switchContract.thumb.size} + ${switchContract.track.borderWidth} * 2)`,
            padding: vars.spacing['3xs'],
            borderWidth: '1px',
          },
          thumb: {
            size: vars.size['3xs'],
          },
        }),
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
  'switch',
);

const switchThumbRecipe = recipe(
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
  size?: SwitchVariants['size'];
  onCheckedChange?: (checked: boolean) => void;
}

export function Switch({
  checked: controlledChecked,
  defaultChecked = false,
  intent = 'default',
  size = 'md',
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
    size,
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
