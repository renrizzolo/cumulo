import {
  getBreakpoints,
  normalizeBreakpointQuery,
  type BreakpointMap,
  type RegisteredBreakpointKey,
} from './breakpoints.js';
import { compileResponsiveStyleRule, style } from './create.js';
import { attachMeta } from './meta.js';
import {
  runtimeRecipe,
  type RuntimeRecipeCompoundVariant,
  type RuntimeRecipeConfig,
  type RuntimeScalarVariantValue,
  type RuntimeVariantValue,
} from './runtime.js';
import { sheet } from './sheet.js';
import type { CssLayer, StyleRule } from './types.js';

type VariantDefinitions = Record<string, Record<string, StyleRule>>;

type BooleanMap<T> = T extends 'true' | 'false' ? boolean | T : T;

/**
 * A variant prop value that accepts either a scalar value or a breakpoint-keyed responsive object
 * (with optional `initial` fallback).
 */
export type ResponsiveValue<Value, BP extends string = RegisteredBreakpointKey> =
  | Value
  | { [K in 'initial' | BP]?: Value };

/**
 * Configuration specifying which variants in a recipe generate responsive CSS rules.
 *
 * - Array form: `['gap', 'direction']` enables all active breakpoints for listed variants.
 * - Object form: `{ gap: ['sm', 'md'], direction: true }` scopes individual variants to specific breakpoints.
 */
export type ResponsiveVariantsConfig<
  T extends VariantDefinitions,
  BP extends string = RegisteredBreakpointKey,
> =
  | readonly (keyof T & string)[]
  | {
      readonly [K in keyof T & string]?: true | readonly BP[];
    };

type ResolvedBreakpointKey<B> = B extends BreakpointMap
  ? keyof B & string
  : RegisteredBreakpointKey;

type BreakpointsForVariant<
  K extends PropertyKey,
  R,
  BP extends string,
> = R extends readonly (infer Keys)[]
  ? K extends Keys
    ? BP
    : never
  : R extends Record<string, unknown>
    ? K extends keyof R
      ? R[K] extends true
        ? BP
        : R[K] extends readonly (infer SubBP extends string)[]
          ? SubBP & BP
          : never
      : never
    : never;

export type ScalarVariantSelection<T extends VariantDefinitions> = {
  [K in keyof T]?: BooleanMap<keyof T[K]> | undefined;
};

export type VariantSelection<
  T extends VariantDefinitions,
  R = undefined,
  BP extends string = RegisteredBreakpointKey,
> = {
  [K in keyof T]?: BreakpointsForVariant<K, R, BP> extends never
    ? BooleanMap<keyof T[K]> | undefined
    : ResponsiveValue<BooleanMap<keyof T[K]>, BreakpointsForVariant<K, R, BP>> | undefined;
};

export type CompoundVariant<T extends VariantDefinitions> = {
  variants: ScalarVariantSelection<T>;
  style: StyleRule;
};

export type UnionToIntersection<U> = (U extends unknown ? (k: U) => void : never) extends (
  k: infer I,
) => void
  ? I
  : never;

export type ExtractRecipeVariants<E> =
  E extends RecipeFunction<infer V, unknown, string>
    ? V
    : E extends RecipeOptions<infer V2, unknown, BreakpointMap | undefined, unknown>
      ? V2
      : E extends readonly (infer U)[]
        ? UnionToIntersection<ExtractRecipeVariants<U>>
        : {};

export type ExtractRecipeResponsiveVariants<E> =
  E extends RecipeFunction<VariantDefinitions, infer R, string>
    ? R
    : E extends readonly (infer U)[]
      ? ExtractRecipeResponsiveVariants<U>
      : undefined;

type CleanVariants<T extends VariantDefinitions> = string extends keyof T ? {} : T;

type MergedVariants<T extends VariantDefinitions, E> = CleanVariants<T> & ExtractRecipeVariants<E>;

export type RecipeOptionsValidation<T extends VariantDefinitions, E> = keyof T extends never
  ? E extends undefined
    ? 'Error: recipe() requires at least one of `variants` or `extend`. Use style() for static styles.'
    : unknown
  : unknown;

export interface RecipeOptions<
  T extends VariantDefinitions = {},
  E = undefined,
  B extends BreakpointMap | undefined = undefined,
  R = undefined,
> {
  /** Optional CSS cascade layer name (e.g. `'components'`). */
  layer?: CssLayer;
  base?: StyleRule | StyleRule[];
  extend?: E;
  variants?: T;
  /**
   * Optional local breakpoint / custom container query map for this recipe.
   * When omitted, uses the active global breakpoints registered via `configureBreakpoints()`
   * or bundler plugins (defaulting to `DEFAULT_BREAKPOINTS`).
   */
  breakpoints?: B;
  /**
   * Opt-in list or per-variant map of variants that accept responsive objects
   * (e.g. `['gap', 'direction']` or `{ gap: ['sm', 'md'], direction: true }`).
   */
  responsiveVariants?: R & ResponsiveVariantsConfig<MergedVariants<T, E>, ResolvedBreakpointKey<B>>;
  compoundVariants?: CompoundVariant<MergedVariants<T, E>>[];
  defaultVariants?: VariantSelection<
    MergedVariants<T, E>,
    R | ExtractRecipeResponsiveVariants<E>,
    ResolvedBreakpointKey<B>
  >;
}

/**
 * Untyped, normalized shape of the options a recipe was created with.
 * Stored on the recipe function so other recipes can `extend` it.
 */
export interface RecipeDefinition {
  layer?: CssLayer;
  base?: StyleRule | StyleRule[];
  extend?: unknown;
  variants?: VariantDefinitions;
  breakpoints?: BreakpointMap;
  responsiveVariants?:
    | readonly string[]
    | Readonly<Record<string, true | readonly string[] | undefined>>;
  compoundVariants?: CompoundVariant<VariantDefinitions>[];
  defaultVariants?: Record<string, RuntimeVariantValue>;
}

export interface RecipeFunction<
  T extends VariantDefinitions = {},
  R = undefined,
  BP extends string = RegisteredBreakpointKey,
> {
  (options?: VariantSelection<T, R, BP>): string;
  variants: () => (keyof T)[];
  options: RecipeDefinition;
  classNames: {
    base?: string;
    variants: {
      [K in keyof T]: {
        [V in keyof T[K]]: string;
      };
    };
    responsive?: Record<string, Record<string, Record<string, string>>>;
    compoundVariants: ReadonlyArray<{
      variants: ScalarVariantSelection<T>;
      className: string;
    }>;
  };
}

export type RecipeVariants<T> =
  T extends RecipeFunction<infer V, infer R, infer BP> ? VariantSelection<V, R, BP> : never;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
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
  layer?: CssLayer;
  bases: StyleRule[];
  variants: Record<string, Record<string, StyleRule>>;
  breakpoints?: BreakpointMap;
  responsiveVariants: Map<string, true | readonly string[]>;
  compoundVariants: CompoundVariant<VariantDefinitions>[];
  defaultVariants: Record<string, RuntimeVariantValue>;
}

function isRecipeFunction(value: unknown): value is { options: RecipeDefinition } {
  return typeof value === 'function' && 'options' in value && isPlainObject(value.options);
}

function isRecipeDefinition(value: unknown): value is RecipeDefinition {
  return isPlainObject(value);
}

function mergeResponsiveConfig(
  target: Map<string, true | readonly string[]>,
  config: RecipeDefinition['responsiveVariants'],
): void {
  if (!config) return;
  if (Array.isArray(config)) {
    for (const key of config) {
      if (typeof key === 'string') {
        target.set(key, true);
      }
    }
    return;
  }
  if (isPlainObject(config)) {
    for (const [key, value] of Object.entries(config)) {
      if (value === true) {
        target.set(key, true);
      } else if (Array.isArray(value)) {
        const bps = value.filter((item): item is string => typeof item === 'string');
        target.set(key, bps);
      }
    }
  }
}

/**
 * Collects a definition (or compiled recipe function) into the accumulator, depth-first:
 * parents (`extend`) are collected before the definition itself so later sources override earlier ones.
 */
function collectSource(source: unknown, acc: OptionsCollector): void {
  const definition = isRecipeFunction(source)
    ? source.options
    : isRecipeDefinition(source)
      ? source
      : undefined;
  if (!definition) return;

  if (definition.extend) {
    const parents = Array.isArray(definition.extend) ? definition.extend : [definition.extend];
    for (const parent of parents) {
      collectSource(parent, acc);
    }
  }

  if (definition.layer !== undefined) {
    acc.layer = definition.layer;
  }

  if (definition.breakpoints) {
    acc.breakpoints = definition.breakpoints;
  }

  if (definition.base) {
    acc.bases.push(...(Array.isArray(definition.base) ? definition.base : [definition.base]));
  }

  for (const [variantName, options] of Object.entries(definition.variants ?? {})) {
    const merged = (acc.variants[variantName] ??= {});
    for (const [optionName, rule] of Object.entries(options)) {
      merged[optionName] = mergeStyleRules([merged[optionName], rule]) ?? {};
    }
  }

  mergeResponsiveConfig(acc.responsiveVariants, definition.responsiveVariants);

  acc.compoundVariants.push(...(definition.compoundVariants ?? []));
  if (definition.defaultVariants) {
    Object.assign(acc.defaultVariants, definition.defaultVariants);
  }
}

/** Compiles each rule of an option map into a class name: `option -> className`. */
function compileOptionClasses(
  rules: Record<string, StyleRule>,
  classPrefix: string,
  layer: CssLayer | undefined,
): Record<string, string> {
  const classNames: Record<string, string> = {};
  for (const [optionName, rule] of Object.entries(rules)) {
    classNames[optionName] = style(rule, {
      prefix: `${classPrefix}-${optionName}`,
      layer,
    }).className;
  }
  return classNames;
}

function toScalarRuntimeValues(
  record: Record<string, unknown>,
): Record<string, RuntimeScalarVariantValue> {
  const out: Record<string, RuntimeScalarVariantValue> = {};
  for (const [key, value] of Object.entries(record)) {
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      out[key] = value;
    }
  }
  return out;
}

function toRuntimeDefaultValues(
  record: Record<string, RuntimeVariantValue>,
): Record<string, RuntimeVariantValue> {
  const out: Record<string, RuntimeVariantValue> = {};
  for (const [key, value] of Object.entries(record)) {
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      out[key] = value;
    } else if (isPlainObject(value)) {
      const responsiveDefault = toScalarRuntimeValues(value);
      if (Object.keys(responsiveDefault).length > 0) {
        out[key] = responsiveDefault;
      }
    }
  }
  return out;
}

/**
 * Creates a zero-runtime recipe/variants function.
 * Supports recursive extends, CSS cascade layers, and opt-in responsive variants,
 * compiling all CSS upfront into static deduplicated classes.
 */
export function recipe<
  T extends VariantDefinitions = {},
  E = undefined,
  const B extends BreakpointMap | undefined = undefined,
  const R extends
    | ResponsiveVariantsConfig<MergedVariants<T, E>, ResolvedBreakpointKey<B>>
    | undefined = undefined,
>(
  options: RecipeOptions<T, E, B, R> & RecipeOptionsValidation<T, E>,
  prefix?: string,
): RecipeFunction<
  MergedVariants<T, E>,
  R | ExtractRecipeResponsiveVariants<E>,
  ResolvedBreakpointKey<B>
>;
export function recipe(options: object, prefix = 'r'): object {
  return compileRecipe(options, prefix);
}

function compileRecipe(options: object, prefix = 'r'): object {
  if (!isRecipeDefinition(options)) {
    throw new TypeError('recipe() expects an options object.');
  }
  const collected: OptionsCollector = {
    bases: [],
    variants: {},
    responsiveVariants: new Map(),
    compoundVariants: [],
    defaultVariants: {},
  };
  collectSource(options, collected);

  const { layer, bases, variants, compoundVariants } = collected;

  // 1. Base class
  const mergedBaseRule = mergeStyleRules(bases);
  const baseClassName = mergedBaseRule
    ? style(mergedBaseRule, { prefix: `${prefix}-base`, layer }).className
    : undefined;

  // 2. Variant classes (compiled with child prefix so base -> variants -> compoundVariants
  //    cascade order stays self-contained within each CSS chunk)
  const compiledVariants: Record<string, Record<string, string>> = {};
  for (const [variantName, rules] of Object.entries(variants)) {
    compiledVariants[variantName] = compileOptionClasses(rules, `${prefix}-${variantName}`, layer);
  }

  // 3. Responsive variant classes (opt-in only, prefix-independent content-hashed for cross-recipe dedupe)
  const compiledResponsive: Record<string, Record<string, Record<string, string>>> = {};
  if (collected.responsiveVariants.size > 0) {
    const activeBreakpoints = collected.breakpoints ?? getBreakpoints();
    const activeBreakpointEntries = Object.entries(activeBreakpoints);
    if (activeBreakpointEntries.length > 0) {
      sheet.registerConditionOrder(activeBreakpointEntries.map(([bpKey]) => bpKey));
    }

    for (const [variantName, bpSelection] of collected.responsiveVariants) {
      const variantRules = variants[variantName];
      if (!variantRules) continue;

      const allowedSet = bpSelection === true ? null : new Set(bpSelection);
      const variantResponsiveMap: Record<string, Record<string, string>> = {};

      for (const [bpKey, rawQuery] of activeBreakpointEntries) {
        if (allowedSet && !allowedSet.has(bpKey)) {
          continue;
        }
        const atRule = normalizeBreakpointQuery(rawQuery);
        const bpClassMap: Record<string, string> = {};

        for (const [optionName, rule] of Object.entries(variantRules)) {
          const className = compileResponsiveStyleRule(rule, {
            conditionKey: bpKey,
            atRule,
            layer,
            variantName,
            optionName,
          });
          if (className) {
            bpClassMap[optionName] = className;
          }
        }

        if (Object.keys(bpClassMap).length > 0) {
          variantResponsiveMap[bpKey] = bpClassMap;
        }
      }

      if (Object.keys(variantResponsiveMap).length > 0) {
        compiledResponsive[variantName] = variantResponsiveMap;
      }
    }
  }

  // 4. Compound variant classes
  const runtimeCompoundVariants: RuntimeRecipeCompoundVariant[] = compoundVariants.map(
    (cv, index) => ({
      variants: toScalarRuntimeValues(cv.variants),
      className: style(cv.style, { prefix: `${prefix}-cv-${index}`, layer }).className,
    }),
  );

  const runtimeDefaultVariants = toRuntimeDefaultValues(collected.defaultVariants);

  // 5. Delegate runtime lookup to runtimeRecipe()
  const runtimeConfig: RuntimeRecipeConfig = {
    ...(baseClassName !== undefined ? { base: baseClassName } : {}),
    variants: compiledVariants,
    ...(Object.keys(compiledResponsive).length > 0 ? { responsive: compiledResponsive } : {}),
    ...(runtimeCompoundVariants.length > 0 ? { compoundVariants: runtimeCompoundVariants } : {}),
    ...(Object.keys(runtimeDefaultVariants).length > 0
      ? { defaultVariants: runtimeDefaultVariants }
      : {}),
  };

  const recipeFn = Object.assign(runtimeRecipe(runtimeConfig), { options });

  return attachMeta(recipeFn, {
    kind: 'recipe',
    config: runtimeConfig,
  });
}

/**
 * Creates a `recipe` factory bound to a custom breakpoint or container-query map without
 * mutating the global breakpoint registry.
 */
export function createRecipe<const B extends BreakpointMap>(breakpoints: B) {
  function scopedRecipe<
    T extends VariantDefinitions = {},
    E = undefined,
    const R extends ResponsiveVariantsConfig<MergedVariants<T, E>, keyof B & string> | undefined =
      undefined,
  >(
    options: Omit<RecipeOptions<T, E, B, R>, 'breakpoints'> & RecipeOptionsValidation<T, E>,
    prefix?: string,
  ): RecipeFunction<MergedVariants<T, E>, R | ExtractRecipeResponsiveVariants<E>, keyof B & string>;
  function scopedRecipe(options: object, prefix = 'r'): object {
    return compileRecipe({ ...options, breakpoints }, prefix);
  }
  return scopedRecipe;
}
