import { recipe, cx, createThemeContract, type RecipeVariants } from '@cumulo/css';
import React from 'react';

import type { ElementProps } from '../ElementProps.js';
import {
  FLEX_VALUES,
  GAP_VALUES,
  PADDING_VALUES,
  flexStyles,
  gapStyles,
  paddingStyles,
  type FlexVariant,
  type GapVariant,
  type PaddingVariant,
} from '../layout.js';
import {
  mergeResponsiveStyles,
  respAlign,
  respColSpan,
  respColumns,
  respFlex,
  respGap,
  respJustifyItems,
  respPadding,
  respRowSpan,
  splitResponsive,
  type ResponsiveProp,
} from '../responsive.js';
import type { StackTag } from './Stack.js';

export const gridContract = createThemeContract(
  {
    minColumnWidth: null,
  },
  'grid',
);

const GRID_COLUMNS_VALUES = {
  1: 'repeat(1, minmax(0, 1fr))',
  2: 'repeat(2, minmax(0, 1fr))',
  3: 'repeat(3, minmax(0, 1fr))',
  4: 'repeat(4, minmax(0, 1fr))',
  5: 'repeat(5, minmax(0, 1fr))',
  6: 'repeat(6, minmax(0, 1fr))',
  12: 'repeat(12, minmax(0, 1fr))',
  'auto-fit': `repeat(auto-fit, minmax(min(100%, ${gridContract.minColumnWidth}), 1fr))`,
  'auto-fill': `repeat(auto-fill, minmax(min(100%, ${gridContract.minColumnWidth}), 1fr))`,
} as const;

const GRID_ALIGN_VALUES = {
  start: 'start',
  center: 'center',
  end: 'end',
  stretch: 'stretch',
  baseline: 'baseline',
} as const;

const GRID_JUSTIFY_VALUES = {
  start: 'start',
  center: 'center',
  end: 'end',
  stretch: 'stretch',
} as const;

const GRID_COL_SPAN_VALUES = {
  1: 'span 1 / span 1',
  2: 'span 2 / span 2',
  3: 'span 3 / span 3',
  4: 'span 4 / span 4',
  6: 'span 6 / span 6',
  12: 'span 12 / span 12',
  full: '1 / -1',
} as const;

const GRID_ROW_SPAN_VALUES = {
  1: 'span 1 / span 1',
  2: 'span 2 / span 2',
  3: 'span 3 / span 3',
  4: 'span 4 / span 4',
} as const;

const gridRecipe = recipe(
  {
    layer: 'components',
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
  },
  'grid',
);

const gridItemRecipe = recipe(
  {
    layer: 'components',
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

type StaticGridVariants = RecipeVariants<typeof gridRecipe>;
type StaticGridItemVariants = RecipeVariants<typeof gridItemRecipe>;

export type GridVariants = {
  columns?: ResponsiveProp<NonNullable<StaticGridVariants['columns']>>;
  gap?: GapVariant;
  padding?: PaddingVariant;
  align?: ResponsiveProp<NonNullable<StaticGridVariants['align']>>;
  justify?: ResponsiveProp<NonNullable<StaticGridVariants['justify']>>;
  flex?: FlexVariant;
};

export type GridItemVariants = {
  colSpan?: ResponsiveProp<NonNullable<StaticGridItemVariants['colSpan']>>;
  rowSpan?: ResponsiveProp<NonNullable<StaticGridItemVariants['rowSpan']>>;
};

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
  const colsRes = splitResponsive(columns, GRID_COLUMNS_VALUES, '--c-col', respColumns, 'auto-fit');
  const gapRes = splitResponsive(gap, GAP_VALUES, '--c-gap', respGap, 'md');
  const paddingRes = splitResponsive(padding, PADDING_VALUES, '--c-pad', respPadding);
  const alignRes = splitResponsive(align, GRID_ALIGN_VALUES, '--c-aln', respAlign, 'stretch');
  const justifyRes = splitResponsive(
    justify,
    GRID_JUSTIFY_VALUES,
    '--c-jsi',
    respJustifyItems,
    'stretch',
  );
  const flexRes = splitResponsive(flex, FLEX_VALUES, '--c-flx', respFlex);

  const classes = gridRecipe({
    columns: colsRes.staticValue,
    gap: gapRes.staticValue,
    padding: paddingRes.staticValue,
    align: alignRes.staticValue,
    justify: justifyRes.staticValue,
    flex: flexRes.staticValue,
  });

  const customStyle = mergeResponsiveStyles(
    styleProp,
    minColumnWidth ? gridContract.$set({ minColumnWidth }) : undefined,
    colsRes.vars,
    gapRes.vars,
    paddingRes.vars,
    alignRes.vars,
    justifyRes.vars,
    flexRes.vars,
  );

  return React.createElement(
    Component,
    {
      ref,
      style: customStyle,
      className: cx(
        classes,
        colsRes.className,
        gapRes.className,
        paddingRes.className,
        alignRes.className,
        justifyRes.className,
        flexRes.className,
        className,
      ),
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
  style: styleProp,
  className,
  children,
  ref,
  ...props
}: GridItemProps): React.JSX.Element {
  const colSpanRes = splitResponsive(colSpan, GRID_COL_SPAN_VALUES, '--c-csp', respColSpan);
  const rowSpanRes = splitResponsive(rowSpan, GRID_ROW_SPAN_VALUES, '--c-rsp', respRowSpan);

  const classes = gridItemRecipe({
    colSpan: colSpanRes.staticValue,
    rowSpan: rowSpanRes.staticValue,
  });

  const mergedStyle = mergeResponsiveStyles(styleProp, colSpanRes.vars, rowSpanRes.vars);

  return React.createElement(
    Component,
    {
      ref,
      style: mergedStyle,
      className: cx(classes, colSpanRes.className, rowSpanRes.className, className),
      ...props,
    },
    children,
  );
}

GridRoot.displayName = 'Grid';
GridItem.displayName = 'Grid.Item';

export { GridRoot as Root, GridItem as Item };

export type { GridProps as RootProps, GridItemProps as ItemProps };
