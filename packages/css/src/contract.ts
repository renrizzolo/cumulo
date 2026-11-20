import { attachMeta } from './meta.js';
import type {
  CheckReservedContractKeys,
  CSSVariableMap,
  MapTokensToPartialValues,
  MapTokensToVars,
  NullableTokens,
  ThemeContract,
} from './types.js';

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function pathToVarName(path: string[], prefix = 'c'): `--${string}` {
  const kebab = path
    .map((segment) => segment.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase())
    .join('-');
  return `--${prefix}-${kebab}`;
}

export function flattenValues(values: object, path: string[] = [], prefix = 'c'): CSSVariableMap {
  const result: CSSVariableMap = {};
  for (const [key, value] of Object.entries(values)) {
    const currentPath = [...path, key];
    if (isPlainRecord(value)) {
      Object.assign(result, flattenValues(value, currentPath, prefix));
    } else if (value !== undefined && value !== null) {
      result[pathToVarName(currentPath, prefix)] = String(value);
    }
  }
  return result;
}

export function resolvePrefix(contract: unknown, prefix?: string): string {
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
      result[key] = walkTokens(value, currentPath, callback);
    } else {
      result[key] = callback(currentPath);
    }
  }
  return result as MapTokensToVars<T>;
}

/**
 * Creates a type-safe theme contract where every leaf is a `var(--prefix-path)` reference.
 * `$set()` builds the matching variable assignments.
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
  return attachMeta(contractObj, { kind: 'contract' });
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
