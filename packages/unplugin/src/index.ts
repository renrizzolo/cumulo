import { createUnplugin } from 'unplugin';
import { shouldProcessFile, extractCssFromCode, extractCssFromFile } from './core/extractor.js';
import type { CumuloPluginOptions } from './types.js';

export * from './types.js';
export { shouldProcessFile, extractCssFromCode, extractCssFromFile };

const VIRTUAL_CSS_SUFFIX = '.cumulo.css';
const cssMap = new Map<string, string>();

const normalizeId = (id: string): string =>
  id.replace(/^\0/, '').replace(/\\/g, '/').split('?')[0] || '';

export const unplugin = createUnplugin<CumuloPluginOptions | undefined, false>(
  (options: CumuloPluginOptions | undefined = {}) => {
    const virtualModuleId = options?.virtualModuleId;
    const virtualSuffix = virtualModuleId || VIRTUAL_CSS_SUFFIX;

    return {
      name: 'cumulo-unplugin',
      enforce: 'pre',

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

        const css = (await extractCssFromCode(code, id)) || (await extractCssFromFile(id));

        if (!css) {
          return null;
        }

        const rawVirtualId = `${id}${virtualSuffix}`;
        const normalizedVirtualId = normalizeId(rawVirtualId);
        cssMap.set(normalizedVirtualId, css);
        cssMap.set(rawVirtualId, css);

        // Inject the virtual CSS import into the module
        const transformedCode = `import ${JSON.stringify(rawVirtualId)};\n${code}`;

        return {
          code: transformedCode,
          map: null,
        };
      },
    };
  },
);

export default unplugin;
