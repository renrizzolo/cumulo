import React from 'react';
import { recipe, cx } from '@cumulo/css';
import { vars } from '../contract.js';
import type { ElementProps } from '../ElementProps.js';

export const flowRecipe = recipe(
  {
    base: {
      selectors: {
        '& > * + *': {
          marginBlockStart: 'var(--flow-space, 1em)',
        },
      },
    },
    variants: {
      space: {
        none: { '--flow-space': vars.spacing.none },
        '3xs': { '--flow-space': vars.spacing['3xs'] },
        '2xs': { '--flow-space': vars.spacing['2xs'] },
        xs: { '--flow-space': vars.spacing.xs },
        sm: { '--flow-space': vars.spacing.sm },
        md: { '--flow-space': vars.spacing.md },
        lg: { '--flow-space': vars.spacing.lg },
        xl: { '--flow-space': vars.spacing.xl },
        '2xl': { '--flow-space': vars.spacing['2xl'] },
        inherit: { '--flow-space': '1em' },
      },
      prose: {
        true: {
          '--flow-space': vars.spacing.lg,
          selectors: {
            '& > * + *': {
              marginBlockStart: 'var(--flow-space, 1.5rem)',
            },
            '& :is(h2, h3, h4) + *': {
              '--flow-space': vars.spacing.sm,
            },
          },
        },
      },
    },
    defaultVariants: {
      space: 'inherit',
    },
  },
  'flow',
);

export interface FlowProps extends ElementProps<HTMLElement> {
  as?: 'div' | 'article' | 'section' | 'main' | 'aside' | 'form';
  space?: 'none' | '3xs' | '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'inherit';
  prose?: boolean;
  children?: React.ReactNode;
}

export function Flow({
  as: Component = 'div',
  space = 'inherit',
  prose,
  className,
  children,
  ref,
  ...props
}: FlowProps): React.JSX.Element {
  const classes = flowRecipe({
    space,
    prose: prose ? true : undefined,
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
