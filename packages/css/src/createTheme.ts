import { hash } from './hash.js';
import { sheet } from './sheet.js';
import type { NullableTokens, MapTokensToVars, MapTokensToValues, CreatedTheme } from './types.js';

function walkTokens<T extends NullableTokens>(
  tokens: T,
  path: string[] = [],
  callback: (path: string[]) => string,
): MapTokensToVars<T> {
  const result: any = {};
  for (const key of Object.keys(tokens)) {
    const value = tokens[key];
    const currentPath = [...path, key];
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = walkTokens(value, currentPath, callback);
    } else {
      result[key] = callback(currentPath);
    }
  }
  return result;
}

function pathToVarName(path: string[], prefix = 'c'): string {
  const kebab = path
    .map((segment) => segment.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase())
    .join('-');
  return `--${prefix}-${kebab}`;
}

/**
 * Creates a type-safe theme contract where all values are CSS variables.
 */
export function createThemeContract<T extends NullableTokens>(
  contract: T,
  prefix = 'c',
): MapTokensToVars<T> {
  return walkTokens(contract, [], (path) => `var(${pathToVarName(path, prefix)})`);
}

function flattenValues<T extends Record<string, any>>(
  values: T,
  path: string[] = [],
  prefix = 'c',
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const key of Object.keys(values)) {
    const value = values[key];
    const currentPath = [...path, key];
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(result, flattenValues(value, currentPath, prefix));
    } else if (value !== undefined && value !== null) {
      result[pathToVarName(currentPath, prefix)] = String(value);
    }
  }
  return result;
}

/**
 * Creates a scoped theme class that sets CSS variables matching a theme contract.
 */
export function createTheme<T extends NullableTokens>(
  _contract: MapTokensToVars<T> | T,
  values: MapTokensToValues<T>,
  prefix = 'c',
): CreatedTheme {
  const flattened = flattenValues(values, [], prefix);
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
 * Creates a global theme attached to a specific CSS selector (e.g. ':root' or '[data-theme="dark"]').
 */
export function createGlobalTheme<T extends NullableTokens>(
  selector: string,
  _contract: MapTokensToVars<T> | T,
  values: MapTokensToValues<T>,
  prefix = 'c',
): { css: string; vars: Record<string, string> } {
  const flattened = flattenValues(values, [], prefix);
  const cssBody = Object.entries(flattened)
    .map(([varName, val]) => `${varName}:${val};`)
    .join('');

  const css = `${selector}{${cssBody}}`;
  sheet.insertRule(css);

  return { css, vars: flattened };
}

/**
 * Converts theme values to an inline style object for dynamic overrides in React.
 */
export function assignVars<T extends NullableTokens>(
  _contract: MapTokensToVars<T> | T,
  values: Partial<MapTokensToValues<T>>,
  prefix = 'c',
): Record<string, string> {
  return flattenValues(values, [], prefix);
}
