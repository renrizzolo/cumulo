import React from 'react';
import { CodeBlock } from './CodeBlock.js';
import { ComponentPreviewClient } from './ComponentPreviewClient.js';
import { reactNodeToJsx } from '../utils/reactNodeToJsx.js';

export interface ComponentPreviewProps {
  title?: string;
  description?: string;
  defaultLevel?: 0 | 1 | 2;
  children: React.ReactNode;
}

export function ComponentPreview({
  title,
  description,
  defaultLevel = 0,
  children,
}: ComponentPreviewProps): React.JSX.Element {
  const codeString = reactNodeToJsx(children);
  const codeElement = <CodeBlock language="tsx">{codeString}</CodeBlock>;

  return (
    <ComponentPreviewClient
      title={title}
      description={description}
      code={codeElement}
      codeString={codeString}
      defaultLevel={defaultLevel}
    >
      {children}
    </ComponentPreviewClient>
  );
}
