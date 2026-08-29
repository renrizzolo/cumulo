import { Card, vars, type ElementProps } from '@cumulo/core';
import { cx, style } from '@cumulo/css';
import React from 'react';
import { HighlightedCode } from './HighlightedCode';

export interface CodeBlockProps extends ElementProps<HTMLDivElement> {
  children: string;
  className?: string;
  language?: string;
}

const codeBlockContainerStyle = style({
  fontFamily: vars.font.mono,
  fontSize: vars.font.size.xs,
  lineHeight: vars.line.height.relaxed,
  overflowX: 'auto',
});

export function CodeBlock({
  children,
  className,
  language = 'typescript',
  ...props
}: CodeBlockProps): React.JSX.Element {
  return (
    <Card className={cx(codeBlockContainerStyle.className, className)} {...props}>
      <HighlightedCode code={children} language={language} />
    </Card>
  );
}
