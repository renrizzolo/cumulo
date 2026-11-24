import path from 'node:path';

import { createUnplugin } from 'unplugin';

import {
  shouldProcessFile,
  extractCssFromCode,
  extractCssFromFile,
  extractAndRewrite,
} from './core/extractor.js';
import { syncThemeContract } from './core/themeSync.js';
import type { CumuloPluginOptions } from './types.js';

export * from './types.js';
export {
  shouldProcessFile,
  extractCssFromCode,
  extractCssFromFile,
  extractAndRewrite,
  syncThemeContract,
};

const VIRTUAL_CSS_SUFFIX = '.cumulo.css';
const cssMap = new Map<string, string>();

const normalizeId = (id: string): string =>
  id.replace(/^\0/, '').replace(/\\/g, '/').split('?')[0] || '';

export const unplugin = createUnplugin<CumuloPluginOptions | undefined, false>(
  (options: CumuloPluginOptions | undefined = {}) => {
    const virtualModuleId = options?.virtualModuleId;
    const virtualSuffix = virtualModuleId || VIRTUAL_CSS_SUFFIX;
    const themeOptions = options?.theme;

    return {
      name: 'cumulo-unplugin',
      enforce: 'pre',

      async buildStart() {
        if (!themeOptions) {
          return;
        }
        const result = await syncThemeContract(themeOptions);
        if (typeof this.addWatchFile === 'function') {
          this.addWatchFile(result.cssPath);
        }
      },

      async watchChange(id: string) {
        if (!themeOptions) {
          return;
        }
        if (path.resolve(id) === path.resolve(themeOptions.css)) {
          await syncThemeContract(themeOptions);
        }
      },

      resolveId(id: string) {
        const cleanId = normalizeId(id);
        if (
          cleanId.endsWith(virtualSuffix) ||
          cleanId === 'virtual:cumulo.css' ||
          (virtualModuleId && cleanId === virtualModuleId)
        ) {
          return id;
        }
        return null;
      },

      load(id: string) {
        const cleanId = normalizeId(id);
        if (
          cleanId.endsWith(virtualSuffix) ||
          cleanId === 'virtual:cumulo.css' ||
          (virtualModuleId && cleanId === virtualModuleId)
        ) {
          return cssMap.get(cleanId) || cssMap.get(id) || '';
        }
        return null;
      },

      async transform(code: string, id: string) {
        if (!shouldProcessFile(code, id, options)) {
          return null;
        }

        const result = await extractAndRewrite(code, id);

        if (!result.css && !result.code) {
          return null;
        }

        const baseCode = result.code ?? code;

        if (!result.css) {
          return {
            code: baseCode,
            map: null,
          };
        }

        const rawVirtualId = `${id}${virtualSuffix}`;
        const normalizedVirtualId = normalizeId(rawVirtualId);
        cssMap.set(normalizedVirtualId, result.css);
        cssMap.set(rawVirtualId, result.css);

        // Append the virtual CSS import at the end so directives ("use client") stay on line 1
        // and imported base component stylesheets precede dependent stylesheets.
        const transformedCode = `${baseCode}\nimport ${JSON.stringify(rawVirtualId)};\n`;

        return {
          code: transformedCode,
          map: null,
        };
      },
    };
  },
);

export const cumulo = unplugin;

export default unplugin;
