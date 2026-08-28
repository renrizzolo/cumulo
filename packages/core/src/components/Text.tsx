import React from 'react';
import { recipe, cx, type RecipeVariants } from '@cumulo/css';
import { vars } from '../contract.js';
import type { ElementProps } from '../ElementProps.js';

export const textRecipe = recipe(
  {
    base: {
      fontFamily: vars.font.sans,
      color: vars.surface.fg,
      margin: 0,
    },
    variants: {
      type: {
        body: {
          fontSize: vars.font.size.base,
          lineHeight: vars.line.height.relaxed,
          fontWeight: vars.font.weight.normal,
        },
        label: {
          fontSize: vars.font.size.sm,
          lineHeight: vars.line.height.tight,
          fontWeight: vars.font.weight.medium,
        },
        display: {
          fontSize: vars.font.size['3xl'],
          lineHeight: vars.line.height.tight,
          fontWeight: vars.font.weight.bold,
          letterSpacing: '-0.025em',
        },
        lead: {
          fontSize: vars.font.size.lg,
          lineHeight: vars.line.height.relaxed,
          fontWeight: vars.font.weight.normal,
          color: vars.surface.muted,
        },
        caption: {
          fontSize: vars.font.size.xs,
          lineHeight: vars.line.height.normal,
          fontWeight: vars.font.weight.normal,
          color: vars.surface.muted,
        },
        code: {
          fontFamily: vars.font.mono,
          fontSize: vars.font.size.sm,
          lineHeight: vars.line.height.normal,
          fontWeight: vars.font.weight.normal,
        },
      },
      size: {
        '2xs': { fontSize: vars.font.size['2xs'] },
        xs: { fontSize: vars.font.size.xs },
        sm: { fontSize: vars.font.size.sm },
        base: { fontSize: vars.font.size.base },
        md: { fontSize: vars.font.size.md },
        lg: { fontSize: vars.font.size.lg },
        xl: { fontSize: vars.font.size.xl },
        '2xl': { fontSize: vars.font.size['2xl'] },
        '3xl': { fontSize: vars.font.size['3xl'] },
      },
      weight: {
        normal: { fontWeight: vars.font.weight.normal },
        medium: { fontWeight: vars.font.weight.medium },
        semibold: { fontWeight: vars.font.weight.semibold },
        bold: { fontWeight: vars.font.weight.bold },
      },
      lineHeight: {
        none: { lineHeight: vars.line.height.none },
        tight: { lineHeight: vars.line.height.tight },
        normal: { lineHeight: vars.line.height.normal },
        relaxed: { lineHeight: vars.line.height.relaxed },
      },
      color: {
        default: { color: vars.surface.fg },
        muted: { color: vars.surface.muted },
        subtle: { color: vars.subtle },
        primary: { color: vars.primary.DEFAULT },
        error: { color: vars.error.fg },
        success: { color: vars.success.fg },
        warning: { color: vars.warning.fg },
        inherit: { color: 'inherit' },
      },
    },
    defaultVariants: {
      type: 'body',
      color: 'default',
    },
  },
  'text',
);

export type TextVariants = RecipeVariants<typeof textRecipe>;

export type TextSemanticType = 'body' | 'label' | 'display' | 'lead' | 'caption' | 'code';
export type TextElement = 'p' | 'span' | 'div' | 'label' | 'code' | 'small' | 'strong' | 'em';

export interface TextProps extends ElementProps<HTMLElement> {
  /** Semantic type that contextually sets size, line-height, and font weight */
  type?: TextSemanticType;
  /** Explicit element override */
  as?: TextElement;
  size?: '2xs' | 'xs' | 'sm' | 'base' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  lineHeight?: 'none' | 'tight' | 'normal' | 'relaxed';
  color?: 'default' | 'muted' | 'subtle' | 'primary' | 'error' | 'success' | 'warning' | 'inherit';
  children?: React.ReactNode;
}

const defaultElementForType: Record<TextSemanticType, TextElement> = {
  body: 'p',
  label: 'span',
  display: 'div',
  lead: 'p',
  caption: 'span',
  code: 'code',
};

export function Text({
  type = 'body',
  as,
  size,
  weight,
  lineHeight,
  color = 'default',
  className,
  children,
  ref,
  ...props
}: TextProps): React.JSX.Element {
  const Component = as ?? defaultElementForType[type] ?? 'p';
  const classes = textRecipe({
    type,
    size,
    weight,
    lineHeight,
    color,
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
