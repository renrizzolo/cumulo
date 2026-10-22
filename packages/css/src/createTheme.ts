import { hash } from './hash.js';
import { sheet } from './sheet.js';
import type {
  NullableTokens,
  MapTokensToVars,
  MapTokensToValues,
  MapTokensToPartialValues,
  CSSVariableMap,
  CheckReservedContractKeys,
  ThemeContract,
  CreatedTheme,
} from './types.js';

function walkTokens<T extends NullableTokens>(
  tokens: T,
  path: string[] = [],
  callback: (path: string[]) => string,
): MapTokensToVars<T> {
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(tokens)) {
    const value = tokens[key];
    const currentPath = [...path, key];
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = walkTokens(value as NullableTokens, currentPath, callback);
    } else {
      result[key] = callback(currentPath);
    }
  }
  return result as MapTokensToVars<T>;
}

function pathToVarName(path: string[], prefix = 'c'): `--${string}` {
  const kebab = path
    .map((segment) => segment.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase())
    .join('-');
  return `--${prefix}-${kebab}`;
}

/**
 * Creates a type-safe theme contract where every leaf is a `var(--prefix-path)` reference.
 * `$set()` builds the matching variable assignments.
 *
 * @param contract - Token blueprint; leaf values are `null`.
 * @param prefix - Custom property prefix. Defaults to `'c'`.
 *
 * @example
 * ```ts
 * const card = createThemeContract({ bg: null, border: null }, 'card');
 *
 * card.bg; // "var(--card-bg)"
 * card.$set({ bg: 'red' }); // { '--card-bg': 'red' }
 * ```
 */
export function createThemeContract<T extends NullableTokens>(
  contract: T & CheckReservedContractKeys<T>,
  prefix = 'c',
): ThemeContract<T> {
  const varsObj = walkTokens(contract, [], (path) => `var(${pathToVarName(path, prefix)})`);
  const contractObj = varsObj as ThemeContract<T>;
  Object.defineProperty(contractObj, 'prefix', {
    value: prefix,
    enumerable: false,
    configurable: true,
  });
  Object.defineProperty(contractObj, '$set', {
    value: (values: MapTokensToPartialValues<T>): CSSVariableMap =>
      flattenValues(values, [], prefix),
    enumerable: false,
    configurable: true,
  });
  return contractObj;
}

function flattenValues(values: object, path: string[] = [], prefix = 'c'): CSSVariableMap {
  const result: CSSVariableMap = {};
  for (const [key, value] of Object.entries(values)) {
    const currentPath = [...path, key];
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(result, flattenValues(value, currentPath, prefix));
    } else if (value !== undefined && value !== null) {
      result[pathToVarName(currentPath, prefix)] = String(value);
    }
  }
  return result;
}

function resolvePrefix(contract: unknown, prefix?: string): string {
  if (prefix !== undefined) return prefix;
  if (
    contract &&
    typeof contract === 'object' &&
    'prefix' in contract &&
    typeof contract.prefix === 'string'
  ) {
    return contract.prefix;
  }
  return 'c';
}

/**
 * Creates a scoped theme class that sets CSS variables matching a theme contract.
 * The prefix is read from the contract unless passed explicitly.
 *
 * @example
 * ```tsx
 * const dark = createTheme(colorContract, { surface: '#0f172a' });
 *
 * <div className={cx(dark.className, styles)} />
 * ```
 */
export function createTheme<T extends NullableTokens>(
  _contract: ThemeContract<T> | MapTokensToVars<T> | T,
  values: MapTokensToValues<T>,
  prefix?: string,
): CreatedTheme {
  const actualPrefix = resolvePrefix(_contract, prefix);
  const flattened = flattenValues(values, [], actualPrefix);
  const cssBody = Object.entries(flattened)
    .map(([varName, val]) => `${varName}:${val};`)
    .join('');

  const className = `theme-${hash(cssBody)}`;
  const css = `.${className}{${cssBody}}`;

  sheet.insertRule(css);

  return {
    className,
    vars: flattened,
    css,
    toString() {
      return this.className;
    },
  };
}

/**
 * Injects raw CSS variables or styles at a global selector (e.g. ':root' or '[data-theme="dark"]').
 */
export function createGlobalStyles(
  selector: string,
  styles: Record<string, string>,
): { css: string; vars: Record<string, string> } {
  const cssBody = Object.entries(styles)
    .map(([varName, val]) => `${varName}:${val};`)
    .join('');

  const css = `${selector}{${cssBody}}`;
  sheet.insertRule(css);

  return { css, vars: styles };
}

/**
 * Creates a global theme attached to a specific CSS selector (e.g. ':root' or '[data-theme="dark"]').
 */
export function createGlobalTheme<T extends NullableTokens>(
  selector: string,
  _contract: ThemeContract<T> | MapTokensToVars<T> | T,
  values: MapTokensToValues<T>,
  prefix?: string,
): { css: string; vars: Record<string, string> } {
  const actualPrefix = resolvePrefix(_contract, prefix);
  const flattened = flattenValues(values, [], actualPrefix);
  return createGlobalStyles(selector, flattened);
}

/**
 * Converts theme values to an inline style object for dynamic overrides in React.
 */
export function assignVars<T extends NullableTokens>(
  _contract: ThemeContract<T> | MapTokensToVars<T> | T,
  values: MapTokensToPartialValues<T>,
  prefix?: string,
): CSSVariableMap {
  const actualPrefix = resolvePrefix(_contract, prefix);
  return flattenValues(values, [], actualPrefix);
}
