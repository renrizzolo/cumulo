/**
 * Canonical cascade layer order shared by `theme.css` and the build-time extractor.
 * Later layers win, and unlayered styles (consumer `className` overrides) beat all layers.
 */
export const LAYER_ORDER = ['reset', 'base', 'components', 'utilities'] as const;

/** The `@layer` statement declaring {@link LAYER_ORDER}, emitted ahead of layered CSS. */
export const LAYER_ORDER_STATEMENT = `@layer ${LAYER_ORDER.join(', ')};`;
