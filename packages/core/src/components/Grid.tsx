import React from 'react';
import { recipe, cx, createThemeContract, type RecipeVariants } from '@cumulo/css';
import type { ElementProps } from '../ElementProps.js';
import { flexStyles, gapStyles, paddingStyles } from '../layout.js';
import type { StackTag } from './Stack.js';

export const gridContract = createThemeContract(
  {
    minColumnWidth: null,
  },
  'grid',
);

export const gridRecipe = recipe(
  {
    extend: [flexStyles, gapStyles, paddingStyles],
    base: {
      display: 'grid',
      boxSizing: 'border-box',
      width: '100%',
      ...gridContract.$set({
        minColumnWidth: '220px',
      }),
    },
    variants: {
      columns: {
        1: { gridTemplateColumns: 'repeat(1, minmax(0, 1fr))' },
        2: { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
        3: { gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' },
        4: { gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' },
        5: { gridTemplateColumns: 'repeat(5, minmax(0, 1fr))' },
        6: { gridTemplateColumns: 'repeat(6, minmax(0, 1fr))' },
        12: { gridTemplateColumns: 'repeat(12, minmax(0, 1fr))' },
        'auto-fit': {
          gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${gridContract.minColumnWidth}), 1fr))`,
        },
        'auto-fill': {
          gridTemplateColumns: `repeat(auto-fill, minmax(min(100%, ${gridContract.minColumnWidth}), 1fr))`,
        },
      },
      align: {
        start: { alignItems: 'start' },
        center: { alignItems: 'center' },
        end: { alignItems: 'end' },
        stretch: { alignItems: 'stretch' },
        baseline: { alignItems: 'baseline' },
      },
      justify: {
        start: { justifyItems: 'start' },
        center: { justifyItems: 'center' },
        end: { justifyItems: 'end' },
        stretch: { justifyItems: 'stretch' },
      },
    },
    defaultVariants: {
      columns: 'auto-fit',
      gap: 'md',
      align: 'stretch',
      justify: 'stretch',
    },
  },
  'grid',
);

export const gridItemRecipe = recipe(
  {
    base: {
      minWidth: 0,
    },
    variants: {
      colSpan: {
        1: { gridColumn: 'span 1 / span 1' },
        2: { gridColumn: 'span 2 / span 2' },
        3: { gridColumn: 'span 3 / span 3' },
        4: { gridColumn: 'span 4 / span 4' },
        6: { gridColumn: 'span 6 / span 6' },
        12: { gridColumn: 'span 12 / span 12' },
        full: { gridColumn: '1 / -1' },
      },
      rowSpan: {
        1: { gridRow: 'span 1 / span 1' },
        2: { gridRow: 'span 2 / span 2' },
        3: { gridRow: 'span 3 / span 3' },
        4: { gridRow: 'span 4 / span 4' },
      },
    },
  },
  'grid-item',
);

export type GridVariants = RecipeVariants<typeof gridRecipe>;
export type GridItemVariants = RecipeVariants<typeof gridItemRecipe>;

export interface GridProps extends ElementProps<HTMLElement> {
  as?: StackTag;
  /**
   * Number of columns or responsive `'auto-fit'` / `'auto-fill'` behavior.
   * @default 'auto-fit'
   */
  columns?: GridVariants['columns'];
  /**
   * Minimum column width when `columns` is `'auto-fit'` or `'auto-fill'`.
   * @default '220px'
   */
  minColumnWidth?: string;
  gap?: GridVariants['gap'];
  padding?: GridVariants['padding'];
  align?: GridVariants['align'];
  justify?: GridVariants['justify'];
  flex?: GridVariants['flex'];
  children?: React.ReactNode;
}

function GridRoot({
  as: Component = 'div',
  columns = 'auto-fit',
  minColumnWidth,
  gap = 'md',
  padding,
  align = 'stretch',
  justify = 'stretch',
  flex,
  style: styleProp,
  className,
  children,
  ref,
  ...props
}: GridProps): React.JSX.Element {
  const classes = gridRecipe({ columns, gap, padding, align, justify, flex });
  const customStyle = minColumnWidth
    ? {
        ...gridContract.$set({ minColumnWidth }),
        ...styleProp,
      }
    : styleProp;

  return React.createElement(
    Component,
    {
      ref,
      style: customStyle,
      className: cx(classes, className),
      ...props,
    },
    children,
  );
}

export interface GridItemProps extends ElementProps<HTMLElement> {
  as?: StackTag;
  colSpan?: GridItemVariants['colSpan'];
  rowSpan?: GridItemVariants['rowSpan'];
  children?: React.ReactNode;
}

function GridItem({
  as: Component = 'div',
  colSpan,
  rowSpan,
  className,
  children,
  ref,
  ...props
}: GridItemProps): React.JSX.Element {
  const classes = gridItemRecipe({ colSpan, rowSpan });

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

GridRoot.displayName = 'Grid';
GridItem.displayName = 'Grid.Item';

export const Grid = Object.assign(GridRoot, {
  Root: GridRoot,
  Item: GridItem,
});

export { GridRoot as Root, GridItem as Item };
