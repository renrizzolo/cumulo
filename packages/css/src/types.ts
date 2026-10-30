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

/**
 * This is a supertype of CSSProperties, so we keep it separate
 * to avoid conflicts.
 *
 * i.e `style()` and `recipe()` can use this, but they return
 * CSSProperties to remain compatible.
 **/
export interface StyleProperties extends Omit<CSSProperties, 'appearance'> {
  appearance?: CSSType.Properties['appearance'] | 'base-select';
}

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

export type SelectorBlock = {
  [selector: string]: StyleProperties | ComplexStyleRule;
};

export interface ComplexStyleRule extends StyleProperties {
  selectors?: Record<string, StyleProperties>;
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
  | CompiledStyle
  | CreatedTheme
  | ClassValue[]
  | { [key: string]: boolean | undefined | null };
