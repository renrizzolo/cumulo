import React from 'react';
import { recipe, cx, type RecipeVariants } from '@cumulo/css';
import { vars } from '../contract.js';
import { focusRing } from '../intents.js';
import { textSharedRecipe } from '../typography.js';

const linkRecipe = recipe(
  {
    extend: [focusRing, textSharedRecipe],
    base: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: vars.spacing['3xs'],
      cursor: 'pointer',
      borderRadius: vars.radius.md,
      transition: `color ${vars.duration.fast} ${vars.ease.default}, text-decoration-color ${vars.duration.fast} ${vars.ease.default}`,
    },
    variants: {
      variant: {
        default: {
          color: vars.primary.DEFAULT,
          textDecoration: 'underline',
          textUnderlineOffset: '0.2em',
          ':hover': {
            color: vars.primary.hover,
          },
        },
        subtle: {
          color: vars.surface.muted,
          textDecoration: 'none',
          ':hover': {
            color: vars.surface.fg,
            textDecoration: 'underline',
            textUnderlineOffset: '0.2em',
          },
        },
        plain: {
          color: 'inherit',
          textDecoration: 'none',
          ':hover': {
            color: vars.primary.DEFAULT,
          },
        },
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
  'link',
);

export type LinkVariants = RecipeVariants<typeof linkRecipe>;

export interface LinkBaseProps {
  variant?: LinkVariants['variant'];
  weight?: LinkVariants['weight'];
  external?: boolean;
}

export type LinkProps<E extends React.ElementType = 'a'> = LinkBaseProps & {
  as?: E;
} & Omit<React.ComponentProps<E>, keyof LinkBaseProps | 'as'>;

export function Link<E extends React.ElementType = 'a'>({
  as,
  variant = 'default',
  weight,
  external = false,
  target,
  rel,
  className,
  children,
  ref,
  ...props
}: LinkProps<E>): React.JSX.Element {
  const Component = as ?? 'a';
  const classes = linkRecipe({ variant, weight });
  const resolvedTarget = target ?? (external ? '_blank' : undefined);
  const resolvedRel = rel ?? (external ? 'noopener noreferrer' : undefined);

  return React.createElement(
    Component,
    {
      ref,
      target: resolvedTarget,
      rel: resolvedRel,
      className: cx(classes, className),
      ...props,
    },
    children,
  );
}

Link.displayName = 'Link';
