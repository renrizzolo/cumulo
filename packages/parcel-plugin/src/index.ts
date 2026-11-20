import {
  cleanSourceCode,
  extractCss as extractCssBase,
  type ExtractCssRequest,
  type ExtractCssResult,
} from '@cumulo/unplugin/extractor';

export { cleanSourceCode, type ExtractCssRequest, type ExtractCssResult };

export function extractCss(request: ExtractCssRequest): Promise<ExtractCssResult> {
  return extractCssBase({
    ...request,
    isolateDependencies: request.isolateDependencies ?? true,
  });
}
