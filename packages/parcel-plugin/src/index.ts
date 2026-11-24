import {
  cleanSourceCode,
  extractCss as extractCssBase,
  syncThemeContract,
  type CumuloThemeOptions,
  type ExtractCssRequest,
  type ExtractCssResult,
  type SyncThemeResult,
} from '@cumulo/unplugin/extractor';

export {
  cleanSourceCode,
  syncThemeContract,
  type CumuloThemeOptions,
  type ExtractCssRequest,
  type ExtractCssResult,
  type SyncThemeResult,
};

export function extractCss(request: ExtractCssRequest): Promise<ExtractCssResult> {
  return extractCssBase({
    ...request,
    isolateDependencies: request.isolateDependencies ?? true,
  });
}
