'use client';

import React, { useState, useCallback } from 'react';
import { style, cx } from '@cumulo/css';
import { Button, vars } from '@cumulo/core';

export interface CodeBlockProps extends React.HTMLAttributes<HTMLPreElement> {
  children?: React.ReactNode;
  className?: string;
  code?: string;
  language?: string;
}

const codeBlockContainerStyle = style({
  position: 'relative',
  margin: `${vars.spacing.sm} 0 ${vars.spacing.lg}`,
  borderRadius: vars.radius.lg,
  borderWidth: 1,
  borderStyle: 'solid',
  borderColor: vars.surface.border,
  backgroundColor: vars.surface.bg.next,
  overflow: 'hidden',
});

const copyButtonWrapperStyle = style({
  position: 'absolute',
  top: vars.spacing.xs,
  right: vars.spacing.xs,
  zIndex: 1,
});

const copyButtonStyle = style({
  padding: `2px ${vars.spacing.xs}`,
  height: '22px',
  fontSize: '11px',
  opacity: 0.8,
  backgroundColor: vars.surface.bg.DEFAULT,
  borderWidth: 1,
  borderStyle: 'solid',
  borderColor: vars.surface.border,
});

const preStyle = style({
  margin: 0,
  padding: `${vars.spacing.md} ${vars.spacing.lg}`,
  paddingRight: '64px',
  overflowX: 'auto',
  fontSize: vars.font.size.sm,
  lineHeight: vars.line.height.relaxed,
  fontFamily: vars.font.mono,
  color: vars.surface.fg,
  backgroundColor: 'transparent',
});

export function CodeBlock({
  children,
  className,
  code,
  language: _language,
  ...props
}: CodeBlockProps): React.JSX.Element {
  const content = code || (typeof children === 'string' ? children : String(children || ''));
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard fallback
    }
  }, [content]);

  return (
    <div className={codeBlockContainerStyle.className}>
      <div className={copyButtonWrapperStyle.className}>
        <Button
          size="small"
          variant="ghost"
          onClick={handleCopy}
          aria-label="Copy code snippet"
          className={copyButtonStyle.className}
        >
          {copied ? 'Copied!' : 'Copy'}
        </Button>
      </div>
      <pre className={cx(preStyle.className, className)} {...props}>
        <code>{content}</code>
      </pre>
    </div>
  );
}
