import React from 'react';
import { recipe, cx, type RecipeVariants } from '@cumulo/css';
import { vars } from '../contract.js';
import type { ElementProps } from '../ElementProps.js';
import { flexStyles, overflowStyles, paddingStyles, radiusStyles } from '../layout.js';
import { Surface, type SurfaceProps } from './Surface.js';
import { Header, type HeaderProps } from './Header.js';
import { HStack, VStack, type StackProps } from './Stack.js';

export const cardRecipe = recipe(
  {
    extend: [flexStyles, overflowStyles, paddingStyles, radiusStyles],
    base: {
      borderWidth: 1,
      borderStyle: 'solid',
      borderColor: vars.surface.border,
      // boxShadow: vars.shadow['0'],
    },
    variants: {},
    defaultVariants: {
      padding: 'md',
      overflow: 'hidden',
      radius: 'lg',
    },
  },
  'card',
);

export type CardVariants = RecipeVariants<typeof cardRecipe>;

export interface CardProps extends ElementProps<HTMLElement> {
  as?: SurfaceProps['as'];
  level?: SurfaceProps['level'];
  variant?: SurfaceProps['variant'];
  padding?: CardVariants['padding'];
  overflow?: CardVariants['overflow'];
  flex?: CardVariants['flex'];
  radius?: CardVariants['radius'];
  children?: React.ReactNode;
}

function CardRoot({
  as,
  level = 1,
  variant = 'default',
  padding = 'md',
  overflow = 'hidden',
  flex,
  radius = 'lg',
  className,
  children,
  ref,
  ...props
}: CardProps): React.JSX.Element {
  const classes = cardRecipe({ padding, overflow, flex, radius });

  return (
    <Surface
      as={as}
      ref={ref}
      level={level}
      variant={variant}
      padding={padding}
      radius={radius}
      overflow={overflow}
      flex={flex}
      className={cx(classes, className)}
      {...props}
    >
      {children}
    </Surface>
  );
}

function CardBody({
  gap = 'sm',
  flex = 1,
  children,
  ref,
  ...props
}: StackProps): React.JSX.Element {
  return (
    <VStack ref={ref} gap={gap} flex={flex} {...props}>
      {children}
    </VStack>
  );
}

function CardFooter({
  gap = 'xs',
  justify = 'end',
  align = 'center',
  children,
  ref,
  ...props
}: StackProps): React.JSX.Element {
  return (
    <HStack ref={ref} gap={gap} justify={justify} align={align} {...props}>
      {children}
    </HStack>
  );
}

CardRoot.displayName = 'Card';
CardBody.displayName = 'Card.Body';
CardFooter.displayName = 'Card.Footer';

export const Card = Object.assign(CardRoot, {
  Root: CardRoot,
  Header,
  Body: CardBody,
  Footer: CardFooter,
});

export { CardRoot as Root, Header, CardBody as Body, CardFooter as Footer };

export type {
  CardProps as RootProps,
  HeaderProps,
  StackProps as BodyProps,
  StackProps as FooterProps,
};
