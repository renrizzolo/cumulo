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
import { useMergeRefs } from '../hooks/useMergeRefs.js';

const sliderContract = createThemeContract({
  track: {
    height: null,
  },
  thumb: {
    size: null,
  },
  root: {
    height: null,
  },
});

const sliderTheme = createTheme(sliderContract, {
  track: {
    height: `calc(${vars.spacing['2xs']} + ${vars.spacing['3xs']})`,
  },
  thumb: {
    size: `calc(${vars.size['2xs']} - ${vars.spacing['3xs']})`,
  },
  root: {
    height: vars.size.sm,
  },
});

export const sliderRecipe = recipe(
  {
    base: {
      position: 'relative',
      display: 'inline-flex',
      alignItems: 'center',
      width: '100%',
      height: sliderContract.root.height,
      padding: `0 calc(${sliderContract.thumb.size} / 2)`,
      boxSizing: 'border-box',
      cursor: 'pointer',
      userSelect: 'none',
      touchAction: 'none',
      selectors: {
        '&:has(input:hover:not(:disabled)) [data-slider-thumb]': {
          transform: 'translate(-50%, -50%) scale(1.1)',
        },
        '&:has(input:active:not(:disabled)) [data-slider-thumb]': {
          transform: 'translate(-50%, -50%) scale(1.18)',
        },
      },
    },
    variants: {
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
        error: {},
      },
      size: {
        sm: sliderContract.$set({
          track: { height: vars.spacing['2xs'] },
          thumb: { size: `calc(${vars.size['3xs']} - ${vars.spacing['3xs']})` },
          root: { height: vars.size.xs },
        }),
        md: sliderContract.$set({
          track: { height: `calc(${vars.spacing['2xs']} + ${vars.spacing['3xs']})` },
          thumb: { size: `calc(${vars.size['2xs']} - ${vars.spacing['3xs']})` },
          root: { height: vars.size.sm },
        }),
        lg: sliderContract.$set({
          track: { height: vars.spacing.xs },
          thumb: { size: `calc(${vars.size.xs} - ${vars.spacing['3xs']})` },
          root: { height: vars.size.md },
        }),
      },
    },
    defaultVariants: {
      disabled: false,
      intent: 'default',
      size: 'md',
    },
  },
  'slider-root',
);

const trackWrapperStyle = style(
  {
    position: 'relative',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
  },
  'slider-track-wrapper',
);

const trackStyle = style(
  {
    position: 'relative',
    width: '100%',
    height: sliderContract.track.height,
    borderRadius: vars.radius.full,
    backgroundColor: vars.surface.secondary.DEFAULT,
    overflow: 'hidden',
  },
  'slider-track',
);

export const sliderRangeRecipe = recipe(
  {
    base: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      height: '100%',
      borderRadius: vars.radius.full,
      backgroundColor: vars.primary.DEFAULT,
      selectors: {
        '[data-slider-root]:has(input:hover:not(:disabled)) &': {
          backgroundColor: vars.primary.hover,
        },
      },
    },
    variants: {
      intent: {
        default: {},
        error: {
          backgroundColor: vars.error.bg,
          selectors: {
            '[data-slider-root]:has(input:hover:not(:disabled)) &': {
              backgroundColor: vars.error.hover,
            },
          },
        },
      },
    },
    defaultVariants: {
      intent: 'default',
    },
  },
  'slider-range',
);

export const sliderThumbRecipe = recipe(
  {
    base: {
      position: 'absolute',
      top: '50%',
      transform: 'translate(-50%, -50%)',
      width: sliderContract.thumb.size,
      height: sliderContract.thumb.size,
      borderRadius: vars.radius.full,
      backgroundColor: vars.primary.fg,
      borderWidth: '2px',
      borderStyle: 'solid',
      borderColor: vars.primary.DEFAULT,
      boxShadow: vars.shadow['0'],
      pointerEvents: 'none',
      boxSizing: 'border-box',
      transition: `transform ${vars.duration.fast} ${vars.ease.default}, box-shadow ${vars.duration.fast} ${vars.ease.default}, border-color ${vars.duration.fast} ${vars.ease.default}, background-color ${vars.duration.fast} ${vars.ease.default}`,
      selectors: {
        '[data-slider-root]:has(input:hover:not(:disabled)) &': {
          borderColor: vars.primary.hover,
        },
        '[data-slider-root]:has(input:focus-visible) &': {
          borderColor: vars.primary.DEFAULT,
          boxShadow: `0 0 0 2px ${vars.surface.bg.DEFAULT}, 0 0 0 4px ${vars.primary.focus}`,
        },
      },
    },
    variants: {
      intent: {
        default: {},
        error: {
          borderColor: vars.error.bg,
          selectors: {
            '[data-slider-root]:has(input:hover:not(:disabled)) &': {
              borderColor: vars.error.hover,
            },
            '[data-slider-root]:has(input:focus-visible) &': {
              borderColor: vars.error.bg,
              boxShadow: `0 0 0 2px ${vars.surface.bg.DEFAULT}, 0 0 0 4px ${vars.error['400']}`,
            },
          },
        },
      },
    },
    defaultVariants: {
      intent: 'default',
    },
  },
  'slider-thumb',
);

const inputStyle = style(
  {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    opacity: 0,
    margin: 0,
    padding: 0,
    cursor: 'pointer',
    zIndex: 1,
    appearance: 'none',
    WebkitAppearance: 'none',
    ':disabled': {
      cursor: 'not-allowed',
    },
    selectors: {
      '&::-webkit-slider-thumb': {
        appearance: 'none',
        WebkitAppearance: 'none',
        width: sliderContract.thumb.size,
        height: sliderContract.thumb.size,
      },
      '&::-moz-range-thumb': {
        width: sliderContract.thumb.size,
        height: sliderContract.thumb.size,
        border: 'none',
      },
    },
  },
  'slider-input',
);

export type SliderVariants = RecipeVariants<typeof sliderRecipe>;

export interface SliderProps extends Omit<
  ElementProps<HTMLInputElement>,
  'size' | 'value' | 'defaultValue' | 'type'
> {
  /** The controlled numeric value of the slider. */
  value?: number;
  /** The initial uncontrolled numeric value of the slider. Defaults to min or 0. */
  defaultValue?: number;
  /** The minimum permitted value. Defaults to 0. */
  min?: number;
  /** The maximum permitted value. Defaults to 100. */
  max?: number;
  /** The granularity of stepping. Defaults to 1. */
  step?: number;
  /** Visual intent. Defaults to 'default'. */
  intent?: SliderVariants['intent'];
  /** Size variant. Defaults to 'md'. */
  size?: SliderVariants['size'];
  /** Callback fired with the new numeric value when value changes. */
  onValueChange?: (value: number) => void;
}

export function Slider({
  value,
  defaultValue,
  min = 0,
  max = 100,
  step = 1,
  intent = 'default',
  size = 'md',
  disabled = false,
  className,
  id,
  onChange,
  onValueChange,
  ref,
  ...props
}: SliderProps): React.JSX.Element {
  const [uncontrolledValue, setUncontrolledValue] = useState<number>(defaultValue ?? min);
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : uncontrolledValue;

  const minVal = min;
  const maxVal = max;
  const clampedValue = Math.min(Math.max(currentValue, minVal), maxVal);
  const range = maxVal - minVal;
  const percent = range > 0 ? ((clampedValue - minVal) / range) * 100 : 0;
  const clampedPercent = Math.min(Math.max(percent, 0), 100);

  const inputRef = useRef<HTMLInputElement>(null);
  const mergedRef = useMergeRefs(inputRef, ref);

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const nextValue = Number(event.target.value);
      if (!isControlled) {
        setUncontrolledValue(nextValue);
      }
      onChange?.(event);
      onValueChange?.(nextValue);
    },
    [isControlled, onChange, onValueChange],
  );

  const rootClasses = sliderRecipe({
    size,
    disabled,
    intent,
  });

  const rangeClasses = sliderRangeRecipe({
    intent,
  });

  const thumbClasses = sliderThumbRecipe({
    intent,
  });

  return (
    <span data-slider-root="" className={cx(sliderTheme.className, rootClasses, className)}>
      <span className={trackWrapperStyle.className}>
        <span className={trackStyle.className}>
          <span
            data-slider-range=""
            className={rangeClasses}
            style={{ width: `${clampedPercent}%` }}
            aria-hidden="true"
          />
        </span>
        <span
          data-slider-thumb=""
          className={thumbClasses}
          style={{ left: `${clampedPercent}%` }}
          aria-hidden="true"
        />
      </span>
      <input
        ref={mergedRef}
        type="range"
        id={id}
        min={minVal}
        max={maxVal}
        step={step}
        value={clampedValue}
        disabled={disabled}
        onChange={handleChange}
        className={inputStyle.className}
        aria-invalid={intent === 'error' ? true : undefined}
        {...props}
      />
    </span>
  );
}

Slider.displayName = 'Slider';
