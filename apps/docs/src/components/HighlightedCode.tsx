import React from 'react';
import { highlightCode } from '../highlighter';
import { format } from 'oxfmt';

// separate as it's not actually supported by oxfmt, will ignore formatting if used.
type Txt = 'txt';

export interface HighlightedCodeProps {
  code: string;
  lang?: 'js' | 'jsx' | 'ts' | 'tsx' | 'json' | 'css' | 'md' | 'mdx' | Txt;
}

export type SupportedLanguages = HighlightedCodeProps['lang'];

export async function HighlightedCode({
  code,
  lang = 'tsx',
}: HighlightedCodeProps): Promise<React.JSX.Element> {
  const cleanCode = code.trim();
  let finalCode = cleanCode;

  // we can't format plain text.
  if (lang !== 'txt') {
    // see https://oxc.rs/docs/guide/usage/formatter/language-support.html#native
    const formatted = await format(`code.${lang}`, cleanCode, { insertFinalNewline: false });

    // we can use 'semi: false' in the formatter options, but that would add a semi colo to the
    // _beginning_ of raw jsx code. So we just remove the final semi if there is one.
    if (formatted.code.endsWith(';')) {
      formatted.code = formatted.code.slice(0, -1);
    }

    if (formatted.errors.length) {
      console.error('failed to format code block', lang, formatted.errors);
    }

    finalCode = formatted.code;
  }

  const highlighted = (await highlightCode(finalCode, lang)) ?? '';

  return <div dangerouslySetInnerHTML={{ __html: highlighted }} />;
}
