export {
  cleanSourceCode,
  extractAndRewrite,
  extractCss,
  extractCssFromCode,
  extractCssFromFile,
  shouldProcessFile,
  type ExtractAndRewriteResult,
  type ExtractCssRequest,
  type ExtractCssResult,
} from './core/extractor.js';
export { syncThemeContract, type SyncThemeResult } from './core/themeSync.js';
export type { CumuloThemeOptions } from './types.js';
