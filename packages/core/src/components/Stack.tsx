import { recipe, cx, type RecipeVariants } from '@cumulo/css';
import React from 'react';

import type { ElementProps } from '../ElementProps.js';
import {
  FLEX_VALUES,
  GAP_VALUES,
  flexStyles,
  gapStyles,
  type FlexVariant,
  type GapVariant,
} from '../layout.js';
import {
  mergeResponsiveStyles,
  respAlign,
  respDirection,
  respFlex,
  respGap,
  respJustify,
  respWrap,
  splitResponsive,
  type ResponsiveProp,
} from '../responsive.js';

const DIRECTION_VALUES = {
  row: 'row',
  column: 'column',
  'row-reverse': 'row-reverse',
  'column-reverse': 'column-reverse',
} as const;

const ALIGN_VALUES = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  stretch: 'stretch',
  baseline: 'baseline',
} as const;

const JUSTIFY_VALUES = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  between: 'space-between',
  around: 'space-around',
  evenly: 'space-evenly',
} as const;

const WRAP_VALUES = {
  nowrap: 'nowrap',
  wrap: 'wrap',
  'wrap-reverse': 'wrap-reverse',
} as const;

const stackRecipe = recipe(
  {
    layer: 'components',
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
      width: {
        full: { width: '100%' },
      },
    },
    defaultVariants: {
      inline: false,
    },
  },
  'stack',
);

type StaticStackVariants = RecipeVariants<typeof stackRecipe>;

export type StackVariants = {
  direction?: ResponsiveProp<NonNullable<StaticStackVariants['direction']>>;
  gap?: GapVariant;
  align?: ResponsiveProp<NonNullable<StaticStackVariants['align']>>;
  justify?: ResponsiveProp<NonNullable<StaticStackVariants['justify']>>;
  wrap?: ResponsiveProp<NonNullable<StaticStackVariants['wrap']>>;
  inline?: StaticStackVariants['inline'];
  flex?: FlexVariant;
  width?: StaticStackVariants['width'];
};

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
  style: styleProp,
  className,
  children,
  ref,
  ...props
}: StackProps): React.JSX.Element {
  const dirRes = splitResponsive(direction, DIRECTION_VALUES, '--c-dir', respDirection, 'column');
  const gapRes = splitResponsive(gap, GAP_VALUES, '--c-gap', respGap, 'none');
  const alignRes = splitResponsive(align, ALIGN_VALUES, '--c-aln', respAlign, 'stretch');
  const justifyRes = splitResponsive(justify, JUSTIFY_VALUES, '--c-jst', respJustify, 'start');
  const wrapRes = splitResponsive(wrap, WRAP_VALUES, '--c-wrp', respWrap, 'nowrap');
  const flexRes = splitResponsive(flex, FLEX_VALUES, '--c-flx', respFlex);

  const classes = stackRecipe({
    direction: dirRes.staticValue,
    gap: gapRes.staticValue,
    align: alignRes.staticValue,
    justify: justifyRes.staticValue,
    wrap: wrapRes.staticValue,
    inline,
    flex: flexRes.staticValue,
    width,
  });

  const mergedStyle = mergeResponsiveStyles(
    styleProp,
    dirRes.vars,
    gapRes.vars,
    alignRes.vars,
    justifyRes.vars,
    wrapRes.vars,
    flexRes.vars,
  );

  return React.createElement(
    Component,
    {
      ref,
      style: mergedStyle,
      className: cx(
        classes,
        dirRes.className,
        gapRes.className,
        alignRes.className,
        justifyRes.className,
        wrapRes.className,
        flexRes.className,
        className,
      ),
      ...props,
    },
    children,
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
