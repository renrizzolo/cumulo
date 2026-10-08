import React from 'react';
import { highlightCode } from '../highlighter';
import { format } from 'oxfmt';

export interface HighlightedCodeProps {
  code: string;
  language?: string;
}

export async function HighlightedCode({
  code,
  language = 'tsx',
}: HighlightedCodeProps): Promise<React.JSX.Element> {
  const cleanCode = code.trim();
  const formatted = await format(`code.${language}`, cleanCode);

  if (formatted.errors.length) {
    console.error('failed to format code block', language, cleanCode, formatted.errors);
  }

  const highlighted = (await highlightCode(formatted.code, language)) ?? '';

  return <div dangerouslySetInnerHTML={{ __html: highlighted }} />;
}
