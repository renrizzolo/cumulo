import { recipe, cx, type RecipeVariants, type ResponsiveValue } from '@cumulo/css';
import React from 'react';

import type { ElementProps } from '../ElementProps.js';
import { flexStyles, gapStyles } from '../layout.js';

const stackRecipe = recipe(
  {
    layer: 'components',
    extend: [flexStyles, gapStyles],
    base: {
      display: 'flex',
    },
    responsiveVariants: ['direction', 'gap', 'align', 'justify', 'wrap'],
    variants: {
      direction: {
        row: { flexDirection: 'row' },
        column: { flexDirection: 'column' },
        'row-reverse': { flexDirection: 'row-reverse' },
        'column-reverse': { flexDirection: 'column-reverse' },
      },
      align: {
        start: { alignItems: 'flex-start' },
        center: { alignItems: 'center' },
        end: { alignItems: 'flex-end' },
        stretch: { alignItems: 'stretch' },
        baseline: { alignItems: 'baseline' },
      },
      justify: {
        start: { justifyContent: 'flex-start' },
        center: { justifyContent: 'center' },
        end: { justifyContent: 'flex-end' },
        between: { justifyContent: 'space-between' },
        around: { justifyContent: 'space-around' },
        evenly: { justifyContent: 'space-evenly' },
      },
      wrap: {
        nowrap: { flexWrap: 'nowrap' },
        wrap: { flexWrap: 'wrap' },
        'wrap-reverse': { flexWrap: 'wrap-reverse' },
      },
      inline: {
        true: { display: 'inline-flex' },
        false: { display: 'flex' },
      },
      width: {
        full: { width: '100%' },
      },
    },
    defaultVariants: {
      direction: 'column',
      gap: 'none',
      align: 'stretch',
      justify: 'start',
      wrap: 'nowrap',
      inline: false,
    },
  },
  'stack',
);

export type StackVariants = RecipeVariants<typeof stackRecipe>;

export type StackTag =
  | 'div'
  | 'section'
  | 'article'
  | 'header'
  | 'footer'
  | 'nav'
  | 'aside'
  | 'main'
  | 'form'
  | 'ul'
  | 'ol'
  | 'span';

export interface StackProps extends ElementProps<HTMLElement> {
  as?: StackTag;
  direction?: StackVariants['direction'];
  gap?: StackVariants['gap'];
  align?: StackVariants['align'];
  justify?: StackVariants['justify'];
  wrap?: StackVariants['wrap'];
  inline?: StackVariants['inline'];
  flex?: StackVariants['flex'];
  width?: StackVariants['width'];
  children?: React.ReactNode;
}

function withInitialDefault<V extends string>(
  value: ResponsiveValue<V> | undefined,
  fallback: NoInfer<V>,
): ResponsiveValue<V> {
  if (value === undefined) {
    return fallback;
  }
  if (typeof value === 'object' && value !== null && value.initial === undefined) {
    return { ...value, initial: fallback };
  }
  return value;
}

export function Stack({
  as: Component = 'div',
  direction = 'column',
  gap = 'none',
  align = 'stretch',
  justify = 'start',
  wrap = 'nowrap',
  inline = false,
  flex,
  width,
  className,
  children,
  ref,
  ...props
}: StackProps): React.JSX.Element {
  const classes = stackRecipe({ direction, gap, align, justify, wrap, inline, flex, width });

  return React.createElement(
    Component,
    {
      ref,
      className: cx(classes, className),
      ...props,
    },
    children,
  );
}

export function HStack({ direction, align, ...props }: StackProps): React.JSX.Element {
  return (
    <Stack
      direction={withInitialDefault(direction, 'row')}
      align={withInitialDefault(align, 'center')}
      {...props}
    />
  );
}

export function VStack({ direction, ...props }: StackProps): React.JSX.Element {
  return <Stack direction={withInitialDefault(direction, 'column')} {...props} />;
}
