import type * as CSSType from 'csstype';

/**
 * like React.CSSProperties, with cornerShape and custom property types.
 */
export interface CSSProperties extends CSSType.Properties<string | number> {
  [key: `--${string}`]: string | number | undefined;
  cornerShape?: CornerShape;
  cornerTopLeftShape?: CornerShape;
  cornerTopRightShape?: CornerShape;
  cornerBottomRightShape?: CornerShape;
  cornerBottomLeftShape?: CornerShape;
}

export type CSSVarRef = `var(--${string})`;

type BaseStyleProperties = Omit<CSSProperties, 'appearance'> & {
  appearance?: CSSType.Properties['appearance'] | 'base-select';
};

/**
 * This is a supertype of CSSProperties, so we keep it separate
 * to avoid conflicts.
 *
 * i.e `style()` and `recipe()` can use this, but they return
 * CSSProperties to remain compatible.
 **/
export type StyleProperties = {
  [K in keyof BaseStyleProperties]?: BaseStyleProperties[K] | CSSVarRef;
} & {
  [key: `--${string}`]: string | number | undefined;
};

type CornerShape =
  | CSSType.Globals
  | 'bevel'
  | 'notch'
  | 'round'
  | 'scoop'
  | 'square'
  | 'squircle'
  | `superellipse(${number | 'infinity'})`;

export type PseudoClass =
  | ':hover'
  | ':focus'
  | ':focus-visible'
  | ':focus-within'
  | ':active'
  | ':disabled'
  | ':enabled'
  | ':checked'
  | ':empty'
  | ':first-child'
  | ':last-child'
  | ':read-only';

export type PseudoElement = '::before' | '::after' | '::placeholder' | '::selection' | '::backdrop';

export interface SelectorStyleRule extends StyleProperties {
  '@starting-style'?: StyleProperties;
  '@media'?: Record<string, StyleProperties>;
}

export interface ComplexStyleRule extends StyleProperties {
  selectors?: Record<string, SelectorStyleRule>;
  '@starting-style'?: StyleProperties;
  '@media'?: Record<string, StyleProperties>;
  '@container'?: Record<string, StyleProperties>;
  '@supports'?: Record<string, StyleProperties>;
  ':hover'?: StyleProperties;
  ':focus'?: StyleProperties;
  ':focus-visible'?: StyleProperties;
  ':focus-within'?: StyleProperties;
  ':active'?: StyleProperties;
  ':disabled'?: StyleProperties;
  '::before'?: StyleProperties;
  '::after'?: StyleProperties;
  '::placeholder'?: StyleProperties;
}

export type StyleRule = ComplexStyleRule;

export type StyleDefinitions<Keys extends string = string> = Record<Keys, StyleRule>;

/**
 * Cascade layer name. The canonical Cumulo layers (see {@link LAYER_ORDER}) autocomplete,
 * while custom layer names remain allowed.
 */
export type CssLayer = 'reset' | 'base' | 'components' | 'utilities' | (string & {});

/**
 * A conditional CSS at-rule prelude, e.g. `'@media (min-width: 768px)'` or
 * `'@container card (min-width: 480px)'`.
 */
export type AtRule = `@media ${string}` | `@container ${string}` | `@supports ${string}`;

export interface StyleOptions {
  /** Class name prefix (default `'c'`). */
  prefix?: string;
  /** Optional CSS cascade layer name (e.g. `'components'`). */
  layer?: CssLayer;
  /** Optional CSS at-rule wrapper (e.g. `'@media (min-width: 768px)'` or `'@container (min-width: 400px)'`). */
  atRule?: AtRule;
}

/**
 * Map of breakpoint keys (e.g. `'sm'`, `'md'`) to full at-rule strings
 * (e.g. `'@media (min-width: 768px)'` or `'@container card (min-width: 480px)'`).
 */
export type BreakpointsMap = Readonly<Record<string, Exclude<AtRule, `@supports ${string}`>>>;

/**
 * Responsive breakpoint map `{ initial?: T, [bp]?: T }`.
 */
export type ResponsiveObject<T, B extends string> = { initial?: T } & Partial<Record<B, T>>;

/**
 * Value that can be either a static value `T` or a responsive breakpoint map.
 * Collapses to `T` when no breakpoints are configured.
 */
export type ResponsiveValue<T, B extends string = never> = [B] extends [never]
  ? T
  : T | ResponsiveObject<T, B>;

/**
 * Precomputed class names for responsive variants: `variant -> breakpoint -> option -> className`.
 */
export type ResponsiveClassMap = Record<string, Record<string, Record<string, string>>>;

export interface CompiledStyle {
  className: string;
  css: string;
  toString(): string;
}

export type CompiledStyles<T extends StyleDefinitions> = {
  [K in keyof T]: CompiledStyle;
};

/**
 * Shape of tokens definition where leaf values are null or string placeholders.
 */
export type NullableTokens = {
  [key: string]: null | string | NullableTokens;
};

/**
 * Maps token structure to CSS variable references (`var(--prefix-...)`).
 */
export type MapTokensToVars<T> = {
  [K in keyof T]: T[K] extends Record<string, unknown> ? MapTokensToVars<T[K]> : string;
};

/**
 * Maps token structure to concrete values (string or number).
 */
export type MapTokensToValues<T> = {
  [K in keyof T]: T[K] extends Record<string, unknown> ? MapTokensToValues<T[K]> : string | number;
};

/**
 * Maps token structure to optional/partial concrete values for targeted updates.
 */
export type MapTokensToPartialValues<T> = {
  [K in keyof T]?: T[K] extends Record<string, unknown>
    ? MapTokensToPartialValues<T[K]>
    : string | number | undefined;
};

/**
 * Map of CSS custom property names (`--${string}`) to their string values.
 */
export type CSSVariableMap = Record<`--${string}`, string>;

/**
 * Reserved property names on theme contracts that cannot be used as token keys.
 */
export type ReservedContractKeys = '$set' | 'prefix';

/**
 * Compile-time validator ensuring no token keys conflict with reserved contract properties.
 */
export type CheckReservedContractKeys<T> = keyof T & ReservedContractKeys extends never
  ? T
  : {
      [K in keyof T]: K extends ReservedContractKeys
        ? `Error: "${K & string}" is a reserved contract property name`
        : T[K];
    };

/**
 * Type-safe theme contract providing CSS variable references and assignment helpers.
 */
export type ThemeContract<T extends NullableTokens = NullableTokens> = MapTokensToVars<T> & {
  /**
   * Generates a dictionary of CSS custom properties for this contract, suitable for spreading
   * directly into style rules or recipes without manually writing raw `--variable-name` strings.
   *
   * @example
   * ```ts
   * bordered: {
   *   ...tableContract.$set({
   *     bg: vars.surface.bg.next,
   *   }),
   * }
   * ```
   */
  $set(values: MapTokensToPartialValues<T>): CSSVariableMap;

  /**
   * The prefix used to namespace the contract's CSS custom properties.
   */
  prefix: string;
};

/**
 * Represents a created theme containing scoped CSS variables and its generated class name.
 */
export interface CreatedTheme {
  /** Generated scoped class name that defines the theme variables. */
  className: string;
  /** Flattened dictionary of CSS custom properties and their values. */
  vars: Record<string, string>;
  /** Compiled CSS stylesheet rule for this theme. */
  css: string;
  toString(): string;
}

export type ClassValue =
  | string
  | number
  | boolean
  | undefined
  | null
  | { readonly className: string }
  | CompiledStyle
  | CreatedTheme
  | ClassValue[]
  | { [key: string]: boolean | undefined | null };
