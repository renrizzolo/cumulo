import path from 'node:path';

import { DEFAULT_BREAKPOINTS, type BreakpointMap, type ResponsiveRuleEntry } from '@cumulo/css';
import { createUnplugin } from 'unplugin';

import {
  shouldProcessFile,
  extractCssFromCode,
  extractCssFromFile,
  extractAndRewrite,
} from './core/extractor.js';
import {
  createResponsiveUsageTracker,
  pruneDeadResponsiveClasses,
  type ResponsiveUsageTracker,
} from './core/responsivePruner.js';
import { syncThemeContract } from './core/themeSync.js';
import type { CumuloPluginOptions } from './types.js';

export type { CumuloPluginOptions, CumuloResponsiveSafelist, CumuloThemeOptions } from './types.js';
export {
  shouldProcessFile,
  extractCssFromCode,
  extractCssFromFile,
  extractAndRewrite,
  syncThemeContract,
};

const VIRTUAL_CSS_SUFFIX = '.cumulo.css';
const cssMap = new Map<string, string>();
const JS_SOURCE_EXT_RE = /\.(tsx?|jsx?|mjs|cjs)$/;

const normalizeId = (id: string): string =>
  id.replace(/^\0/, '').replace(/\\/g, '/').split('?')[0] || '';

function isScannableUserSource(id: string): boolean {
  const clean = normalizeId(id);
  if (!clean || clean.includes('node_modules') || clean.endsWith('.cumulo.css')) {
    return false;
  }
  return JS_SOURCE_EXT_RE.test(clean);
}

interface RollupAssetChunk {
  type?: string;
  fileName?: string;
  source?: string | Uint8Array;
}

function isRollupCssAsset(value: unknown): value is RollupAssetChunk & { source: string } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'type' in value &&
    value.type === 'asset' &&
    'fileName' in value &&
    typeof value.fileName === 'string' &&
    value.fileName.endsWith('.css') &&
    'source' in value &&
    typeof value.source === 'string'
  );
}

export const unplugin = createUnplugin<CumuloPluginOptions | undefined, false>(
  (options: CumuloPluginOptions | undefined = {}) => {
    const virtualModuleId = options?.virtualModuleId;
    const virtualSuffix = virtualModuleId || VIRTUAL_CSS_SUFFIX;
    const themeOptions = options?.theme;
    const pruneResponsive = options?.pruneResponsive !== false;
    const safelist = options?.responsiveSafelist;

    let activeBreakpoints: BreakpointMap | undefined = options?.breakpoints;
    let isDevServer = false;
    let usageTracker: ResponsiveUsageTracker = createResponsiveUsageTracker(
      Object.keys(activeBreakpoints ?? DEFAULT_BREAKPOINTS),
    );
    const emittedResponsiveRules = new Map<string, ResponsiveRuleEntry>();

    const recordResponsiveRules = (entries?: readonly ResponsiveRuleEntry[]): void => {
      if (!entries) return;
      for (const entry of entries) {
        const existing = emittedResponsiveRules.get(entry.className);
        if (!existing) {
          emittedResponsiveRules.set(entry.className, {
            ...entry,
            usages: [...entry.usages],
          });
          continue;
        }
        const mergedUsages = [...existing.usages];
        for (const u of entry.usages) {
          if (
            !mergedUsages.some(
              (prev) => prev.variantName === u.variantName && prev.optionName === u.optionName,
            )
          ) {
            mergedUsages.push(u);
          }
        }
        emittedResponsiveRules.set(entry.className, {
          ...existing,
          usages: mergedUsages,
        });
      }
    };

    const computeDeadResponsiveClasses = (): Set<string> => {
      const dead = new Set<string>();
      if (!pruneResponsive || isDevServer || emittedResponsiveRules.size === 0) {
        return dead;
      }
      for (const [className, entry] of emittedResponsiveRules) {
        if (!usageTracker.isRuleUsed(entry, safelist)) {
          dead.add(className);
        }
      }
      return dead;
    };

    const pruneRollupBundle = (_outputOptions: unknown, bundle: Record<string, unknown>): void => {
      const deadClasses = computeDeadResponsiveClasses();
      if (deadClasses.size === 0) {
        return;
      }
      for (const chunk of Object.values(bundle)) {
        if (isRollupCssAsset(chunk)) {
          chunk.source = pruneDeadResponsiveClasses(chunk.source, deadClasses);
        }
      }
    };

    return {
      name: 'cumulo-unplugin',
      enforce: 'pre',

      async buildStart() {
        emittedResponsiveRules.clear();
        if (themeOptions) {
          const result = await syncThemeContract(themeOptions);
          if (typeof this.addWatchFile === 'function') {
            this.addWatchFile(result.cssPath);
          }
          activeBreakpoints = options?.breakpoints ?? result.breakpoints;
        } else {
          activeBreakpoints = options?.breakpoints;
        }

        usageTracker = createResponsiveUsageTracker(
          Object.keys(activeBreakpoints ?? DEFAULT_BREAKPOINTS),
        );
      },

      async watchChange(id: string) {
        if (!themeOptions) {
          return;
        }
        if (path.resolve(id) === path.resolve(themeOptions.css)) {
          const result = await syncThemeContract(themeOptions);
          activeBreakpoints = options?.breakpoints ?? result.breakpoints;
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
        if (pruneResponsive && !isDevServer && isScannableUserSource(id)) {
          usageTracker.scanSource(code, normalizeId(id));
        }

        if (!shouldProcessFile(code, id, options)) {
          return null;
        }

        const result = await extractAndRewrite(code, id, activeBreakpoints);
        recordResponsiveRules(result.responsiveRules);

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

      vite: {
        configureServer() {
          isDevServer = true;
        },
        generateBundle: {
          order: 'post',
          handler: pruneRollupBundle,
        },
      },

      rollup: {
        generateBundle: {
          order: 'post',
          handler: pruneRollupBundle,
        },
      },

      webpack(compiler) {
        const stage = compiler.webpack?.Compilation?.PROCESS_ASSETS_STAGE_OPTIMIZE_SIZE;
        if (stage === undefined) {
          return;
        }
        compiler.hooks.thisCompilation.tap('cumulo-unplugin-prune', (compilation) => {
          compilation.hooks.processAssets.tap(
            {
              name: 'cumulo-unplugin-prune',
              stage,
            },
            (assets) => {
              const deadClasses = computeDeadResponsiveClasses();
              if (deadClasses.size === 0) {
                return;
              }
              const RawSource = compiler.webpack?.sources?.RawSource;
              if (!RawSource) {
                return;
              }
              for (const [assetName, asset] of Object.entries(assets)) {
                if (!assetName.endsWith('.css')) continue;
                const raw = asset.source();
                const text = typeof raw === 'string' ? raw : raw.toString('utf-8');
                const pruned = pruneDeadResponsiveClasses(text, deadClasses);
                if (pruned !== text) {
                  compilation.updateAsset(assetName, new RawSource(pruned));
                }
              }
            },
          );
        });
      },
    };
  },
);

export const cumulo = unplugin;

export default unplugin;
