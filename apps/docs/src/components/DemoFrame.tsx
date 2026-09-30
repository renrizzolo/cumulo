import React from 'react';
import { recipe, cx, type RecipeVariants } from '@cumulo/css';
import { vars, type ElementProps } from '@cumulo/core';

export const demoFrameRecipe = recipe(
  {
    base: {
      width: '100%',
      boxSizing: 'border-box',
      display: 'flex',
      borderRadius: vars.radius.lg,
      overflow: 'hidden',
    },
    variants: {
      bordered: {
        true: {
          borderWidth: 1,
          borderStyle: 'solid',
          borderColor: vars.surface.border,
        },
        false: {
          borderWidth: 0,
        },
      },
      height: {
        xs: { height: '180px' },
        sm: { height: '240px' },
        md: { height: '320px' },
        lg: { height: '360px' },
        auto: { height: 'auto' },
      },
      maxWidth: {
        xs: { maxWidth: '280px' },
        sm: { maxWidth: '400px' },
        md: { maxWidth: '500px' },
        lg: { maxWidth: '640px' },
        full: { maxWidth: '100%' },
      },
      direction: {
        row: { flexDirection: 'row' },
        column: { flexDirection: 'column' },
      },
      bg: {
        default: { backgroundColor: vars.surface.bg.DEFAULT },
        next: { backgroundColor: vars.surface.bg.next },
      },
      padding: {
        none: { padding: 0 },
        xs: { padding: vars.spacing.xs },
        sm: { padding: vars.spacing.sm },
        md: { padding: vars.spacing.md },
      },
    },
    defaultVariants: {
      bordered: true,
      height: 'auto',
      maxWidth: 'full',
      direction: 'column',
      bg: 'default',
      padding: 'none',
    },
  },
  'demo-frame',
);

export type DemoFrameVariants = RecipeVariants<typeof demoFrameRecipe>;

export interface DemoFrameProps extends ElementProps<HTMLDivElement> {
  bordered?: DemoFrameVariants['bordered'];
  height?: DemoFrameVariants['height'];
  maxWidth?: DemoFrameVariants['maxWidth'];
  direction?: DemoFrameVariants['direction'];
  bg?: DemoFrameVariants['bg'];
  padding?: DemoFrameVariants['padding'];
  children?: React.ReactNode;
}

export function DemoFrame({
  bordered = true,
  height = 'auto',
  maxWidth = 'full',
  direction = 'column',
  bg = 'default',
  padding = 'none',
  className,
  children,
  ref,
  ...props
}: DemoFrameProps): React.JSX.Element {
  const classes = demoFrameRecipe({ bordered, height, maxWidth, direction, bg, padding });
  return (
    <div ref={ref} className={cx(classes, className)} {...props}>
      {children}
    </div>
  );
}

DemoFrame.displayName = 'DemoFrame';
