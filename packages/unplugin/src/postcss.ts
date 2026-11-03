import fs from 'node:fs';
import path from 'node:path';
import { extractCssFromFile, shouldProcessFile } from './core/extractor.js';
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
        try {
          const files = fs.globSync(pattern, {
            cwd,
            exclude: shouldExclude,
          });
          for (const file of files) {
            matchedFiles.push(path.isAbsolute(file) ? file : path.resolve(cwd, file));
          }
        } catch {
          // Fallback if pattern fails
        }
      }

      const uniqueFiles = Array.from(new Set(matchedFiles));
      const extractedRules = new Set<string>();

      const filesToProcess: string[] = [];

      for (const file of uniqueFiles) {
        let code = '';
        try {
          code = fs.readFileSync(file, 'utf-8');
        } catch {
          continue;
        }

        if (!shouldProcessFile(code, file, options)) {
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
        filesToProcess.map((file) => extractCssFromFile(file)),
      );

      for (const css of extractedResults) {
        if (css) {
          const rules = css.split('\n');
          for (const rule of rules) {
            const trimmed = rule.trim();
            if (trimmed) {
              extractedRules.add(trimmed);
            }
          }
        }
      }

      if (extractedRules.size === 0) {
        return;
      }

      const combinedCss = Array.from(extractedRules).join('\n');

      root.walk((node: PostcssNode): void => {
        if (node.type === 'atrule') {
          const name = typeof node.name === 'string' ? node.name : '';
          const params = typeof node.params === 'string' ? node.params : '';
          if (
            name === 'cumulo' ||
            (name === 'import' && (params.includes('@cumulo/css') || params.includes('@cumulo')))
          ) {
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
