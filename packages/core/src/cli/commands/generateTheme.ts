import path from 'node:path';
import { runThemeGeneration } from '../themeGenerator.js';

export interface GenerateThemeCommandArgs {
  css?: string;
  out?: string;
  'in-place'?: boolean;
  'base-css'?: string;
  silent?: boolean;
}

export async function handleGenerateTheme(args: GenerateThemeCommandArgs): Promise<void> {
  const customCssPath = args.css ? path.resolve(process.cwd(), args.css) : undefined;
  const outPath = args.out ? path.resolve(process.cwd(), args.out) : undefined;
  const baseCssPath = args['base-css'] ? path.resolve(process.cwd(), args['base-css']) : undefined;
  const inPlace = args['in-place'] ?? false;
  const silent = args.silent ?? false;

  await runThemeGeneration({
    customCssPath,
    outPath,
    baseCssPath,
    inPlace,
    silent,
  });
}
