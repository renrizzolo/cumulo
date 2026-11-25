import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createJiti, type Jiti } from 'jiti';

import type { CumuloPluginOptions } from '../types.js';
import { createRewritePlan, type RecordedCall } from './rewriter.js';

export interface ExtractCssRequest {
  filePath: string;
  code?: string;
  projectRoot?: string;
  /**
   * When `true`, CSS rules generated while evaluating transitively imported modules are
   * suppressed so the extracted stylesheet only contains rules authored by `filePath` itself.
   * Useful for bundlers (like Parcel v3) that transform each imported module independently.
   */
  isolateDependencies?: boolean;
  /**
   * When `false`, skips compile-time JS rewriting and only extracts static CSS.
   * Defaults to `true`.
   */
  rewrite?: boolean;
}

export interface ExtractCssResult {
  css: string;
  code?: string;
  dependencies: string[];
  warning?: string;
}

export interface ExtractAndRewriteResult {
  css: string;
  code?: string;
}

declare global {
  var __cumuloExtractorDepDepth: number | undefined;
  var __cumuloRecord: ((id: number, value: unknown) => unknown) | undefined;
}

interface CumuloSheet {
  clear: () => void;
  getCss: () => string;
  insertRule?: (rule: string) => void;
}

interface CumuloCssModule {
  sheet: CumuloSheet;
}

function isCumuloCssModule(value: unknown): value is CumuloCssModule {
  if (typeof value !== 'object' || value === null || !('sheet' in value)) {
    return false;
  }
  const sheet = value.sheet;
  return (
    typeof sheet === 'object' &&
    sheet !== null &&
    'clear' in sheet &&
    typeof sheet.clear === 'function' &&
    'getCss' in sheet &&
    typeof sheet.getCss === 'function'
  );
}

const STYLESHEET_EXT_RE = /\.(css|scss|sass|less|styl)($|\?)/i;
const STATIC_ASSET_EXT_RE =
  /\.(svg|png|jpe?g|gif|webp|avif|ico|woff2?|ttf|eot|otf|mp4|webm|ogg|mp3|wav|pdf|mdx?)($|\?)/i;

function isStylesheet(file?: string, source?: string): boolean {
  if (file && STYLESHEET_EXT_RE.test(file)) {
    return true;
  }
  if (source) {
    const trimmed = source.trim();
    if (
      trimmed.startsWith('@import') ||
      trimmed.startsWith('@layer') ||
      trimmed.startsWith('@charset')
    ) {
      return true;
    }
  }
  return false;
}

function isStaticAsset(file?: string): boolean {
  return Boolean(file && STATIC_ASSET_EXT_RE.test(file));
}

/**
 * Strips stylesheet and static asset import statements before evaluating with Jiti.
 */
function stripIgnoredImports(source: string): string {
  return source
    .replace(/import\s+['"][^'"]+\.(css|scss|sass|less|styl)['"];?/gi, '')
    .replace(/import\s+[^;]+from\s+['"][^'"]+\.(css|scss|sass|less|styl)['"];?/gi, '')
    .replace(
      /import\s+([A-Za-z_$][\w$]*)\s+from\s+['"](?:raw-text|bundle-text|data-url|url):[^'"]+['"];?/gi,
      'const $1 = "";',
    )
    .replace(/import\s+['"](?:raw-text|bundle-text|data-url|url):[^'"]+['"];?/gi, '');
}

/**
 * Normalizes relative .js imports in TypeScript source files (e.g. from './Surface.js' -> from './Surface')
 * allowing Jiti to resolve TypeScript extensions like .tsx, which Jiti's default .js resolver omits.
 */
function normalizeRelativeImports(source: string): string {
  return source
    .replace(/(from\s+['"])(\.[^'"]*?)\.js(['"])/g, '$1$2$3')
    .replace(/(import\s*\(\s*['"])(\.[^'"]*?)\.js(['"]\s*\))/g, '$1$2$3')
    .replace(/(import\s+['"])(\.[^'"]*?)\.js(['"])/g, '$1$2$3')
    .replace(/(require\s*\(\s*['"])(\.[^'"]*?)\.js(['"]\s*\))/g, '$1$2$3');
}

export function cleanSourceCode(source: string): string {
  return normalizeRelativeImports(stripIgnoredImports(source));
}

const LAYER_ORDER_HEADER = '@layer reset,base,components,utilities;';

function ensureLayerOrder(css: string): string {
  if (!css || !css.includes('@layer ') || css.startsWith(LAYER_ORDER_HEADER)) {
    return css;
  }
  return `${LAYER_ORDER_HEADER}\n${css}`;
}

function resolveCumuloCssPath(projectRoot?: string): string | undefined {
  if (projectRoot) {
    try {
      const projectRequire = createRequire(path.join(projectRoot, 'package.json'));
      return projectRequire.resolve('@cumulo/css');
    } catch {
      // Fall back to resolving relative to this package or cwd
    }
  }

  try {
    if (typeof import.meta?.resolve === 'function') {
      return fileURLToPath(import.meta.resolve('@cumulo/css'));
    }
  } catch {
    // Fall back to createRequire
  }

  try {
    const cwdRequire = createRequire(path.join(process.cwd(), 'package.json'));
    return cwdRequire.resolve('@cumulo/css');
  } catch {
    return undefined;
  }
}

function isNodeModulesPath(filePath: string): boolean {
  return filePath.includes('/node_modules/') || filePath.includes('\\node_modules\\');
}

function safeRealpath(filePath: string): string {
  try {
    return fs.realpathSync(filePath);
  } catch {
    return path.resolve(filePath);
  }
}

interface JitiContext {
  jiti: Jiti;
  dependencies: Set<string>;
  currentTarget: string;
  currentTargetRealpath: string;
}

const jitiCache = new Map<string, JitiContext>();

function isTargetModule(filename: string | undefined, ctx: JitiContext): boolean {
  if (!filename) {
    return false;
  }
  const resolved = path.resolve(filename);
  if (resolved === ctx.currentTarget) {
    return true;
  }
  if (ctx.currentTargetRealpath && safeRealpath(resolved) === ctx.currentTargetRealpath) {
    return true;
  }
  return false;
}

function getJitiContext(projectRoot?: string): JitiContext {
  const cacheKey = projectRoot ? path.resolve(projectRoot) : '__default__';
  const existing = jitiCache.get(cacheKey);
  if (existing) {
    return existing;
  }

  const cumuloCssPath = resolveCumuloCssPath(projectRoot);
  const alias = cumuloCssPath ? { '@cumulo/css': cumuloCssPath } : undefined;
  const baseUrl = projectRoot
    ? path.join(path.resolve(projectRoot), 'package.json')
    : import.meta?.url || path.join(process.cwd(), 'package.json');

  const baseJiti = createJiti(baseUrl, {
    interopDefault: true,
    moduleCache: false,
    fsCache: false,
    jsx: true,
    alias,
  });

  const ctx: JitiContext = {
    dependencies: new Set<string>(),
    currentTarget: '',
    currentTargetRealpath: '',
    jiti: createJiti(baseUrl, {
      interopDefault: true,
      moduleCache: false,
      fsCache: false,
      jsx: true,
      alias,
      transform(opts) {
        const filename = opts.filename;
        const isTarget = isTargetModule(filename, ctx);

        if (
          filename &&
          path.isAbsolute(filename) &&
          !isTarget &&
          !isNodeModulesPath(filename) &&
          fs.existsSync(filename)
        ) {
          ctx.dependencies.add(filename);
        }

        if (isStylesheet(filename, opts.source)) {
          return { code: 'module.exports = {};' };
        }
        if (isStaticAsset(filename)) {
          return { code: 'module.exports = "";' };
        }

        const cleanSource = opts.source ? cleanSourceCode(opts.source) : opts.source;
        const code = baseJiti.transform({ ...opts, source: cleanSource });

        // Track transitive dependency evaluation depth so rewrites (and optionally CSS
        // extraction when `isolateDependencies` is true) only record rules authored by the
        // target module itself.
        if (!isTarget) {
          return {
            code: `globalThis.__cumuloExtractorDepDepth = (globalThis.__cumuloExtractorDepDepth ?? 0) + 1;\ntry {\n${code}\n} finally {\nglobalThis.__cumuloExtractorDepDepth = (globalThis.__cumuloExtractorDepDepth ?? 1) - 1;\n}`,
          };
        }

        return { code };
      },
    }),
  };

  jitiCache.set(cacheKey, ctx);
  return ctx;
}

function formatError(err: unknown): string {
  return err instanceof Error ? (err.stack ?? err.message) : String(err);
}

function matchesPattern(id: string, patterns?: (string | RegExp)[]): boolean {
  if (!patterns || patterns.length === 0) return false;
  return patterns.some((pattern) =>
    typeof pattern === 'string' ? id.includes(pattern) : pattern.test(id),
  );
}

function logExtractionWarning(filePath: string, warning: string): void {
  const isDev = process.env.NODE_ENV !== 'production';
  if (isDev || process.env.DEBUG_CUMULO) {
    console.warn(
      `\n⚠️  [@cumulo/unplugin] ${warning}\n` +
        `Styles defined in "${filePath}" might not be extracted.\n`,
    );
  }
}

const CUMULO_CSS_SPECIFIER_RE = /['"]@cumulo\/css['"]/;
const CUMULO_CONTRACT_SPECIFIER_RE = /['"]@cumulo\/core\/contract['"]/;
const CUMULO_CORE_SPECIFIER_RE = /['"]@cumulo\/core['"]/;
const NAMED_VARS_IMPORT_RE = /\bimport\s*\{[^}]*\bvars\b[^}]*\}\s*from\s*['"]/;
const SKIPPED_CUMULO_PACKAGES = [
  'node_modules/@cumulo/css/',
  'node_modules/@cumulo/parcel-plugin/',
  'node_modules/@cumulo/parcel-transformer/',
  'node_modules/@cumulo/unplugin/',
];

/**
 * Checks if source code imports from `@cumulo/css` (excluding `@cumulo/css/runtime`),
 * imports from `@cumulo/core/contract`, imports a named `vars` binding (e.g. a generated
 * `--out` theme contract or aliased `vars`), or accesses `vars` imported from `@cumulo/core`.
 */
export function shouldProcessFile(
  code: string,
  id: string,
  options?: CumuloPluginOptions,
): boolean {
  if (!id || !code) {
    return false;
  }
  const normalizedId = id.replace(/\\/g, '/');
  if (options?.exclude && matchesPattern(normalizedId, options.exclude)) {
    return false;
  }
  if (options?.include && matchesPattern(normalizedId, options.include)) {
    return true;
  }
  // don't process virtual modules
  if (normalizedId.startsWith('\0') || normalizedId.includes('\x00')) {
    return false;
  }
  // don't process node_modules except @cumulo (excluding Cumulo's own css/plugin packages)
  if (normalizedId.includes('node_modules')) {
    if (!normalizedId.includes('@cumulo')) {
      return false;
    }
    if (SKIPPED_CUMULO_PACKAGES.some((pkg) => normalizedId.includes(pkg))) {
      return false;
    }
  }
  // don't process virtual cumulo files
  if (normalizedId.endsWith('.cumulo.css') || normalizedId.includes('virtual:cumulo')) {
    return false;
  }
  // only process jsx/tsx/mjs/cjs files
  if (!/\.(tsx?|jsx?|mjs|cjs)$/.test(normalizedId)) {
    return false;
  }

  if (CUMULO_CSS_SPECIFIER_RE.test(code) || CUMULO_CONTRACT_SPECIFIER_RE.test(code)) {
    return true;
  }

  if (CUMULO_CORE_SPECIFIER_RE.test(code) && (code.includes('vars.') || code.includes('vars['))) {
    return true;
  }

  return NAMED_VARS_IMPORT_RE.test(code);
}

let extractionQueue: Promise<void> = Promise.resolve();

/**
 * Evaluates a module (from provided source code or from disk) to extract static CSS,
 * optionally rewrites top-level `@cumulo/css` calls into lightweight `@cumulo/css/runtime`
 * lookups, and returns local file dependencies touched during evaluation.
 *
 * Calls are serialized through an internal queue so concurrent bundler or PostCSS
 * transforms never race on the shared in-memory `@cumulo/css` sheet or recorder state.
 */
export function extractCss(request: ExtractCssRequest): Promise<ExtractCssResult> {
  const result = extractionQueue.then(() => extractCssInternal(request));
  extractionQueue = result.then(
    () => undefined,
    () => undefined,
  );
  return result;
}

async function extractCssInternal(request: ExtractCssRequest): Promise<ExtractCssResult> {
  const absolutePath = path.isAbsolute(request.filePath)
    ? path.resolve(request.filePath)
    : path.resolve(request.projectRoot ?? process.cwd(), request.filePath);

  const ctx = getJitiContext(request.projectRoot);
  ctx.dependencies.clear();
  ctx.currentTarget = absolutePath;
  ctx.currentTargetRealpath = safeRealpath(absolutePath);

  let cumuloCss: CumuloCssModule;
  try {
    const loaded: unknown = await ctx.jiti.import('@cumulo/css');
    if (!isCumuloCssModule(loaded)) {
      return {
        css: '',
        dependencies: [],
        warning: `Loaded @cumulo/css from "${absolutePath}" without a valid sheet export.`,
      };
    }
    cumuloCss = loaded;
  } catch (err: unknown) {
    return {
      css: '',
      dependencies: [],
      warning: `Failed to load @cumulo/css while processing "${absolutePath}": ${formatError(err)}`,
    };
  }

  const sheet = cumuloCss.sheet;
  const originalInsertRule = sheet.insertRule;
  const isolateDependencies = request.isolateDependencies === true;
  const shouldRewrite = request.rewrite !== false;

  globalThis.__cumuloExtractorDepDepth = 0;

  if (isolateDependencies && typeof originalInsertRule === 'function') {
    sheet.insertRule = (rule: string): void => {
      if ((globalThis.__cumuloExtractorDepDepth ?? 0) === 0) {
        originalInsertRule.call(sheet, rule);
      }
    };
  }

  let evalError: unknown;
  const sourceText =
    typeof request.code === 'string'
      ? request.code
      : fs.existsSync(absolutePath)
        ? fs.readFileSync(absolutePath, 'utf-8')
        : undefined;

  const rewritePlan =
    shouldRewrite && sourceText ? createRewritePlan(sourceText, absolutePath) : null;

  try {
    if (sourceText !== undefined) {
      const recorded = new Map<number, RecordedCall>();
      if (rewritePlan) {
        globalThis.__cumuloRecord = (id: number, value: unknown): unknown => {
          if ((globalThis.__cumuloExtractorDepDepth ?? 0) === 0) {
            const prev = recorded.get(id);
            recorded.set(id, { count: (prev?.count ?? 0) + 1, value });
          }
          return value;
        };
      }

      const codeToEval = cleanSourceCode(rewritePlan ? rewritePlan.instrumentedSource : sourceText);
      try {
        sheet.clear();
        globalThis.__cumuloExtractorDepDepth = 0;
        await ctx.jiti.evalModule(codeToEval, {
          filename: absolutePath,
        });
        const css = ensureLayerOrder(sheet.getCss());
        const rewrittenCode = rewritePlan ? rewritePlan.applyRewrites(recorded) : null;
        if (css || rewrittenCode) {
          return {
            css,
            ...(rewrittenCode ? { code: rewrittenCode } : {}),
            dependencies: Array.from(ctx.dependencies),
          };
        }
      } catch (err: unknown) {
        evalError = err;
      } finally {
        globalThis.__cumuloRecord = undefined;
      }
    }

    // Fallback to evaluating the file directly on disk (handles cases where instrumented
    // evalModule failed or when code was not passed).
    if (evalError !== undefined || sourceText === undefined) {
      try {
        ctx.dependencies.clear();
        sheet.clear();
        globalThis.__cumuloExtractorDepDepth = 0;
        await ctx.jiti.import(absolutePath);
        const css = ensureLayerOrder(sheet.getCss());
        return {
          css,
          dependencies: Array.from(ctx.dependencies),
        };
      } catch (fileErr: unknown) {
        return {
          css: '',
          dependencies: Array.from(ctx.dependencies),
          warning: `Failed to evaluate "${absolutePath}": ${formatError(fileErr)}`,
        };
      }
    }

    return {
      css: '',
      dependencies: Array.from(ctx.dependencies),
    };
  } finally {
    if (isolateDependencies && typeof originalInsertRule === 'function') {
      sheet.insertRule = originalInsertRule;
    }
    globalThis.__cumuloExtractorDepDepth = 0;
    globalThis.__cumuloRecord = undefined;
  }
}

/**
 * Evaluates a file and extracts all CSS rules generated by `@cumulo/css`.
 */
export async function extractCssFromFile(filePath: string): Promise<string> {
  const result = await extractCss({ filePath, rewrite: false });
  if (result.warning) {
    logExtractionWarning(filePath, result.warning);
  }
  return result.css;
}

/**
 * Evaluates an in-memory code string and extracts all CSS rules generated.
 */
export async function extractCssFromCode(code: string, id: string): Promise<string> {
  const result = await extractCss({ filePath: id, code, rewrite: false });
  if (result.warning) {
    logExtractionWarning(id, result.warning);
  }
  return result.css;
}

/**
 * Evaluates a module to extract static CSS and rewrites top-level `@cumulo/css`
 * style/recipe/theme calls into lightweight `@cumulo/css/runtime` lookups so
 * build-time tokens (`vars`), style definitions, and the CSS compiler are
 * stripped from client bundles.
 */
export async function extractAndRewrite(
  code: string,
  id: string,
): Promise<ExtractAndRewriteResult> {
  const result = await extractCss({ filePath: id, code, rewrite: true });
  if (result.warning) {
    logExtractionWarning(id, result.warning);
  }
  return {
    css: result.css,
    ...(result.code ? { code: result.code } : {}),
  };
}
