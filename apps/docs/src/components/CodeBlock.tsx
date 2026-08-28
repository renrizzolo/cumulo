import React from 'react';
import { Card, Badge } from '@cumulo/core';

export interface CodeBlockProps extends React.HTMLAttributes<HTMLPreElement> {
  children?: React.ReactNode;
  className?: string;
  code?: string;
  language?: string;
}

export function CodeBlock({
  children,
  className,
  code,
  language,
  ...props
}: CodeBlockProps): React.JSX.Element {
  const content = code || (typeof children === 'string' ? children : children);
  const lang = language || (className ? className.replace(/language-/, '') : '');

  return (
    <Card
      level={2}
      padding="none"
      style={{
        position: 'relative',
        margin: '20px 0',
        overflow: 'hidden',
      }}
    >
      {lang && (
        <div style={{ position: 'absolute', top: '10px', right: '12px', zIndex: 1 }}>
          <Badge variant="secondary" size="small">
            {lang}
          </Badge>
        </div>
      )}
      <pre
        className={className}
        style={{
          margin: 0,
          padding: '16px 20px',
          overflowX: 'auto',
          fontSize: '13px',
          lineHeight: 1.6,
          fontFamily: 'var(--theme-font-mono, monospace)',
          backgroundColor: 'transparent',
        }}
        {...props}
      >
        <code>{content}</code>
      </pre>
    </Card>
  );
}

export default CodeBlock;
