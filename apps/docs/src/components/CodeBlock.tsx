import React from 'react';

export interface CodeBlockProps extends React.HTMLAttributes<HTMLPreElement> {
  children?: React.ReactNode;
  className?: string;
  code?: string;
  language?: string;
}

export function CodeBlock({ children, className, code, language, ...props }: CodeBlockProps) {
  const content = code || (typeof children === 'string' ? children : children);
  const lang = language || (className ? className.replace(/language-/, '') : '');

  return (
    <div className="docs-code-block" style={{ position: 'relative', margin: '20px 0' }}>
      {lang && (
        <span
          style={{
            position: 'absolute',
            top: '8px',
            right: '12px',
            fontSize: '11px',
            textTransform: 'uppercase',
            color: '#8892b0',
            letterSpacing: '0.05em',
            fontFamily: 'var(--docs-mono)',
            userSelect: 'none',
          }}
        >
          {lang}
        </span>
      )}
      <pre className={className} {...props}>
        <code>{content}</code>
      </pre>
    </div>
  );
}

export default CodeBlock;
