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
 * Creates a type-safe theme contract where all values are CSS variables.
 *
 * @param contract - Token blueprint object where leaf values are `null` or placeholder strings.
 * @param prefix - Prefix used for generated CSS custom property names (`--${prefix}-${key}`). Defaults to `'c'`.
 * @returns A `ThemeContract` containing CSS variable references (`var(--...)`) and a `.$set()` method
 * to generate scoped variable assignments without writing raw string property names.
 *
 * @example
 * ```ts
 * export const cardContract = createThemeContract({
 *   bg: null,
 *   border: null,
 * }, 'card');
 *
 * // Reading: cardContract.bg -> "var(--card-bg)"
 * // Assigning in a variant or rule:
 * const highlighted = style({
 *   ...cardContract.$set({ bg: 'var(--surface-bg-next)' }),
 * });
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
      flattenValues(values as Record<string, unknown>, [], prefix),
    enumerable: false,
    configurable: true,
  });
  return contractObj;
}

function flattenValues<T extends Record<string, unknown>>(
  values: T,
  path: string[] = [],
  prefix = 'c',
): CSSVariableMap {
  const result: Record<string, string> = {};
  for (const key of Object.keys(values)) {
    const value = values[key];
    const currentPath = [...path, key];
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(result, flattenValues(value as Record<string, unknown>, currentPath, prefix));
    } else if (value !== undefined && value !== null) {
      result[pathToVarName(currentPath, prefix)] = String(value);
    }
  }
  return result as CSSVariableMap;
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
 *
 * @example
 * ```ts
 * import { createTheme } from '@cumulo/css';
 *
 * const darkTheme = createTheme(colorContract, {
 *   surface: '#0f172a',
 * });
 *
 * const styles = style({
 *  base: {
 *   backgroundColor: darkTheme.vars.surface,
 *  }
 * });
 *
 * // Usage:
 * <div className={darkTheme.className, styles.className}>...</div>
 * ```
 */
export function createTheme<T extends NullableTokens>(
  _contract: ThemeContract<T> | MapTokensToVars<T> | T,
  values: MapTokensToValues<T>,
  prefix?: string,
): CreatedTheme {
  const actualPrefix = resolvePrefix(_contract, prefix);
  const flattened = flattenValues(values as Record<string, unknown>, [], actualPrefix);
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
  const flattened = flattenValues(values as Record<string, unknown>, [], actualPrefix);
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
  return flattenValues(values as Record<string, unknown>, [], actualPrefix);
}
