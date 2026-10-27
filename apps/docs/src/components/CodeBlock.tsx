import { Surface, vars, type ElementProps } from '@cumulo/core';
import { cx, style } from '@cumulo/css';
import React from 'react';
import { HighlightedCode } from './HighlightedCode';
import { CopyButton } from './CopyButton';

export interface CodeBlockProps extends ElementProps<HTMLDivElement> {
  children: string;
  className?: string;
  language?: 'ts' | 'tsx' | 'css';
  withCopy?: boolean;
}

const codeBlockContainerStyle = style({
  fontFamily: vars.font.mono,
  fontSize: vars.font.size.xs,
  lineHeight: vars.line.height.relaxed,
  overflowX: 'auto',
  position: 'relative',
});

const copyButtonStyles = style({
  position: 'absolute',
  top: vars.spacing.sm,
  right: vars.spacing.sm,
});

export function CodeBlock({
  children,
  className,
  language = 'tsx',
  withCopy = false,
  ...props
}: CodeBlockProps): React.JSX.Element {
  return (
    <Surface
      level={0}
      padding="md"
      className={cx(codeBlockContainerStyle.className, className)}
      {...props}
    >
      <HighlightedCode code={children} language={language} />
      {withCopy && <CopyButton text={children} className={copyButtonStyles.className} />}
    </Surface>
  );
}
