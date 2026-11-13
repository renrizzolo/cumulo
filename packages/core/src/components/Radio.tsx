'use client';

import React, { createContext, useContext, useCallback, useState, useRef } from 'react';
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
import { focusRing, controlIntent, controlInput } from '../intents.js';
import { useMergeRefs } from '../hooks/useMergeRefs.js';
import type { ValueGroupContextBase } from '../hooks/useValueGroup.js';

export type RadioGroupOrientation = 'horizontal' | 'vertical';

const radioContract = createThemeContract({
  size: null,
});

const radioTheme = createTheme(radioContract, {
  size: vars.size['2xs'],
});

export const radioRecipe = recipe(
  {
    extend: [focusRing, controlIntent],
    base: {
      justifyContent: 'center',
      width: radioContract.size,
      height: radioContract.size,
      borderRadius: vars.radius.full,
      borderWidth: 1,
      backgroundColor: vars.surface.bg.DEFAULT,
      transition: `all ${vars.duration.fast} ${vars.ease.default}`,
      selectors: {
        '&:has(input:hover)': {
          borderColor: vars.primary['600'],
          backgroundColor: vars.surface.bg.next,
        },
      },
    },
    variants: {
      size: {
        sm: radioContract.$set({ size: vars.size['3xs'] }),
        md: radioContract.$set({ size: vars.size['2xs'] }),
        lg: radioContract.$set({ size: vars.size.xs }),
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
  'radio',
);

export type RadioVariants = RecipeVariants<typeof radioRecipe>;

export interface RadioGroupContextValue<
  T extends string = string,
> extends ValueGroupContextBase<T> {
  name: string;
  disabled?: boolean;
  orientation?: RadioGroupOrientation;
  intent?: 'default' | 'error';
  size?: RadioVariants['size'];
}

export const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

const dotStyle = style({
  width: `calc(${radioContract.size} / 2.5)`,
  height: `calc(${radioContract.size} / 2.5)`,
  borderRadius: vars.radius.full,
  backgroundColor: vars.primary.fg,
  display: 'block',
  pointerEvents: 'none',
  transition: `transform ${vars.duration.fast} ${vars.ease.default}`,
});

export interface RadioProps<T extends string = string> extends Omit<
  ElementProps<HTMLInputElement>,
  'value' | 'defaultValue'
> {
  value?: T;
  checked?: boolean;
  defaultChecked?: boolean;
  intent?: RadioVariants['intent'];
  size?: RadioVariants['size'];
  onCheckedChange?: (checked: boolean) => void;
}

export function Radio<T extends string = string>({
  value,
  name: providedName,
  checked: controlledChecked,
  defaultChecked = false,
  intent: providedIntent,
  size: itemSize,
  disabled: itemDisabled,
  className,
  id,
  onChange,
  onCheckedChange,
  ref,
  ...props
}: RadioProps<T>): React.JSX.Element {
  const context = useContext(RadioGroupContext);
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
  const resolvedIntent = providedIntent ?? context?.intent ?? 'default';
  const resolvedSize = itemSize ?? context?.size ?? 'md';

  const inputRef = useRef<HTMLInputElement>(null);
  const mergedRef = useMergeRefs(ref, inputRef);

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>): void => {
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
    intent: resolvedIntent,
    size: resolvedSize,
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
        data-invalid={resolvedIntent === 'error' ? 'true' : undefined}
        {...props}
      />
      {isChecked ? <span className={dotStyle.className} /> : null}
    </span>
  );
}

Radio.displayName = 'Radio';
