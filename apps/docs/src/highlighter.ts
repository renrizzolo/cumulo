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

export async function highlightCode(code: string, lang = 'tsx'): Promise<string | null> {
  try {
    const highlighter = await getSingletonHighlighter({
      langs: supportedLangs,
      themes: [cumuloTheme],
    });

    const isSupported = (supportedLangs as readonly string[]).includes(lang);
    const resolvedLang = (isSupported ? lang : 'tsx') as BundledLanguage;

    return highlighter.codeToHtml(code, {
      lang: resolvedLang,
      theme: cumuloTheme,
    });
  } catch (err: unknown) {
    console.error('Error highlighting code:', err);
    return null;
  }
}
