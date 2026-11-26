import type { AtRule } from '@cumulo/css';

/**
 * Minimum widths of Cumulo's breakpoints, aligned with `vars.container.*` widths.
 * Single source of truth for both the viewport (`@media`) and container (`@container`) maps.
 */
const breakpointWidths = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1440px',
} as const;

/**
 * Canonical viewport breakpoints.
 * Used by responsive layout primitives (`Card`, `Surface`, `Stack`, `Grid`, `Container`, `Panel`)
 * and available for consumer `recipe({ breakpoints, responsiveVariants })` definitions.
 */
export const breakpoints = {
  sm: `@media (min-width: ${breakpointWidths.sm})`,
  md: `@media (min-width: ${breakpointWidths.md})`,
  lg: `@media (min-width: ${breakpointWidths.lg})`,
  xl: `@media (min-width: ${breakpointWidths.xl})`,
  '2xl': `@media (min-width: ${breakpointWidths['2xl']})`,
} as const satisfies Record<keyof typeof breakpointWidths, AtRule>;

export type Breakpoint = keyof typeof breakpoints;

/**
 * Formats a CSS `@container` min-width query string for use in `recipe({ breakpoints })`.
 *
 * @example
 * ```ts
 * const cardRecipe = recipe({
 *   breakpoints: {
 *     compact: containerQuery('400px', 'card'),
 *     wide: containerQuery('640px', 'card'),
 *   },
 *   responsiveVariants: ['padding'],
 *   variants: { ... },
 * });
 * ```
 */
export function containerQuery(minWidth: string, name?: string): AtRule {
  return name
    ? `@container ${name} (min-width: ${minWidth})`
    : `@container (min-width: ${minWidth})`;
}

/**
 * Creates a standard `sm`–`2xl` breakpoint map using CSS `@container` queries
 * instead of viewport `@media` queries, optionally scoped to a named container.
 */
export function createContainerBreakpoints(name?: string): Record<Breakpoint, AtRule> {
  return {
    sm: containerQuery(breakpointWidths.sm, name),
    md: containerQuery(breakpointWidths.md, name),
    lg: containerQuery(breakpointWidths.lg, name),
    xl: containerQuery(breakpointWidths.xl, name),
    '2xl': containerQuery(breakpointWidths['2xl'], name),
  };
}
