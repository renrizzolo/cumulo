import { style } from './create.js';
import { attachMeta } from './meta.js';
import {
  runtimeRecipe,
  type RuntimeRecipeCompoundVariant,
  type RuntimeRecipeConfig,
  type RuntimeVariantValue,
} from './runtime.js';
import type { CssLayer, StyleRule } from './types.js';

type VariantDefinitions = Record<string, Record<string, StyleRule>>;

type BooleanMap<T> = T extends 'true' | 'false' ? boolean | T : T;

export type VariantSelection<T extends VariantDefinitions> = {
  [K in keyof T]?: BooleanMap<keyof T[K]> | undefined;
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
  E extends RecipeFunction<infer V>
    ? V
    : E extends RecipeOptions<infer V2, unknown>
      ? V2
      : E extends readonly (infer U)[]
        ? UnionToIntersection<ExtractRecipeVariants<U>>
        : {};

type CleanVariants<T extends VariantDefinitions> = string extends keyof T ? {} : T;

export type RecipeOptionsValidation<T extends VariantDefinitions, E> = keyof T extends never
  ? E extends undefined
    ? 'Error: recipe() requires at least one of `variants` or `extend`. Use style() for static styles.'
    : unknown
  : unknown;

export interface RecipeOptions<T extends VariantDefinitions = {}, E = undefined> {
  /** Optional CSS cascade layer name (e.g. `'components'`). */
  layer?: CssLayer;
  base?: StyleRule | StyleRule[];
  extend?: E;
  variants?: T;
  compoundVariants?: CompoundVariant<CleanVariants<T> & ExtractRecipeVariants<E>>[];
  defaultVariants?: VariantSelection<CleanVariants<T> & ExtractRecipeVariants<E>>;
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
  compoundVariants?: CompoundVariant<VariantDefinitions>[];
  defaultVariants?: Record<string, string | boolean | undefined>;
}

export interface RecipeFunction<T extends VariantDefinitions = {}> {
  (options?: VariantSelection<T>): string;
  variants: () => (keyof T)[];
  options: RecipeDefinition;
  classNames: {
    base?: string;
    variants: {
      [K in keyof T]: {
        [V in keyof T[K]]: string;
      };
    };
    compoundVariants: ReadonlyArray<{
      variants: VariantSelection<T>;
      className: string;
    }>;
  };
}

export type RecipeVariants<T> = T extends RecipeFunction<infer V> ? VariantSelection<V> : never;

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
  compoundVariants: CompoundVariant<VariantDefinitions>[];
  defaultVariants: Record<string, string | boolean | undefined>;
}

function isRecipeFunction(value: unknown): value is { options: RecipeDefinition } {
  return typeof value === 'function' && 'options' in value && isPlainObject(value.options);
}

function isRecipeDefinition(value: unknown): value is RecipeDefinition {
  return isPlainObject(value);
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

  if (definition.base) {
    acc.bases.push(...(Array.isArray(definition.base) ? definition.base : [definition.base]));
  }

  for (const [variantName, options] of Object.entries(definition.variants ?? {})) {
    const merged = (acc.variants[variantName] ??= {});
    for (const [optionName, rule] of Object.entries(options)) {
      merged[optionName] = mergeStyleRules([merged[optionName], rule]) ?? {};
    }
  }

  acc.compoundVariants.push(...(definition.compoundVariants ?? []));
  Object.assign(acc.defaultVariants, definition.defaultVariants);
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

function toRuntimeValues(
  record: Record<string, string | boolean | number | undefined | object>,
): Record<string, RuntimeVariantValue> {
  const out: Record<string, RuntimeVariantValue> = {};
  for (const [key, value] of Object.entries(record)) {
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      out[key] = value;
    }
  }
  return out;
}

/**
 * Creates a zero-runtime recipe/variants function.
 * Supports recursive extends and CSS cascade layers, compiling all CSS upfront into static classes.
 */
export function recipe<T extends VariantDefinitions = {}, E = undefined>(
  options: RecipeOptions<T, E> & RecipeOptionsValidation<T, E>,
  prefix?: string,
): RecipeFunction<CleanVariants<T> & ExtractRecipeVariants<E>>;
export function recipe(options: object, prefix = 'r'): object {
  if (!isRecipeDefinition(options)) {
    throw new TypeError('recipe() expects an options object.');
  }
  const collected: OptionsCollector = {
    bases: [],
    variants: {},
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

  // 3. Compound variant classes
  const runtimeCompoundVariants: RuntimeRecipeCompoundVariant[] = compoundVariants.map(
    (cv, index) => ({
      variants: toRuntimeValues(cv.variants),
      className: style(cv.style, { prefix: `${prefix}-cv-${index}`, layer }).className,
    }),
  );

  const runtimeDefaultVariants = toRuntimeValues(collected.defaultVariants);

  // 4. Delegate runtime lookup to runtimeRecipe()
  const runtimeConfig: RuntimeRecipeConfig = {
    ...(baseClassName !== undefined ? { base: baseClassName } : {}),
    variants: compiledVariants,
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
