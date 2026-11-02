import React from 'react';
import { keyframes, recipe, cx, type RecipeVariants } from '@cumulo/css';
import { vars } from '../contract.js';
import type { ElementProps } from '../ElementProps.js';

const spinKeyframes = keyframes({
  from: {
    transform: 'rotate(0deg)',
  },
  to: {
    transform: 'rotate(360deg)',
  },
});

export const spinnerRecipe = recipe(
  {
    base: {
      display: 'inline-block',
      flexShrink: 0,
      animation: `${spinKeyframes} 0.75s linear infinite`,
      color: 'currentColor',
      verticalAlign: 'middle',
    },
    variants: {
      size: {
        inherit: {
          width: '1em',
          height: '1em',
        },
        '2xs': {
          width: vars.size['4xs'],
          height: vars.size['4xs'],
        },
        xs: {
          width: vars.size['3xs'],
          height: vars.size['3xs'],
        },
        sm: {
          width: vars.size['2xs'],
          height: vars.size['2xs'],
        },
        md: {
          width: vars.size.xs,
          height: vars.size.xs,
        },
        lg: {
          width: vars.size.sm,
          height: vars.size.sm,
        },
        xl: {
          width: vars.size.md,
          height: vars.size.md,
        },
      },
      intent: {
        inherit: { color: 'currentColor' },
        primary: { color: vars.primary.DEFAULT },
        muted: { color: vars.surface.muted },
        success: { color: vars.success.bg },
        warning: { color: vars.warning.bg },
        error: { color: vars.error.bg },
        info: { color: vars.info.bg },
      },
    },
    defaultVariants: {
      size: 'md',
      intent: 'inherit',
    },
  },
  'spinner',
);

export type SpinnerVariants = RecipeVariants<typeof spinnerRecipe>;

export interface SpinnerProps extends Omit<ElementProps<SVGSVGElement>, 'role'> {
  /**
   * Size of the spinner icon. Use `'inherit'` inside buttons or text to match `1em`.
   * @default 'md'
   */
  size?: SpinnerVariants['size'];
  /**
   * Color intent of the spinner.
   * @default 'inherit'
   */
  intent?: SpinnerVariants['intent'];
  /**
   * Accessible label for screen readers when rendered standalone.
   * @default 'Loading'
   */
  label?: string;
}

export function Spinner({
  size = 'md',
  intent = 'inherit',
  label = 'Loading',
  'aria-hidden': ariaHidden,
  className,
  ref,
  ...props
}: SpinnerProps): React.JSX.Element {
  const classes = spinnerRecipe({ size, intent });

  return (
    <svg
      ref={ref}
      viewBox="0 0 24 24"
      fill="none"
      role={ariaHidden ? undefined : 'status'}
      aria-label={ariaHidden ? undefined : label}
      aria-hidden={ariaHidden}
      className={cx(classes, className)}
      {...props}
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.25" />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

Spinner.displayName = 'Spinner';
