import type * as React from 'react';

export type CSSProperties = React.CSSProperties & {
  [key: `--${string}`]: string | number | undefined;
};

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
  [selector: string]: CSSProperties | ComplexStyleRule;
};

export interface ComplexStyleRule extends CSSProperties {
  selectors?: Record<string, CSSProperties>;
  '@media'?: Record<string, CSSProperties>;
  '@container'?: Record<string, CSSProperties>;
  '@supports'?: Record<string, CSSProperties>;
  ':hover'?: CSSProperties;
  ':focus'?: CSSProperties;
  ':focus-visible'?: CSSProperties;
  ':focus-within'?: CSSProperties;
  ':active'?: CSSProperties;
  ':disabled'?: CSSProperties;
  '::before'?: CSSProperties;
  '::after'?: CSSProperties;
  '::placeholder'?: CSSProperties;
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

export type NullableTokens = {
  [key: string]: null | string | NullableTokens;
};

export type MapTokensToVars<T> = {
  [K in keyof T]: T[K] extends Record<string, any> ? MapTokensToVars<T[K]> : string;
};

export type MapTokensToValues<T> = {
  [K in keyof T]: T[K] extends Record<string, any> ? MapTokensToValues<T[K]> : string | number;
};

export interface ThemeContract<T extends NullableTokens = NullableTokens> {
  vars: MapTokensToVars<T>;
  prefix: string;
}

export interface CreatedTheme {
  className: string;
  vars: Record<string, string>;
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
