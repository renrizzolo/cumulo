import React from 'react';
import { recipe, cx, type RecipeVariants } from '@cumulo/css';
import type { ElementProps } from '../ElementProps.js';
import { flexStyles, gapStyles } from '../layout.js';

export const stackRecipe = recipe(
  {
    extend: [flexStyles, gapStyles],
    base: {
      display: 'flex',
    },
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

export interface StackProps extends ElementProps<HTMLDivElement> {
  direction?: StackVariants['direction'];
  gap?: StackVariants['gap'];
  align?: StackVariants['align'];
  justify?: StackVariants['justify'];
  wrap?: StackVariants['wrap'];
  inline?: StackVariants['inline'];
  flex?: StackVariants['flex'];
  children?: React.ReactNode;
}

export function Stack({
  direction = 'column',
  gap = 'none',
  align = 'stretch',
  justify = 'start',
  wrap = 'nowrap',
  inline = false,
  flex,
  className,
  children,
  ref,
  ...props
}: StackProps): React.JSX.Element {
  const classes = stackRecipe({ direction, gap, align, justify, wrap, inline, flex });

  return (
    <div ref={ref} className={cx(classes, className)} {...props}>
      {children}
    </div>
  );
}

export function HStack({
  direction = 'row',
  align = 'center',
  ...props
}: StackProps): React.JSX.Element {
  return <Stack direction={direction} align={align} {...props} />;
}

export function VStack({ direction = 'column', ...props }: StackProps): React.JSX.Element {
  return <Stack direction={direction} {...props} />;
}
