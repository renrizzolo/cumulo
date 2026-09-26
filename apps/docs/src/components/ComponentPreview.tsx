import React from 'react';
import { CodeBlock } from './CodeBlock.js';
import { ComponentPreviewClient } from './ComponentPreviewClient.js';
import { reactNodeToJsx } from '../utils/reactNodeToJsx.js';

export function ComponentPreview({
  title,
  defaultLevel = 0,
  children,
}: {
  title?: string;
  defaultLevel?: 0 | 1 | 2;
  children: React.ReactNode;
}): React.JSX.Element {
  const codeString = reactNodeToJsx(children);
  const codeElement = <CodeBlock language="tsx">{codeString}</CodeBlock>;

  return (
    <ComponentPreviewClient
      title={title}
      code={codeElement}
      codeString={codeString}
      defaultLevel={defaultLevel}
    >
      {children}
    </ComponentPreviewClient>
  );
}
