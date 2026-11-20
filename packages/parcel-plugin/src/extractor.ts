import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createJiti, type Jiti } from 'jiti';
import { createRewritePlan, type RecordedCall } from './rewriter.js';

export interface ExtractCssRequest {
  filePath: string;
  code?: string;
  projectRoot?: string;
}

export interface ExtractCssResult {
  css: string;
  code?: string;
  dependencies: string[];
  warning?: string;
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

function resolveCumuloCssPath(projectRoot?: string): string | undefined {
  if (projectRoot) {
    try {
      const projectRequire = createRequire(path.join(projectRoot, 'package.json'));
      return projectRequire.resolve('@cumulo/css');
    } catch {
      // Fall back to resolving relative to this plugin package
    }
  }

  try {
    return fileURLToPath(import.meta.resolve('@cumulo/css'));
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
    : import.meta.url;

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

        // Guard CSS rule recording while executing transitively imported modules so each
        // file's extracted stylesheet only contains rules authored by that file itself.
        // Imported modules are transformed independently by Parcel, preserving CSS order
        // and preventing cross-bundle duplication.
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

/**
 * Evaluates a module (from provided source code or from disk) and extracts all CSS
 * generated by `@cumulo/css` in that module, along with local file dependencies touched
 * during evaluation.
 */
export async function extractCss(request: ExtractCssRequest): Promise<ExtractCssResult> {
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
  globalThis.__cumuloExtractorDepDepth = 0;

  if (typeof originalInsertRule === 'function') {
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

  const rewritePlan = sourceText ? createRewritePlan(sourceText, absolutePath) : null;

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
        const css = sheet.getCss();
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
        const css = sheet.getCss();
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
    if (typeof originalInsertRule === 'function') {
      sheet.insertRule = originalInsertRule;
    }
    globalThis.__cumuloExtractorDepDepth = 0;
    globalThis.__cumuloRecord = undefined;
  }
}
