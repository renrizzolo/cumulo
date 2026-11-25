import { style } from './create.js';
import { attachMeta } from './meta.js';
import {
  runtimeRecipe,
  type RuntimeRecipeCompoundVariant,
  type RuntimeRecipeConfig,
  type RuntimeVariantValue,
} from './runtime.js';
import type { BreakpointsMap, ResponsiveValue, StyleRule } from './types.js';

type VariantDefinitions = Record<string, Record<string, StyleRule>>;

type BooleanMap<T> = T extends 'true' | 'false' ? boolean | T : T;

export type VariantSelection<T extends VariantDefinitions> = {
  [K in keyof T]?: BooleanMap<keyof T[K]> | undefined;
};

export type ResponsiveVariantSelection<
  T extends VariantDefinitions,
  B extends string = never,
  R extends PropertyKey = never,
> = {
  [K in keyof T]?:
    | (K extends R ? ResponsiveValue<BooleanMap<keyof T[K]>, B> : BooleanMap<keyof T[K]>)
    | undefined;
};

export type CompoundVariant<T extends VariantDefinitions> = {
  variants: VariantSelection<T>;
  style: StyleRule;
};

export type UnionToIntersection<U> = (U extends unknown ? (k: U) => void : never) extends (
  k: infer I,
) => void
  ? I
  : never;

export type ExtractRecipeVariants<E> =
  E extends RecipeFunction<infer V, infer _B, infer _R>
    ? V
    : E extends RecipeOptions<infer V2, unknown, BreakpointsMap>
      ? V2
      : E extends readonly (infer U)[]
        ? UnionToIntersection<ExtractRecipeVariants<U>>
        : {};

export type ExtractRecipeBreakpoints<E> =
  E extends RecipeFunction<infer _V, infer B, infer _R>
    ? B
    : E extends readonly (infer U)[]
      ? ExtractRecipeBreakpoints<U>
      : never;

export type ExtractRecipeResponsiveKeys<E> =
  E extends RecipeFunction<infer _V, infer _B, infer R>
    ? R
    : E extends readonly (infer U)[]
      ? ExtractRecipeResponsiveKeys<U>
      : never;

type CleanVariants<T extends VariantDefinitions> = string extends keyof T ? {} : T;

export type ExtractBreakpointKeys<B> = B extends BreakpointsMap ? keyof B & string : never;

export type RecipeOptionsValidation<T extends VariantDefinitions, E> = keyof T extends never
  ? E extends undefined
    ? 'Error: recipe() requires at least one of `variants` or `extend`. Use style() for static styles.'
    : unknown
  : unknown;

export interface RecipeOptions<
  T extends VariantDefinitions = {},
  E = undefined,
  B extends BreakpointsMap | undefined = undefined,
  R extends keyof (CleanVariants<T> & ExtractRecipeVariants<E>) = never,
> {
  /** Optional CSS cascade layer name (e.g. `'components'`). */
  layer?: string;
  /** Breakpoint map of keys to `@media` or `@container` query strings for `responsiveVariants`. */
  breakpoints?: B;
  /** Variant keys that accept responsive breakpoint objects `{ initial?: ..., [bp]?: ... }`. */
  responsiveVariants?: readonly R[];
  base?: StyleRule | StyleRule[];
  extend?: E;
  variants?: T;
  compoundVariants?: CompoundVariant<CleanVariants<T> & ExtractRecipeVariants<E>>[];
  defaultVariants?: VariantSelection<CleanVariants<T> & ExtractRecipeVariants<E>>;
}

export interface RecipeFunction<
  T extends VariantDefinitions = {},
  B extends string = never,
  R extends PropertyKey = never,
> {
  (options?: ResponsiveVariantSelection<T, B, R>): string;
  variants: () => (keyof T)[];
  options: RecipeOptions<T, unknown, BreakpointsMap>;
  classNames: {
    base?: string;
    variants: {
      [K in keyof T]: {
        [V in keyof T[K]]: string;
      };
    };
    responsiveVariants?: Record<string, Record<string, Record<string, string>>>;
    compoundVariants: Array<{
      variants: VariantSelection<T>;
      className: string;
    }>;
  };
}

export type RecipeVariants<T> =
  T extends RecipeFunction<infer V, infer B, infer R> ? ResponsiveVariantSelection<V, B, R> : never;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizeAtRule(query: string): string {
  const trimmed = query.trim();
  if (
    trimmed.startsWith('@media') ||
    trimmed.startsWith('@container') ||
    trimmed.startsWith('@supports')
  ) {
    return trimmed;
  }
  return `@media ${trimmed}`;
}

function mergePlainObjects(
  target: Record<string, unknown>,
  source: object,
): Record<string, unknown> {
  const out: Record<string, unknown> = { ...target };
  for (const [key, value] of Object.entries(source)) {
    const existing = out[key];
    if (isPlainObject(value) && isPlainObject(existing)) {
      out[key] = mergePlainObjects(existing, value);
    } else {
      out[key] = value;
    }
  }
  return out;
}

function mergeStyleRules(rules: (StyleRule | undefined)[]): StyleRule | undefined {
  const defined = rules.filter((r): r is StyleRule => Boolean(r));
  if (defined.length === 0) return undefined;
  if (defined.length === 1) return defined[0];
  let result: Record<string, unknown> = {};

  for (const rule of defined) {
    result = mergePlainObjects(result, rule);
  }

  return result as StyleRule;
}

interface OptionsCollector {
  layer?: string;
  breakpoints: Record<string, string>;
  responsiveVariants: Set<string>;
  bases: StyleRule[];
  variants: Record<string, Record<string, StyleRule>>;
  compoundVariants: CompoundVariant<VariantDefinitions>[];
  defaultVariants: Record<string, string | boolean | undefined>;
}

function collectExtendedOptions(ext: unknown, acc: OptionsCollector): void {
  if (!ext || (typeof ext !== 'object' && typeof ext !== 'function')) return;

  const extOpts =
    typeof ext === 'function' && 'options' in ext
      ? (ext as { options: RecipeOptions<VariantDefinitions, unknown, BreakpointsMap> }).options
      : (ext as RecipeOptions<VariantDefinitions, unknown, BreakpointsMap>);

  if (!extOpts) return;

  if (extOpts.extend) {
    const parentExts = Array.isArray(extOpts.extend) ? extOpts.extend : [extOpts.extend];
    for (const parent of parentExts) {
      collectExtendedOptions(parent, acc);
    }
  }

  if (extOpts.layer !== undefined) {
    acc.layer = extOpts.layer;
  }

  if (extOpts.breakpoints) {
    Object.assign(acc.breakpoints, extOpts.breakpoints);
  }

  if (extOpts.responsiveVariants) {
    for (const key of extOpts.responsiveVariants) {
      acc.responsiveVariants.add(String(key));
    }
  }

  if (extOpts.base) {
    if (Array.isArray(extOpts.base)) {
      acc.bases.push(...extOpts.base);
    } else {
      acc.bases.push(extOpts.base);
    }
  }

  if (extOpts.variants) {
    for (const vKey of Object.keys(extOpts.variants)) {
      if (!acc.variants[vKey]) {
        acc.variants[vKey] = {};
      }
      for (const optKey of Object.keys(extOpts.variants[vKey])) {
        acc.variants[vKey][optKey] =
          mergeStyleRules([acc.variants[vKey][optKey], extOpts.variants[vKey][optKey]]) || {};
      }
    }
  }

  if (extOpts.compoundVariants) {
    acc.compoundVariants.push(...extOpts.compoundVariants);
  }

  if (extOpts.defaultVariants) {
    Object.assign(acc.defaultVariants, extOpts.defaultVariants);
  }
}

/**
 * Creates a zero-runtime recipe/variants function.
 * Supports recursive extends, CSS cascade layers, and responsive variants (`@media` & `@container`),
 * compiling all CSS upfront into static classes.
 */
export function recipe<
  T extends VariantDefinitions = {},
  E = undefined,
  B extends BreakpointsMap | undefined = undefined,
  R extends keyof (CleanVariants<T> & ExtractRecipeVariants<E>) = never,
>(
  options: RecipeOptions<T, E, B, R> & RecipeOptionsValidation<T, E>,
  prefix = 'r',
): RecipeFunction<
  CleanVariants<T> & ExtractRecipeVariants<E>,
  ExtractBreakpointKeys<B> | ExtractRecipeBreakpoints<E>,
  R | ExtractRecipeResponsiveKeys<E>
> {
  type CombinedVariants = CleanVariants<T> & ExtractRecipeVariants<E>;
  type CombinedBreakpoints = ExtractBreakpointKeys<B> | ExtractRecipeBreakpoints<E>;
  type CombinedResponsive = R | ExtractRecipeResponsiveKeys<E>;

  const collected: OptionsCollector = {
    breakpoints: {},
    responsiveVariants: new Set<string>(),
    bases: [],
    variants: {},
    compoundVariants: [],
    defaultVariants: {},
  };

  // 1. Recursively collect extended options
  if (options.extend) {
    const extendArray = Array.isArray(options.extend) ? options.extend : [options.extend];
    for (const ext of extendArray) {
      collectExtendedOptions(ext, collected);
    }
  }

  // 2. Merge local options
  if (options.layer !== undefined) {
    collected.layer = options.layer;
  }

  if (options.breakpoints) {
    Object.assign(collected.breakpoints, options.breakpoints);
  }

  if (options.responsiveVariants) {
    for (const key of options.responsiveVariants) {
      collected.responsiveVariants.add(String(key));
    }
  }

  if (options.base) {
    if (Array.isArray(options.base)) {
      collected.bases.push(...options.base);
    } else {
      collected.bases.push(options.base);
    }
  }

  if (options.variants) {
    for (const vKey of Object.keys(options.variants)) {
      if (!collected.variants[vKey]) {
        collected.variants[vKey] = {};
      }
      for (const optKey of Object.keys(options.variants[vKey])) {
        collected.variants[vKey][optKey] =
          mergeStyleRules([collected.variants[vKey][optKey], options.variants[vKey][optKey]]) || {};
      }
    }
  }

  if (options.compoundVariants) {
    collected.compoundVariants.push(
      ...(options.compoundVariants as CompoundVariant<VariantDefinitions>[]),
    );
  }

  if (options.defaultVariants) {
    Object.assign(collected.defaultVariants, options.defaultVariants);
  }

  const {
    layer,
    breakpoints: mergedBreakpoints,
    responsiveVariants: mergedResponsiveVariants,
    bases,
    variants: mergedVariants,
    compoundVariants: mergedCompoundVariants,
    defaultVariants: mergedDefaultVariants,
  } = collected;

  // 3. Compile base classes upfront
  const mergedBaseRule = mergeStyleRules(bases);
  const baseClassName = mergedBaseRule
    ? style(mergedBaseRule, { prefix: `${prefix}-base`, layer }).className
    : undefined;

  // 4. Compile variant classes upfront
  const compiledVariants: Record<string, Record<string, string>> = {};
  for (const variantName of Object.keys(mergedVariants)) {
    compiledVariants[variantName] = {};
    const variantOptions = mergedVariants[variantName];
    if (variantOptions) {
      for (const optionName of Object.keys(variantOptions)) {
        const rule = variantOptions[optionName];
        if (rule) {
          compiledVariants[variantName][optionName] = style(rule, {
            prefix: `${prefix}-${variantName}-${optionName}`,
            layer,
          }).className;
        }
      }
    }
  }

  // 4b. Compile responsive variant classes in breakpoint order so later breakpoints win the cascade
  const compiledResponsiveVariants: Record<string, Record<string, Record<string, string>>> = {};
  const breakpointEntries = Object.entries(mergedBreakpoints);
  if (breakpointEntries.length > 0 && mergedResponsiveVariants.size > 0) {
    for (const [bpKey, bpQuery] of breakpointEntries) {
      const atRule = normalizeAtRule(bpQuery);
      for (const variantName of mergedResponsiveVariants) {
        const variantOptions = mergedVariants[variantName];
        if (!variantOptions) continue;
        if (!compiledResponsiveVariants[variantName]) {
          compiledResponsiveVariants[variantName] = {};
        }
        const bpOptionsMap: Record<string, string> = {};
        for (const optionName of Object.keys(variantOptions)) {
          const rule = variantOptions[optionName];
          if (rule) {
            bpOptionsMap[optionName] = style(rule, {
              prefix: `${prefix}-${variantName}-${bpKey}-${optionName}`,
              layer,
              atRule,
            }).className;
          }
        }
        compiledResponsiveVariants[variantName][bpKey] = bpOptionsMap;
      }
    }
  }

  // 5. Compile compound variant classes upfront
  const compiledCompoundVariants = mergedCompoundVariants.map((cv, index) => ({
    variants: cv.variants,
    className: style(cv.style, { prefix: `${prefix}-cv-${index}`, layer }).className,
  }));

  // 6. Delegate runtime lookup to runtimeRecipe()
  const runtimeCompoundVariants: RuntimeRecipeCompoundVariant[] = compiledCompoundVariants.map(
    (cv) => {
      const variantsRecord: Record<string, RuntimeVariantValue> = {};
      for (const [k, v] of Object.entries(cv.variants)) {
        if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
          variantsRecord[k] = v;
        }
      }
      return { variants: variantsRecord, className: cv.className };
    },
  );

  const runtimeDefaultVariants: Record<string, RuntimeVariantValue> = {};
  for (const [k, v] of Object.entries(mergedDefaultVariants)) {
    if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
      runtimeDefaultVariants[k] = v;
    }
  }

  const hasResponsiveVariants = Object.keys(compiledResponsiveVariants).length > 0;
  const runtimeConfig: RuntimeRecipeConfig = {
    ...(baseClassName !== undefined ? { base: baseClassName } : {}),
    variants: compiledVariants,
    ...(hasResponsiveVariants ? { responsiveVariants: compiledResponsiveVariants } : {}),
    ...(runtimeCompoundVariants.length > 0 ? { compoundVariants: runtimeCompoundVariants } : {}),
    ...(Object.keys(runtimeDefaultVariants).length > 0
      ? { defaultVariants: runtimeDefaultVariants }
      : {}),
  };

  const recipeFn = Object.assign(runtimeRecipe(runtimeConfig), {
    options: options as RecipeOptions<CombinedVariants, unknown, BreakpointsMap>,
  }) as unknown as RecipeFunction<CombinedVariants, CombinedBreakpoints, CombinedResponsive>;

  return attachMeta(recipeFn, {
    kind: 'recipe',
    config: runtimeConfig,
  });
}
