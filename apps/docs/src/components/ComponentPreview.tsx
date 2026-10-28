import React from 'react';
import { CodeBlock } from './CodeBlock.js';
import { ComponentPreviewClient } from './ComponentPreviewClient.js';
import { reactNodeToJsx } from '../utils/reactNodeToJsx.js';
import { SupportedLanguages } from './HighlightedCode.js';

export function ComponentPreview({
  title,
  defaultLevel = 0,
  code,
  frame,
  children,
  lang = 'tsx',
}: {
  title?: string;
  defaultLevel?: 0 | 1 | 2;
  /* Used to pass in the code string for a non-inline component. */
  code?: string;
  /* Wraps the content in a bordered panel. */
  frame?: boolean;
  lang?: SupportedLanguages;
  children: React.ReactNode;
}): React.JSX.Element {
  const codeString = code ?? reactNodeToJsx(children);
  const codeElement = <CodeBlock lang={lang}>{codeString}</CodeBlock>;

  return (
    <ComponentPreviewClient
      title={title}
      code={codeElement}
      frame={frame}
      defaultLevel={defaultLevel}
    >
      {children}
    </ComponentPreviewClient>
  );
}
