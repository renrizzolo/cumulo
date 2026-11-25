import { style, cx } from '@cumulo/css';
import React from 'react';

import { vars } from '../contract.js';
import { Header } from './Header.js';
import { HStack, VStack, type StackProps, type StackVariants } from './Stack.js';
import { Surface, type SurfaceProps, type SurfaceVariants } from './Surface.js';

const cardStyle = style(
  {
    borderWidth: vars.surface.stroke.width,
    borderStyle: 'solid',
    borderColor: vars.surface.border,
  },
  { prefix: 'card', layer: 'components' },
);

export type CardVariants = Pick<SurfaceVariants, 'padding' | 'overflow' | 'radius'> &
  Pick<StackVariants, 'flex' | 'direction' | 'gap' | 'align' | 'justify' | 'wrap'>;

export interface CardProps extends SurfaceProps {}

function CardRoot({
  as,
  level = 1,
  variant = 'default',
  padding = 'md',
  overflow = 'hidden',
  radius = 'lg',
  className,
  children,
  ref,
  ...props
}: CardProps): React.JSX.Element {
  return (
    <Surface
      as={as}
      ref={ref}
      level={level}
      variant={variant}
      padding={padding}
      radius={radius}
      overflow={overflow}
      className={cx(cardStyle, className)}
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

export { CardRoot as Root, Header, CardBody as Body, CardFooter as Footer };

export type { CardProps as RootProps, StackProps as BodyProps, StackProps as FooterProps };
