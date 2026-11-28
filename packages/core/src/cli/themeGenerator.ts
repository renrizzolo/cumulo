import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { normalizeBreakpointQuery, type BreakpointQuery } from '@cumulo/css';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type NestedTree = { [key: string]: string | NestedTree };

export interface GenerateThemeOptions {
  /**
   * Path to the base CSS file (defaults to @cumulo/core/src/theme.css or @cumulo/core/theme.css)
   */
  baseCssPath?: string;
  /**
   * Path to a custom consumer CSS file with theme overrides
   */
  customCssPath?: string;
  /**
   * Custom CSS content directly (useful for tests or programmatic usage)
   */
  customCssContent?: string;
  /**
   * Output file path for a standalone contract/tokens file
   */
  outPath?: string;
  /**
   * Include custom CSS variables not defined in Cumulo's default `theme.css`
   * in the generated `vars` contract.
   * Defaults to `false`.
   */
  includeCustomVars?: boolean;
  /**
   * Silent mode (suppress logs)
   */
  silent?: boolean;
}

export interface GeneratedThemeResult {
  contractCode: string;
  standaloneCode: string;
  canonicalVars: string[];
  overriddenVars: string[];
  customVars: string[];
  ignoredVars: string[];
  varValues: Map<string, string>;
  breakpoints: Record<string, BreakpointQuery>;
}

function kebabToCamel(str: string): string {
  return str.replace(/-([a-z0-9])/g, (_, g) => g.toUpperCase());
}

function setNestedPath(obj: NestedTree, pathSegments: string[], value: string) {
  let current: NestedTree = obj;
  for (let i = 0; i < pathSegments.length - 1; i++) {
    const key = kebabToCamel(pathSegments[i]);
    const existing = current[key];
    if (typeof existing === 'string') {
      const next: NestedTree = { DEFAULT: existing };
      current[key] = next;
      current = next;
    } else if (typeof existing === 'object' && existing !== null) {
      current = existing;
    } else {
      const next: NestedTree = {};
      current[key] = next;
      current = next;
    }
  }
  const lastKey = kebabToCamel(pathSegments[pathSegments.length - 1]);
  const lastExisting = current[lastKey];
  if (typeof lastExisting === 'object' && lastExisting !== null) {
    lastExisting.DEFAULT = value;
  } else {
    current[lastKey] = value;
  }
}

function stripOuterQuotes(raw: string): string {
  const trimmed = raw.trim();
  if (
    trimmed.length >= 2 &&
    ((trimmed.startsWith("'") && trimmed.endsWith("'")) ||
      (trimmed.startsWith('"') && trimmed.endsWith('"')))
  ) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

function resolveVarValue(
  rawValue: string,
  varValues: ReadonlyMap<string, string>,
  maxDepth = 4,
): string {
  let current = stripOuterQuotes(rawValue);
  for (let i = 0; i < maxDepth; i++) {
    const varRef = current.match(/^var\(\s*(--[a-zA-Z0-9_-]+)(?:\s*,\s*([^)]+))?\s*\)$/);
    if (!varRef) {
      break;
    }
    const referenced = varValues.get(varRef[1]);
    if (referenced) {
      current = stripOuterQuotes(referenced);
    } else if (varRef[2]) {
      current = stripOuterQuotes(varRef[2]);
    } else {
      break;
    }
  }
  return current;
}

function isBreakpointVarName(name: string): boolean {
  return name.startsWith('--theme-breakpoint-') || name.startsWith('--breakpoint-');
}

/**
 * Dynamically converts a flat list of CSS variables into a nested JavaScript object tree,
 * preserving source declaration order.
 *
 * Breakpoint variables (`--theme-breakpoint-*` / `--breakpoint-*`) store their resolved
 * concrete length or query string directly (e.g. `'768px'`, `'@container card (min-width: 500px)'`)
 * because CSS custom properties cannot be used inside `@media` / `@container` preludes.
 */
function buildTreeFromVars(vars: string[], varValues: ReadonlyMap<string, string>): NestedTree {
  const tree: NestedTree = {};

  for (const v of vars) {
    const raw = v.replace(/^--/, '');
    let parts = raw.split('-').filter(Boolean);

    // Normalize group prefix
    if (parts[0] === 'theme') {
      parts = parts.slice(1);
    } else if (parts[0] === 'color' && parts.length === 3 && parts[2] === 'base') {
      parts = ['seed', parts[1]];
    }

    if (parts.length === 0) continue;

    if (isBreakpointVarName(v)) {
      const rawValue = varValues.get(v);
      if (rawValue !== undefined) {
        setNestedPath(tree, parts, resolveVarValue(rawValue, varValues));
        continue;
      }
    }

    setNestedPath(tree, parts, `var(${v})`);
  }

  return tree;
}

/**
 * Serializes an object tree to TypeScript code with JSDoc comments reflecting computed CSS values.
 * Traverses entries in exact insertion/source order without alphabetical sorting.
 */
function serializeObjectWithComments(
  obj: NestedTree,
  varValuesMap: Map<string, string>,
  indent = 2,
  parentKey?: string,
): string {
  const spaces = ' '.repeat(indent);
  const entries = Object.entries(obj);

  const lines: string[] = ['{'];

  for (const [key, val] of entries) {
    const formattedKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : JSON.stringify(key);

    if (typeof val === 'string') {
      const varNameMatch = val.match(/var\((--[a-zA-Z0-9_-]+)\)/);
      const varName = varNameMatch ? varNameMatch[1] : null;
      const computedValue = varName ? varValuesMap.get(varName) : null;

      if (computedValue) {
        lines.push(`${spaces}/** ${computedValue.replace(/\*\//g, '* /')} */`);
      } else if (parentKey === 'breakpoint') {
        const normalized = normalizeBreakpointQuery(val);
        lines.push(`${spaces}/** ${normalized.replace(/\*\//g, '* /')} */`);
      }
      lines.push(`${spaces}${formattedKey}: ${JSON.stringify(val)},`);
    } else if (typeof val === 'object' && val !== null) {
      lines.push(
        `${spaces}${formattedKey}: ${serializeObjectWithComments(val, varValuesMap, indent + 2, key)},`,
      );
    }
  }

  lines.push(`${' '.repeat(indent - 2)}}`);
  return lines.join('\n');
}

/**
 * Attempts to format TypeScript code using oxfmt if available, otherwise returns the clean raw code.
 */
async function tryFormatCode(filePath: string, code: string): Promise<string> {
  try {
    const oxfmt = await import('oxfmt');
    let oxfmtConfig: Record<string, unknown> | undefined;

    // Check for root .oxfmtrc.json if we are in repo
    const candidates = [
      path.resolve(process.cwd(), '.oxfmtrc.json'),
      path.resolve(__dirname, '../../../../.oxfmtrc.json'),
    ];
    for (const configPath of candidates) {
      if (fs.existsSync(configPath)) {
        try {
          const parsed: unknown = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
          if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
            oxfmtConfig = parsed as Record<string, unknown>;
            break;
          }
        } catch {
          // ignore parsing error
        }
      }
    }

    const formatted = await oxfmt.format(filePath, code, oxfmtConfig);
    return formatted.code;
  } catch {
    return code;
  }
}

/**
 * Resolves the canonical base theme.css file location.
 */
function resolveBaseCssPath(customBase?: string): string {
  if (customBase && fs.existsSync(customBase)) {
    return path.resolve(customBase);
  }

  const candidates = [
    // Source tree in monorepo
    path.resolve(__dirname, '../theme.css'),
    path.resolve(__dirname, '../../src/theme.css'),
    // Built dist
    path.resolve(__dirname, '../dist/theme.css'),
    path.resolve(__dirname, '../../dist/theme.css'),
    path.resolve(__dirname, '../../theme.css'),
    // Relative to working directory
    path.resolve(process.cwd(), 'node_modules/@cumulo/core/dist/theme.css'),
    path.resolve(process.cwd(), 'node_modules/@cumulo/core/src/theme.css'),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  throw new Error(
    'Could not resolve base Cumulo theme.css. Please specify --base-css=<path to theme.css>.',
  );
}

/**
 * Extracts ordered breakpoint queries from `--theme-breakpoint-*` (and custom `--breakpoint-*`)
 * CSS custom properties, resolving `var(...)` aliases and normalizing lengths into `@media (min-width: ...)`.
 */
export function extractBreakpointsFromVars(
  varValues: ReadonlyMap<string, string>,
  canonicalVars: readonly string[],
): Record<string, BreakpointQuery> {
  const result: Record<string, BreakpointQuery> = {};
  for (const name of canonicalVars) {
    let bpKey: string | undefined;
    if (name.startsWith('--theme-breakpoint-')) {
      bpKey = kebabToCamel(name.slice('--theme-breakpoint-'.length));
    } else if (name.startsWith('--breakpoint-')) {
      bpKey = kebabToCamel(name.slice('--breakpoint-'.length));
    }
    if (!bpKey) continue;

    const raw = varValues.get(name);
    if (!raw) continue;
    const resolved = resolveVarValue(raw, varValues);
    result[bpKey] = normalizeBreakpointQuery(resolved);
  }
  return result;
}

function serializeBreakpointsAugmentation(
  breakpoints: Readonly<Record<string, BreakpointQuery>>,
): string {
  const keys = Object.keys(breakpoints);
  if (keys.length === 0) return '';
  const entries = keys.map((key) => {
    const formattedKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : JSON.stringify(key);
    return `    ${formattedKey}: true;`;
  });
  return `declare module '@cumulo/css' {\n  interface CustomBreakpoints {\n${entries.join('\n')}\n  }\n}`;
}

/**
 * Core engine for generating theme contracts and token definitions.
 */
export async function generateTheme(
  options: GenerateThemeOptions = {},
): Promise<GeneratedThemeResult> {
  const baseCssPath = resolveBaseCssPath(options.baseCssPath);
  const rawBaseCss = fs.readFileSync(baseCssPath, 'utf-8');

  // 1. Extract canonical CSS custom properties in exact source order
  const cleanBaseCss = rawBaseCss.replace(/\/\*[\s\S]*?\*\//g, '');
  const varDeclRegex = /(--[a-zA-Z0-9_-]+)\s*:\s*([^;{}]+);/g;
  const canonicalVars: string[] = [];
  const varValues = new Map<string, string>();
  const seenVars = new Set<string>();

  let match;
  while ((match = varDeclRegex.exec(cleanBaseCss)) !== null) {
    const name = match[1];
    const value = match[2].trim().replace(/\s+/g, ' ');
    if (!seenVars.has(name)) {
      seenVars.add(name);
      canonicalVars.push(name);
      varValues.set(name, value);
    }
  }

  // 2. Process consumer custom CSS overrides if provided
  let customCss = options.customCssContent ?? '';
  if (!customCss && options.customCssPath) {
    const resolvedCustomPath = path.resolve(options.customCssPath);
    if (fs.existsSync(resolvedCustomPath)) {
      customCss = fs.readFileSync(resolvedCustomPath, 'utf-8');
    } else {
      throw new Error(`Custom CSS file not found at ${resolvedCustomPath}`);
    }
  }

  const baseVarNames = new Set(seenVars);
  const overriddenVars: string[] = [];
  const customVars: string[] = [];
  const ignoredVars: string[] = [];

  if (customCss) {
    const cleanCustomCss = customCss.replace(/\/\*[\s\S]*?\*\//g, '');
    const customDeclRegex = /(--[a-zA-Z0-9_-]+)\s*:\s*([^;{}]+);/g;
    let customMatch;

    while ((customMatch = customDeclRegex.exec(cleanCustomCss)) !== null) {
      const name = customMatch[1];
      const value = customMatch[2].trim().replace(/\s+/g, ' ');

      if (baseVarNames.has(name)) {
        varValues.set(name, value);
        if (!overriddenVars.includes(name)) {
          overriddenVars.push(name);
        }
      } else if (options.includeCustomVars) {
        varValues.set(name, value);
        if (!seenVars.has(name)) {
          seenVars.add(name);
          canonicalVars.push(name);
          customVars.push(name);
        }
      } else {
        if (!ignoredVars.includes(name)) {
          ignoredVars.push(name);
        }
      }
    }
  }

  // 3. Build contract tree & breakpoints in strict source order
  const contractTree = buildTreeFromVars(canonicalVars, varValues);
  const breakpoints = extractBreakpointsFromVars(varValues, canonicalVars);

  const hasCustomBreakpoints =
    customVars.some((v) => isBreakpointVarName(v)) ||
    overriddenVars.some((v) => isBreakpointVarName(v));

  const serializedTree = serializeObjectWithComments(contractTree, varValues);
  const metaAttachment = `Object.defineProperty(vars, Symbol.for('__CUMULO_META__'), {
  value: { kind: 'contract' },
  enumerable: false,
  configurable: true,
});`;

  const breakpointsTypeExport =
    Object.keys(breakpoints).length > 0
      ? `\nexport type ThemeBreakpoints = ThemeVars['breakpoint'];`
      : '';

  const endContent = `
export const vars = ${serializedTree} as const;

${metaAttachment}

export type ThemeVars = typeof vars;${breakpointsTypeExport}

// union of all the var values ("var(--surface-primary-hover)")
export type VarValue<T = ThemeVars> = T extends \`var(--\${string})\`
  ? T
  : T extends Record<string, unknown>
    ? VarValue<T[keyof T]>
    : never;

// union of all the var paths ("vars.surface.primary.bg")
export type VarPath<T = typeof vars, Prefix extends string = 'vars'> = T extends string
  ? Prefix
  : {
      [K in keyof T & string]: T[K] extends string
        ? K extends \`\${number}\${string}\`
          ? \`\${Prefix}["\${K}"]\`
          : \`\${Prefix}.\${K}\`
        : K extends \`\${number}\${string}\`
          ? VarPath<T[K], \`\${Prefix}["\${K}"]\`>
          : VarPath<T[K], \`\${Prefix}.\${K}\`>;
    }[keyof T & string];`;

  const standaloneAugmentation = hasCustomBreakpoints
    ? `\n\n${serializeBreakpointsAugmentation(breakpoints)}`
    : '';

  // 5. Generate contract.ts content
  const contractContent = `// Auto-generated from theme.css by @cumulo/core theme generator

 ${endContent}
`;

  // 6. Generate standalone file content (when exporting a single file for consumer apps)
  const standaloneContent = `// Auto-generated by @cumulo/core theme generator

    ${endContent}${standaloneAugmentation}
`;

  return {
    contractCode: await tryFormatCode('contract.ts', contractContent),
    standaloneCode: await tryFormatCode('theme-vars.ts', standaloneContent),
    canonicalVars,
    overriddenVars,
    customVars,
    ignoredVars,
    varValues,
    breakpoints,
  };
}

/**
 * Executes theme generation and writes the standalone contract file to `options.outPath`.
 * Skips writing if the target file already matches the generated output.
 *
 * @returns `true` if the output file was created or updated, `false` if already up to date.
 */
export async function runThemeGeneration(options: GenerateThemeOptions = {}): Promise<boolean> {
  if (!options.outPath) {
    throw new Error('You must provide --out <path>.');
  }

  const result = await generateTheme(options);
  const targetFile = path.resolve(options.outPath);
  const parentDir = path.dirname(targetFile);
  if (!fs.existsSync(parentDir)) {
    fs.mkdirSync(parentDir, { recursive: true });
  }

  const existing = fs.existsSync(targetFile) ? fs.readFileSync(targetFile, 'utf-8') : undefined;
  if (existing === result.standaloneCode) {
    return false;
  }

  fs.writeFileSync(targetFile, result.standaloneCode);
  if (!options.silent) {
    console.log(`[cumulo] Wrote theme contract to ${targetFile}`);
    if (result.overriddenVars.length > 0) {
      console.log(
        `[cumulo] Applied ${result.overriddenVars.length} theme overrides from custom CSS.`,
      );
    }
    if (result.customVars.length > 0) {
      console.log(`[cumulo] Added ${result.customVars.length} custom CSS variables to contract.`);
    }
    if (result.ignoredVars.length > 0) {
      console.log(
        `[cumulo] Ignored ${result.ignoredVars.length} custom properties not defined in default theme contract. Pass --include-custom to include them.`,
      );
    }
  }
  return true;
}
