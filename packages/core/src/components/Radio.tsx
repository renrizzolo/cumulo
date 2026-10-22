'use client';

import React, { useCallback, useState, useRef } from 'react';
import {
  recipe,
  style,
  cx,
  type RecipeVariants,
  createThemeContract,
  createTheme,
} from '@cumulo/css';
import { vars } from '../contract.js';
import type { ElementProps } from '../ElementProps.js';
import { focusRing, controlInput } from '../intents.js';
import { useMergeRefs } from '../hooks/useMergeRefs.js';
import { useRadioListContext } from './RadioList.js';

const radioContract = createThemeContract({
  size: null,
});

const radioTheme = createTheme(radioContract, {
  size: vars.size['2xs'],
});

export const radioRecipe = recipe(
  {
    extend: [focusRing],
    base: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      width: radioContract.size,
      height: radioContract.size,
      borderRadius: vars.radius.full,
      borderWidth: 1,
      borderStyle: 'solid',
      borderColor: vars.surface.border,
      backgroundColor: vars.surface.bg.DEFAULT,
      cursor: 'pointer',
      userSelect: 'none',
      boxSizing: 'border-box',
      transition: `all ${vars.duration.fast} ${vars.ease.default}`,
      flexShrink: 0,
      selectors: {
        '&:has(input:hover)': {
          borderColor: vars.primary.DEFAULT,
          backgroundColor: vars.surface.bg.next,
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
  'radio',
);

export type RadioVariants = RecipeVariants<typeof radioRecipe>;

const dotStyle = style({
  width: `calc(${radioContract.size} / 2.5)`,
  height: `calc(${radioContract.size} / 2.5)`,
  borderRadius: vars.radius.full,
  backgroundColor: vars.primary.fg,
  display: 'block',
  pointerEvents: 'none',
  transition: `transform ${vars.duration.fast} ${vars.ease.default}`,
});

export interface RadioProps extends ElementProps<HTMLInputElement> {
  value?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  intent?: RadioVariants['intent'];
  onCheckedChange?: (checked: boolean) => void;
}

export function Radio({
  value,
  name: providedName,
  checked: controlledChecked,
  defaultChecked = false,
  intent = 'default',
  disabled: itemDisabled,
  className,
  id,
  onChange,
  onCheckedChange,
  ref,
  ...props
}: RadioProps): React.JSX.Element {
  const context = useRadioListContext();
  const [uncontrolledChecked, setUncontrolledChecked] = useState(defaultChecked);

  const isGrouped = context !== null;
  const isCheckedControlled = controlledChecked !== undefined;
  const isChecked = isGrouped
    ? context.value === value
    : isCheckedControlled
      ? controlledChecked
      : uncontrolledChecked;

  const isDisabled = itemDisabled ?? context?.disabled ?? false;
  const name = providedName ?? context?.name;

  const inputRef = useRef<HTMLInputElement>(null);
  const mergedRef = useMergeRefs(ref, inputRef);

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const nextChecked = event.target.checked;
      if (!isGrouped && !isCheckedControlled) {
        setUncontrolledChecked(nextChecked);
      }
      if (isGrouped && value !== undefined) {
        context.setValue(value);
      }
      onChange?.(event);
      onCheckedChange?.(nextChecked);
    },
    [isGrouped, isCheckedControlled, value, context, onChange, onCheckedChange],
  );

  const classes = radioRecipe({
    checked: isChecked,
    disabled: isDisabled,
    intent,
  });

  return (
    <span className={cx(classes, radioTheme.className, className)}>
      <input
        ref={mergedRef}
        type="radio"
        name={name}
        value={value}
        id={id}
        checked={isChecked}
        disabled={isDisabled}
        onChange={handleChange}
        className={controlInput.className}
        data-invalid={intent === 'error' ? true : undefined}
        {...props}
      />
      {isChecked ? <span className={dotStyle.className} /> : null}
    </span>
  );
}

Radio.displayName = 'Radio';
