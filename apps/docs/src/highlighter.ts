import { getSingletonHighlighter, type BundledLanguage } from 'shiki';
import { cumuloTheme } from './shikiTheme';

const supportedLangs: BundledLanguage[] = [
  'javascript',
  'typescript',
  'json',
  'tsx',
  'jsx',
  'bash',
  'shell',
  'css',
  'html',
  'markdown',
  'mdx',
];

const fileTypeToSupportedLang: Record<string, BundledLanguage> = {
  sh: 'shell',
  tsx: 'tsx',
  ts: 'ts',
  css: 'css',
  html: 'html',
  md: 'markdown',
  mdx: 'mdx',
  js: 'javascript',
  jsx: 'jsx',
  json: 'json',
};

export async function highlightCode(code: string, lang = 'tsx'): Promise<string | null> {
  try {
    const highlighter = await getSingletonHighlighter({
      langs: supportedLangs,
      themes: [cumuloTheme],
    });

    const isSupported = !!fileTypeToSupportedLang[lang];
    const resolvedLang = isSupported ? lang : 'txt';

    return highlighter.codeToHtml(code, {
      lang: resolvedLang,
      theme: cumuloTheme,
    });
  } catch (err: unknown) {
    console.error('Error highlighting code:', err);
    return null;
  }
}
