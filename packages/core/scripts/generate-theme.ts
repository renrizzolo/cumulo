import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runThemeGeneration } from '../src/cli/themeGenerator.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseCssPath = path.resolve(__dirname, '../src/theme.css');
const outPath = path.resolve(__dirname, '../src/contract.ts');

await runThemeGeneration({
  baseCssPath,
  outPath,
});
