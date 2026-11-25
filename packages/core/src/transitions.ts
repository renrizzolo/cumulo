import type { StyleRule } from '@cumulo/css';

import { vars } from './contract.js';

export type SlideDirection = 'top' | 'bottom' | 'left' | 'right';

export interface DiscreteTransitionOptions {
  /**
   * Selector matching the open/visible state (e.g. `'&:popover-open'`, `'&[open]'`, `'&[data-state="open"]'`).
   */
  openSelector: string;
  /**
   * Transition duration CSS value (typically a `vars.duration.*` token or theme contract variable).
   * @default vars.duration.fast
   */
  duration?: string;
  /**
   * Transition easing function.
   * @default vars.ease.default
   */
  ease?: string;
  /**
   * Whether the element enters/exits the browser top layer (`<dialog>`, `[popover]`, `::picker(select)`).
   * When `true`, includes `overlay ... allow-discrete` alongside `display ... allow-discrete`.
   * @default true
   */
  topLayer?: boolean;
}

export interface DiscreteFadeScaleOptions extends DiscreteTransitionOptions {
  /**
   * Closed/starting scale factor.
   * @default 0.96
   */
  scale?: number;
}

export interface DiscreteSlideOptions extends DiscreteTransitionOptions {
  /**
   * Edge from which the element slides in and back out to.
   */
  from: SlideDirection;
}

export interface DiscreteBackdropOptions {
  /**
   * Selector matching the open element whose `::backdrop` is visible.
   * @default '&[open]::backdrop'
   */
  openSelector?: string;
  /**
   * Transition duration CSS value.
   * @default vars.duration.normal
   */
  duration?: string;
  /**
   * Transition easing function.
   * @default vars.ease.default
   */
  ease?: string;
}

function buildDiscreteTransition(
  properties: readonly string[],
  duration: string,
  ease: string,
  topLayer: boolean,
): string {
  const parts = properties.map((prop) => `${prop} ${duration} ${ease}`);
  if (topLayer) {
    parts.push(`overlay ${duration} ${ease} allow-discrete`);
  }
  parts.push(`display ${duration} ${ease} allow-discrete`);
  return parts.join(', ');
}

function getSlideTransform(from: SlideDirection): string {
  switch (from) {
    case 'top':
      return 'translateY(-100%)';
    case 'bottom':
      return 'translateY(100%)';
    case 'left':
      return 'translateX(-100%)';
    case 'right':
      return 'translateX(100%)';
  }
}

/**
 * Composable CSS discrete-property fade transition (`opacity` + `allow-discrete` + `@starting-style`),
 * automatically disabled under `prefers-reduced-motion: reduce`.
 */
export function discreteFade({
  openSelector,
  duration = vars.duration.fast,
  ease = vars.ease.default,
  topLayer = true,
}: DiscreteTransitionOptions): StyleRule {
  return {
    opacity: 0,
    transition: buildDiscreteTransition(['opacity'], duration, ease, topLayer),
    selectors: {
      [openSelector]: {
        opacity: 1,
        '@starting-style': {
          opacity: 0,
        },
      },
    },
    '@media': {
      '(prefers-reduced-motion: reduce)': {
        transition: 'none',
      },
    },
  };
}

/**
 * Composable CSS discrete-property fade + subtle scale transition (`opacity`, `transform`,
 * `allow-discrete`, `@starting-style`), automatically disabled under `prefers-reduced-motion: reduce`.
 */
export function discreteFadeScale({
  openSelector,
  duration = vars.duration.fast,
  ease = vars.ease.default,
  topLayer = true,
  scale = 0.96,
}: DiscreteFadeScaleOptions): StyleRule {
  const closedTransform = `scale(${scale})`;
  return {
    opacity: 0,
    transform: closedTransform,
    transition: buildDiscreteTransition(['opacity', 'transform'], duration, ease, topLayer),
    selectors: {
      [openSelector]: {
        opacity: 1,
        transform: 'scale(1)',
        '@starting-style': {
          opacity: 0,
          transform: closedTransform,
        },
      },
    },
    '@media': {
      '(prefers-reduced-motion: reduce)': {
        transition: 'none',
      },
    },
  };
}

/**
 * Composable CSS discrete-property slide transition (`transform`, `allow-discrete`, `@starting-style`),
 * automatically disabled under `prefers-reduced-motion: reduce`.
 */
export function discreteSlide({
  openSelector,
  from,
  duration = vars.duration.normal,
  ease = vars.ease.default,
  topLayer = true,
}: DiscreteSlideOptions): StyleRule {
  const closedTransform = getSlideTransform(from);
  return {
    transform: closedTransform,
    transition: buildDiscreteTransition(['transform'], duration, ease, topLayer),
    selectors: {
      [openSelector]: {
        transform: 'translate3d(0, 0, 0)',
        '@starting-style': {
          transform: closedTransform,
        },
      },
    },
    '@media': {
      '(prefers-reduced-motion: reduce)': {
        transition: 'none',
      },
    },
  };
}

/**
 * Composable CSS discrete-property fade transition for native top-layer `::backdrop` pseudo-elements.
 */
export function discreteBackdrop({
  openSelector = '&[open]::backdrop',
  duration = vars.duration.normal,
  ease = vars.ease.default,
}: DiscreteBackdropOptions = {}): StyleRule {
  return {
    selectors: {
      '&::backdrop': {
        opacity: 0,
        transition: buildDiscreteTransition(['opacity'], duration, ease, true),
        '@media': {
          '(prefers-reduced-motion: reduce)': {
            transition: 'none',
          },
        },
      },
      [openSelector]: {
        opacity: 1,
        '@starting-style': {
          opacity: 0,
        },
      },
    },
  };
}

/**
 * Standard discrete enter/exit fade + scale transition for native `[popover]` overlays
 * (`Popover`, `Tooltip`, `Menu`).
 */
export const popoverTransition: StyleRule = discreteFadeScale({
  openSelector: '&:popover-open',
  duration: vars.duration.fast,
  scale: 0.96,
});

/**
 * Standard discrete enter/exit fade + scale transition for customizable `<select>` pickers
 * (`::picker(select)`).
 */
export const selectPickerTransition: StyleRule = {
  selectors: {
    '&::picker(select)': {
      opacity: 0,
      transform: 'scale(0.96)',
      transition: buildDiscreteTransition(
        ['opacity', 'transform'],
        vars.duration.fast,
        vars.ease.default,
        true,
      ),
      '@media': {
        '(prefers-reduced-motion: reduce)': {
          transition: 'none',
        },
      },
    },
    '&:open::picker(select)': {
      opacity: 1,
      transform: 'scale(1)',
      '@starting-style': {
        opacity: 0,
        transform: 'scale(0.96)',
      },
    },
  },
};
