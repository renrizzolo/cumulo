import fs from 'node:fs';
import path from 'node:path';

import {
  DEFAULT_BREAKPOINTS,
  LAYER_ORDER_STATEMENT,
  formatResponsiveCss,
  type BreakpointMap,
  type ResponsiveRuleEntry,
} from '@cumulo/css';

import { extractCss, shouldProcessFile } from './core/extractor.js';
import { createResponsiveUsageTracker } from './core/responsivePruner.js';
import { syncThemeContract } from './core/themeSync.js';
import type { CumuloPluginOptions } from './types.js';

export interface CumuloPostcssOptions extends CumuloPluginOptions {
  include?: string[];
  exclude?: string[];
}

export interface PostcssResult {
  opts?: {
    from?: string;
  };
  messages: unknown[];
}

export interface PostcssNode {
  type: string;
  name?: string;
  params?: string;
  remove(): void;
  [key: string]: unknown;
}

export interface PostcssRoot {
  append(nodes: string): void;
  walk(callback: (node: PostcssNode) => void): void;
}

export interface PostcssPlugin {
  postcssPlugin: string;
  Once(root: PostcssRoot, helpers: { result: PostcssResult }): Promise<void>;
}

function cumuloPostcss(options: CumuloPostcssOptions = {}): PostcssPlugin {
  return {
    postcssPlugin: 'cumulo-postcss',
    async Once(root: PostcssRoot, helpers: { result: PostcssResult }): Promise<void> {
      const cwd = process.cwd();
      let activeBreakpoints: BreakpointMap | undefined = options.breakpoints;

      if (options.theme) {
        const synced = await syncThemeContract(options.theme, cwd);
        if (!activeBreakpoints) {
          activeBreakpoints = synced.breakpoints;
        }
        helpers.result.messages.push({
          type: 'dependency',
          plugin: 'cumulo-postcss',
          file: synced.cssPath,
          parent: helpers.result.opts?.from,
        });
      }

      const patterns = options.include ?? [
        'src/**/*.{tsx,jsx,ts,js}',
        'app/**/*.{tsx,jsx,ts,js}',
        'pages/**/*.{tsx,jsx,ts,js}',
        'components/**/*.{tsx,jsx,ts,js}',
      ];

      const excludePatterns = options.exclude ?? ['node_modules', '.next', 'dist', '.git'];

      const shouldExclude = (filePath: string): boolean => {
        const normalized = filePath.replace(/\\/g, '/');
        return excludePatterns.some((p) => normalized.includes(p));
      };

      const matchedFiles: string[] = [];

      for (const pattern of patterns) {
        const files = fs.globSync(pattern, {
          cwd,
          exclude: shouldExclude,
        });
        for (const file of files) {
          matchedFiles.push(path.isAbsolute(file) ? file : path.resolve(cwd, file));
        }
      }

      const uniqueFiles = Array.from(new Set(matchedFiles));
      const pruneResponsive = options.pruneResponsive !== false;
      const usageTracker = createResponsiveUsageTracker(
        Object.keys(activeBreakpoints ?? DEFAULT_BREAKPOINTS),
      );

      const filesToProcess: string[] = [];
      const cumuloCoreImportRe = /['"]@cumulo\/core(?:\/[^'"]*)?['"]/;

      for (const file of uniqueFiles) {
        let code = '';
        try {
          code = fs.readFileSync(file, 'utf-8');
        } catch {
          continue;
        }

        const isExcluded = shouldExclude(file);
        if (pruneResponsive && !isExcluded && /\.(tsx?|jsx?|mjs|cjs)$/.test(file)) {
          usageTracker.scanSource(code, file);
        }

        const importsCoreComponent =
          !isExcluded && /\.(tsx?|jsx?|mjs|cjs)$/.test(file) && cumuloCoreImportRe.test(code);

        if (!shouldProcessFile(code, file, options) && !importsCoreComponent) {
          continue;
        }

        helpers.result.messages.push({
          type: 'dependency',
          plugin: 'cumulo-postcss',
          file,
          parent: helpers.result.opts?.from,
        });

        filesToProcess.push(file);
      }

      const extractedResults = await Promise.all(
        filesToProcess.map((file) =>
          extractCss({
            filePath: file,
            rewrite: false,
            breakpoints: activeBreakpoints,
          }),
        ),
      );

      const extractedBaseRules = new Set<string>();
      const responsiveRuleMap = new Map<string, ResponsiveRuleEntry>();
      const conditionOrder: string[] = [];
      const conditionOrderSet = new Set<string>();

      for (const key of Object.keys(activeBreakpoints ?? DEFAULT_BREAKPOINTS)) {
        if (!conditionOrderSet.has(key)) {
          conditionOrderSet.add(key);
          conditionOrder.push(key);
        }
      }

      for (const extracted of extractedResults) {
        const baseCss = extracted.baseCss ?? extracted.css;
        if (baseCss) {
          for (const rule of baseCss.split('\n')) {
            const trimmed = rule.trim();
            if (trimmed && trimmed !== LAYER_ORDER_STATEMENT) {
              extractedBaseRules.add(trimmed);
            }
          }
        }

        if (extracted.conditionOrder) {
          for (const key of extracted.conditionOrder) {
            if (!conditionOrderSet.has(key)) {
              conditionOrderSet.add(key);
              conditionOrder.push(key);
            }
          }
        }

        if (extracted.responsiveRules) {
          for (const entry of extracted.responsiveRules) {
            const existing = responsiveRuleMap.get(entry.className);
            if (!existing) {
              responsiveRuleMap.set(entry.className, {
                ...entry,
                usages: [...entry.usages],
              });
            } else {
              const mergedUsages = [...existing.usages];
              for (const u of entry.usages) {
                if (
                  !mergedUsages.some(
                    (prev) =>
                      prev.variantName === u.variantName && prev.optionName === u.optionName,
                  )
                ) {
                  mergedUsages.push(u);
                }
              }
              responsiveRuleMap.set(entry.className, {
                ...existing,
                usages: mergedUsages,
              });
            }
          }
        }
      }

      const keptResponsiveEntries = Array.from(responsiveRuleMap.values()).filter(
        (entry) => !pruneResponsive || usageTracker.isRuleUsed(entry, options.responsiveSafelist),
      );

      const responsiveCss = formatResponsiveCss(keptResponsiveEntries, conditionOrder);
      const baseCssJoined = Array.from(extractedBaseRules).join('\n');

      const combinedParts: string[] = [];
      if (baseCssJoined) {
        combinedParts.push(baseCssJoined);
      }
      if (responsiveCss) {
        combinedParts.push(responsiveCss);
      }

      if (combinedParts.length === 0) {
        return;
      }

      let combinedCss = combinedParts.join('\n');
      if (combinedCss.includes('@layer ') && !combinedCss.startsWith(LAYER_ORDER_STATEMENT)) {
        combinedCss = `${LAYER_ORDER_STATEMENT}\n${combinedCss}`;
      }

      root.walk((node: PostcssNode): void => {
        if (node.type === 'atrule') {
          const name = typeof node.name === 'string' ? node.name : '';
          const params = typeof node.params === 'string' ? node.params : '';
          if (name === 'cumulo' || (name === 'import' && params.includes('@cumulo'))) {
            node.remove();
          }
        }
      });

      root.append(combinedCss);
    },
  };
}

cumuloPostcss.postcss = true;
cumuloPostcss.cumulo = cumuloPostcss;

export default cumuloPostcss;
