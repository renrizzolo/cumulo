import { recipe, cx, type RecipeVariants } from '@cumulo/css';
import React from 'react';

import { vars } from '../contract.js';
import type { ElementProps } from '../ElementProps.js';

const flowRecipe = recipe(
  {
    layer: 'components',
    base: {
      selectors: {
        '& > * + *': {
          marginBlockStart: 'var(--flow-space, 1em)',
        },
        '& > h2, & > h3, & > h4': {
          '--flow-space': vars.spacing['2xl'],
        },
      },
    },
    responsiveVariants: ['space'],
    variants: {
      space: {
        md: { '--flow-space': '1.25em' },
        lg: { '--flow-space': '1.5em' },
        xl: { '--flow-space': '1.75em' },
      },
    },
    defaultVariants: {
      space: 'lg',
    },
  },
  'flow',
);

export type FlowVariants = RecipeVariants<typeof flowRecipe>;

export interface FlowProps extends ElementProps<HTMLElement> {
  as?: 'div' | 'article' | 'section' | 'main' | 'aside' | 'form';
  space?: FlowVariants['space'];
  children?: React.ReactNode;
}

export function Flow({
  as: Component = 'div',
  space,
  className,
  children,
  ref,
  ...props
}: FlowProps): React.JSX.Element {
  const classes = flowRecipe({
    space,
  });

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

Flow.displayName = 'Flow';
