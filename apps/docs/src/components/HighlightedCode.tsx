import React from 'react';
import { highlightCode } from '../highlighter';

export interface HighlightedCodeProps {
  code: string;
  language?: string;
}

export async function HighlightedCode({
  code,
  language = 'tsx',
}: HighlightedCodeProps): Promise<React.JSX.Element> {
  const cleanCode = code.trim();
  const highlightedCode = await highlightCode(cleanCode, language);

  return <div dangerouslySetInnerHTML={{ __html: highlightedCode ?? '' }} />;
}
