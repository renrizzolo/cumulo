/**
 * Canonical cascade layer order shared by `theme.css` and the build-time extractor.
 * Later layers win, and unlayered styles (consumer `className` overrides) beat all layers.
 */
export const LAYER_ORDER = ['reset', 'base', 'components', 'responsive', 'utilities'] as const;

/** The `@layer` statement declaring {@link LAYER_ORDER}, emitted ahead of layered CSS. */
export const LAYER_ORDER_STATEMENT = `@layer ${LAYER_ORDER.join(', ')};`;

/**
 * Converts a breakpoint/condition key (such as `'md'`, `'2xl'`, or `'@sm'`) into a valid
 * CSS identifier segment for responsive sub-layers and class prefixes.
 */
export function sanitizeConditionKey(conditionKey: string): string {
  return conditionKey.replace(/[^a-zA-Z0-9_-]/g, '_');
}

/**
 * Maps a breakpoint/condition key to its canonical responsive cascade sub-layer name
 * (e.g. `'2xl'` -> `'responsive.bp-2xl'`). Prefixing with `bp-` ensures keys starting
 * with digits remain valid CSS `<ident>` tokens.
 */
export function toResponsiveLayerName(conditionKey: string): string {
  return `responsive.bp-${sanitizeConditionKey(conditionKey)}`;
}
