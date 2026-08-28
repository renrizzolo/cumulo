import React from 'react';
import { recipe, cx, type RecipeVariants } from '@cumulo/css';
import { vars } from '../contract.js';
import type { ElementProps } from '../ElementProps.js';

export const stackRecipe = recipe(
  {
    base: {
      display: 'flex',
      boxSizing: 'border-box',
    },
    variants: {
      direction: {
        row: { flexDirection: 'row' },
        column: { flexDirection: 'column' },
        'row-reverse': { flexDirection: 'row-reverse' },
        'column-reverse': { flexDirection: 'column-reverse' },
      },
      gap: {
        none: { gap: vars.spacing.none },
        '3xs': { gap: vars.spacing['3xs'] },
        '2xs': { gap: vars.spacing['2xs'] },
        xs: { gap: vars.spacing.xs },
        sm: { gap: vars.spacing.sm },
        md: { gap: vars.spacing.md },
        lg: { gap: vars.spacing.lg },
        xl: { gap: vars.spacing.xl },
        '2xl': { gap: vars.spacing['2xl'] },
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
  direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  gap?: 'none' | '3xs' | '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  inline?: boolean;
  children?: React.ReactNode;
}

export function Stack({
  direction = 'column',
  gap = 'none',
  align = 'stretch',
  justify = 'start',
  wrap = 'nowrap',
  inline = false,
  className,
  children,
  ref,
  ...props
}: StackProps): React.JSX.Element {
  const classes = stackRecipe({ direction, gap, align, justify, wrap, inline });

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
