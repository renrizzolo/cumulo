import React from 'react';
import { recipe, cx, createThemeContract, type RecipeVariants } from '@cumulo/css';
import { vars } from '../contract.js';
import type { ElementProps } from '../ElementProps.js';
import { flexStyles, paddingStyles } from '../layout.js';

export const panelContract = createThemeContract(
  {
    dividerColor: null,
  },
  'panel',
);

export const panelRecipe = recipe(
  {
    extend: [flexStyles, paddingStyles],
    base: {
      display: 'flex',
      boxSizing: 'border-box',
      ...panelContract.$set({
        dividerColor: vars.surface.border,
      }),
      position: 'relative',
    },
    variants: {
      direction: {
        column: {
          flexDirection: 'column',
        },
        row: {
          flexDirection: 'row',
        },
      },
      width: {
        full: {
          width: '100%',
        },
      },
      scrollbar: {
        none: {},
        default: {
          minHeight: 0,
          minWidth: 0,
        },
        thin: {
          minHeight: 0,
          minWidth: 0,
          scrollbarWidth: 'thin',
          scrollbarColor: `${vars.surface.border} transparent`,
        },
      },
      overflow: {
        x: { overflowX: 'auto', overflowY: 'clip' },
        y: { overflowY: 'auto', overflowX: 'clip' },
        both: { overflow: 'auto' },
      },
      divider: {
        true: { borderWidth: 1 },
        false: {},
        all: { borderWidth: 1 },
        top: { borderTopWidth: 1 },
        bottom: {
          borderBottomWidth: 1,
          borderBottomColor: panelContract.dividerColor,
          borderBottomStyle: 'solid',
        },
        left: { borderLeftWidth: 1 },
        right: { borderRightWidth: 1 },
        x: { borderLeftWidth: 1, borderRightWidth: 1 },
        y: { borderTopWidth: 1, borderBottomWidth: 1 },
      },
      dividerTop: {
        true: { borderTopWidth: 1 },
      },
      dividerBottom: {
        true: { borderBottomWidth: 1 },
      },
      dividerLeft: {
        true: { borderLeftWidth: 1 },
      },
      dividerRight: {
        true: { borderRightWidth: 1 },
      },
    },
    compoundVariants: [
      {
        variants: { divider: true },
        style: {
          borderColor: panelContract.dividerColor,
          borderStyle: 'solid',
        },
      },
      {
        variants: { dividerTop: true },
        style: {
          borderTopColor: panelContract.dividerColor,
          borderTopStyle: 'solid',
        },
      },
      {
        variants: { dividerBottom: true },
        style: {
          borderBottomColor: panelContract.dividerColor,
          borderBottomStyle: 'solid',
        },
      },
      {
        variants: { dividerLeft: true },
        style: {
          borderLeftColor: panelContract.dividerColor,
          borderLeftStyle: 'solid',
        },
      },
      {
        variants: { dividerRight: true },
        style: {
          borderRightColor: panelContract.dividerColor,
          borderRightStyle: 'solid',
        },
      },
    ],
    defaultVariants: {
      direction: 'column',
      scrollbar: 'none',
      divider: false,
    },
  },
  'panel',
);

export type PanelVariants = RecipeVariants<typeof panelRecipe>;

export type PanelScrollbar = NonNullable<PanelVariants['scrollbar']>;
export type PanelOverflow = NonNullable<PanelVariants['overflow']>;
export type PanelDividerSide = 'top' | 'bottom' | 'left' | 'right';
export type PanelDividerProp = boolean | PanelDividerSide | 'x' | 'y' | 'all' | PanelDividerSide[];
export type PanelTag = 'div' | 'header' | 'main' | 'aside' | 'footer' | 'section' | 'nav';

export interface PanelProps extends ElementProps<HTMLElement> {
  /**
   * Toggles 1px border dividers along specific edge(s).
   * Can be boolean (`true` for all sides), a side string (`'bottom'`, `'top'`, `'left'`, `'right'`, `'x'`, `'y'`, `'all'`),
   * or an array of sides (`['bottom', 'right']`).
   */
  divider?: PanelDividerProp;
  /**
   * Scrollbar and overflow variant.
   * - `'none'`: no overflow container (content flows naturally).
   * - `'default'`: scrollable viewport using native browser scrollbars without custom styling.
   * - `'thin'`: scrollable viewport with thin, theme-colored scrollbars.
   * @default 'none'
   */
  scrollbar?: PanelScrollbar;
  /**
   * Axis that scrolls when `scrollbar` is `'default'` or `'thin'`. Ignored when `scrollbar` is `'none'`.
   * - `'y'`: vertical scrolling.
   * - `'x'`: horizontal scrolling.
   * - `'both'`: scroll in both directions.
   * @default 'y'
   */
  overflow?: PanelOverflow;
  /**
   * Flex layout direction.
   */
  direction?: PanelVariants['direction'];
  /**
   * Flex distribution variant.
   */
  flex?: PanelVariants['flex'];
  /**
   * Width variant.
   */
  width?: PanelVariants['width'];
  /**
   * Padding variant scale.
   */
  padding?: PanelVariants['padding'];
  /**
   * Semantic HTML tag.
   */
  as?: PanelTag;
  children?: React.ReactNode;
}

export function PanelRoot({
  as: Component = 'div',
  divider,
  scrollbar = 'none',
  overflow = 'y',
  direction = 'column',
  flex,
  padding,
  className,
  width,
  children,
  ref,
  ...props
}: PanelProps): React.JSX.Element {
  const isArray = Array.isArray(divider);
  const singleDivider = !isArray && divider !== undefined ? divider : undefined;

  const classes = panelRecipe({
    direction,
    scrollbar,
    overflow: scrollbar === 'none' ? undefined : overflow,
    flex,
    padding,
    width,
    divider: singleDivider,
    dividerTop: isArray && divider.includes('top') ? true : undefined,
    dividerBottom: isArray && divider.includes('bottom') ? true : undefined,
    dividerLeft: isArray && divider.includes('left') ? true : undefined,
    dividerRight: isArray && divider.includes('right') ? true : undefined,
  });

  return React.createElement(
    Component,
    {
      ref,
      'data-part': 'panel',
      className: cx(classes, className),
      ...props,
    },
    children,
  );
}

PanelRoot.displayName = 'Panel';

export const Panel = Object.assign(PanelRoot, {
  Root: PanelRoot,
});
