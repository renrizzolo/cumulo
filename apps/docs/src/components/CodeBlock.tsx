import { vars } from '@cumulo/core';
import { cx, style } from '@cumulo/css';
import React from 'react';
import { HighlightedCode } from './HighlightedCode';

export interface CodeBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
  code?: string;
  language?: string;
}

const codeBlockContainerStyle = style({
  background: '#0d1017',
  padding: vars.spacing.md,
  borderRadius: vars.radius.md,
});

export function CodeBlock({
  children,
  className,
  code,
  language = 'typescript',
  ...props
}: CodeBlockProps): React.JSX.Element {
  const content = code ?? (typeof children === 'string' ? children : String(children ?? ''));

  return (
    <div className={cx(codeBlockContainerStyle.className, className)} {...props}>
      <HighlightedCode code={content} language={language} />
    </div>
  );
}
