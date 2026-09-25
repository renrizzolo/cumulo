import React from 'react';
import type { ElementProps } from '../ElementProps.js';
import { Heading, HeadingVariants, type HeadingLevel } from './Heading.js';
import { Text } from './Text.js';
import { VStack, HStack, type StackVariants } from './Stack.js';

export interface HeaderProps extends ElementProps<HTMLDivElement> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  headingAs?: HeadingLevel;
  size?: HeadingVariants['size'];
  gap?: StackVariants['gap'];
  align?: StackVariants['align'];
  actions?: React.ReactNode;
  children?: React.ReactNode;
}

export function Header({
  title,
  description,
  headingAs = 'h4',
  gap = 'sm',
  align = 'start',
  size,
  actions,
  children,
  className,
  ref,
  ...props
}: HeaderProps): React.JSX.Element {
  const content = (
    <VStack gap={gap} align={align} className={className} ref={ref} {...props}>
      {title &&
        (typeof title === 'string' ? (
          <Heading size={size} as={headingAs}>
            {title}
          </Heading>
        ) : (
          title
        ))}
      {description &&
        (typeof description === 'string' ? (
          <Text type="caption" color="muted">
            {description}
          </Text>
        ) : (
          description
        ))}
      {children}
    </VStack>
  );

  if (actions) {
    return (
      <HStack justify="between" align="center" wrap="wrap" gap="sm">
        {content}
        {actions}
      </HStack>
    );
  }

  return content;
}
