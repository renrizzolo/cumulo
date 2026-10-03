import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runThemeGeneration } from '../src/cli/themeGenerator.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseCssPath = path.resolve(__dirname, '../src/theme.css');
const outDir = path.resolve(__dirname, '../src');

await runThemeGeneration({
  baseCssPath,
  outDir,
});
