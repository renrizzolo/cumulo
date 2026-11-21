import { assignVars, createThemeContract, flattenValues, resolvePrefix } from './contract.js';
import { hash } from './hash.js';
import { attachMeta } from './meta.js';
import { sheet } from './sheet.js';
import type {
  NullableTokens,
  MapTokensToVars,
  MapTokensToValues,
  ThemeContract,
  CreatedTheme,
} from './types.js';

export { createThemeContract, assignVars };

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

  return attachMeta(
    {
      className,
      vars: flattened,
      css,
      toString() {
        return this.className;
      },
    },
    { kind: 'theme', className, vars: flattened },
  );
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

  return attachMeta({ css, vars: styles }, { kind: 'global', vars: styles });
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
