/**
 * Canonical viewport breakpoints aligned with Cumulo's `vars.container.*` widths.
 * Used by responsive layout primitives (`Card`, `Surface`, `Stack`, `Grid`, `Container`, `Panel`)
 * and available for consumer `recipe({ breakpoints, responsiveVariants })` definitions.
 */
export const breakpoints = {
  sm: '@media (min-width: 640px)',
  md: '@media (min-width: 768px)',
  lg: '@media (min-width: 1024px)',
  xl: '@media (min-width: 1280px)',
  '2xl': '@media (min-width: 1440px)',
} as const;

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
export function containerQuery(minWidth: string, name?: string): string {
  return name
    ? `@container ${name} (min-width: ${minWidth})`
    : `@container (min-width: ${minWidth})`;
}

/**
 * Creates a standard `sm`–`2xl` breakpoint map using CSS `@container` queries
 * instead of viewport `@media` queries, optionally scoped to a named container.
 */
export function createContainerBreakpoints(name?: string): {
  readonly sm: string;
  readonly md: string;
  readonly lg: string;
  readonly xl: string;
  readonly '2xl': string;
} {
  return {
    sm: containerQuery('640px', name),
    md: containerQuery('768px', name),
    lg: containerQuery('1024px', name),
    xl: containerQuery('1280px', name),
    '2xl': containerQuery('1440px', name),
  };
}
