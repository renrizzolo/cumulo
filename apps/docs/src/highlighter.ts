import { getSingletonHighlighter, type BundledLanguage, type BundledTheme } from 'shiki';

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

const supportedThemes: BundledTheme[] = ['github-dark'];

export async function highlightCode(code: string, lang = 'tsx'): Promise<string | null> {
  try {
    const highlighter = await getSingletonHighlighter({
      langs: supportedLangs,
      themes: supportedThemes,
    });

    const isSupported = (supportedLangs as readonly string[]).includes(lang);
    const resolvedLang = (isSupported ? lang : 'tsx') as BundledLanguage;

    return highlighter.codeToHtml(code, {
      lang: resolvedLang,
      theme: 'github-dark',
    });
  } catch (err: unknown) {
    console.error('Error highlighting code:', err);
    return null;
  }
}
