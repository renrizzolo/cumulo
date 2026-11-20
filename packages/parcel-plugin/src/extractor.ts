import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createJiti, type Jiti } from 'jiti';

export interface ExtractCssRequest {
  filePath: string;
  code?: string;
  projectRoot?: string;
}

export interface ExtractCssResult {
  css: string;
  dependencies: string[];
  warning?: string;
}

interface CumuloSheet {
  clear: () => void;
  getCss: () => string;
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

interface JitiContext {
  jiti: Jiti;
  dependencies: Set<string>;
  currentTarget: string;
}

const jitiCache = new Map<string, JitiContext>();

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
    jiti: createJiti(baseUrl, {
      interopDefault: true,
      moduleCache: false,
      fsCache: false,
      jsx: true,
      alias,
      transform(opts) {
        const filename = opts.filename;
        if (
          filename &&
          path.isAbsolute(filename) &&
          filename !== ctx.currentTarget &&
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
 * generated by `@cumulo/css`, along with local file dependencies touched during evaluation.
 */
export async function extractCss(request: ExtractCssRequest): Promise<ExtractCssResult> {
  const absolutePath = path.isAbsolute(request.filePath)
    ? request.filePath
    : path.resolve(request.projectRoot ?? process.cwd(), request.filePath);

  const ctx = getJitiContext(request.projectRoot);
  ctx.dependencies.clear();
  ctx.currentTarget = absolutePath;

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

  let evalError: unknown;

  if (typeof request.code === 'string') {
    const cleanCode = cleanSourceCode(request.code);
    try {
      cumuloCss.sheet.clear();
      await ctx.jiti.evalModule(cleanCode, {
        filename: absolutePath,
      });
      const css = cumuloCss.sheet.getCss();
      if (css) {
        return {
          css,
          dependencies: Array.from(ctx.dependencies),
        };
      }
    } catch (err: unknown) {
      evalError = err;
    }
  }

  // Fallback to evaluating the file directly on disk (handles cases where evalModule failed
  // or when code was not passed).
  if (evalError !== undefined || typeof request.code !== 'string') {
    try {
      ctx.dependencies.clear();
      cumuloCss.sheet.clear();
      await ctx.jiti.import(absolutePath);
      const css = cumuloCss.sheet.getCss();
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
}
