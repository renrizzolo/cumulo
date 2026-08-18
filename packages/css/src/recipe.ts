import { style } from './create.js';
import { cx } from './cx.js';
import type { StyleRule } from './types.js';

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

export type RecipeExtendable =
  | RecipeFunction<VariantDefinitions>
  | RecipeOptions<VariantDefinitions, unknown>;

export type ExtractRecipeVariants<E> =
  E extends RecipeFunction<infer V>
    ? V
    : E extends RecipeOptions<infer V2, unknown>
      ? V2
      : E extends readonly (infer U)[]
        ? UnionToIntersection<ExtractRecipeVariants<U>>
        : {};

export interface RecipeOptions<T extends VariantDefinitions = VariantDefinitions, E = undefined> {
  base?: StyleRule | StyleRule[];
  extend?: E;
  variants?: T;
  compoundVariants?: CompoundVariant<T & ExtractRecipeVariants<E>>[];
  defaultVariants?: VariantSelection<T & ExtractRecipeVariants<E>>;
}

export interface RecipeFunction<T extends VariantDefinitions> {
  (options?: VariantSelection<T>): string;
  variants: () => (keyof T)[];
  options: RecipeOptions<T, unknown>;
  classNames: {
    base?: string;
    variants: {
      [K in keyof T]: {
        [V in keyof T[K]]: string;
      };
    };
    compoundVariants: Array<{
      variants: VariantSelection<T>;
      className: string;
    }>;
  };
}

export type RecipeVariants<T> = T extends RecipeFunction<infer V> ? VariantSelection<V> : never;

function normalizeValue(value: unknown): string {
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }
  return String(value);
}

function mergeStyleRules(rules: (StyleRule | undefined)[]): StyleRule | undefined {
  const defined = rules.filter((r): r is StyleRule => Boolean(r));
  if (defined.length === 0) return undefined;
  if (defined.length === 1) return defined[0];
  return Object.assign({}, ...defined);
}

interface OptionsCollector {
  bases: StyleRule[];
  variants: Record<string, Record<string, StyleRule>>;
  compoundVariants: CompoundVariant<VariantDefinitions>[];
  defaultVariants: Record<string, string | boolean | undefined>;
}

function collectExtendedOptions(ext: unknown, acc: OptionsCollector): void {
  if (!ext || (typeof ext !== 'object' && typeof ext !== 'function')) return;

  const extOpts =
    typeof ext === 'function' && 'options' in ext
      ? (ext as { options: RecipeOptions<VariantDefinitions, unknown> }).options
      : (ext as RecipeOptions<VariantDefinitions, unknown>);

  if (!extOpts) return;

  if (extOpts.extend) {
    const parentExts = Array.isArray(extOpts.extend) ? extOpts.extend : [extOpts.extend];
    for (const parent of parentExts) {
      collectExtendedOptions(parent, acc);
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
      acc.variants[vKey] = {
        ...acc.variants[vKey],
        ...extOpts.variants[vKey],
      };
    }
  }

  if (extOpts.compoundVariants) {
    acc.compoundVariants.push(
      ...(extOpts.compoundVariants as CompoundVariant<VariantDefinitions>[]),
    );
  }

  if (extOpts.defaultVariants) {
    Object.assign(acc.defaultVariants, extOpts.defaultVariants);
  }
}

/**
 * Creates a zero-runtime recipe/variants function.
 * Supports recursive extends of shared intent recipes and compiles all CSS upfront into static classes.
 */
export function recipe<T extends VariantDefinitions = VariantDefinitions, E = undefined>(
  options: RecipeOptions<T, E>,
  prefix = 'r',
): RecipeFunction<T & ExtractRecipeVariants<E>> {
  type CombinedVariants = T & ExtractRecipeVariants<E>;

  const collected: OptionsCollector = {
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
  if (options.base) {
    if (Array.isArray(options.base)) {
      collected.bases.push(...options.base);
    } else {
      collected.bases.push(options.base);
    }
  }

  if (options.variants) {
    for (const vKey of Object.keys(options.variants)) {
      collected.variants[vKey] = {
        ...collected.variants[vKey],
        ...options.variants[vKey],
      };
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
    bases,
    variants: mergedVariants,
    compoundVariants: mergedCompoundVariants,
    defaultVariants: mergedDefaultVariants,
  } = collected;

  // 3. Compile base classes upfront
  const mergedBaseRule = mergeStyleRules(bases);
  const baseClassName = mergedBaseRule
    ? style(mergedBaseRule, `${prefix}-base`).className
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
          compiledVariants[variantName][optionName] = style(
            rule,
            `${prefix}-${variantName}-${optionName}`,
          ).className;
        }
      }
    }
  }

  // 5. Compile compound variant classes upfront
  const compiledCompoundVariants = mergedCompoundVariants.map((cv, index) => ({
    variants: cv.variants,
    className: style(cv.style, `${prefix}-cv-${index}`).className,
  }));

  // 6. Zero-runtime resolver
  const recipeFn = ((props?: VariantSelection<CombinedVariants>) => {
    const classes: (string | undefined)[] = [baseClassName];
    const mergedProps: Record<string, unknown> = { ...mergedDefaultVariants, ...props };

    for (const variantName of Object.keys(mergedVariants)) {
      const propValue = mergedProps[variantName];
      if (propValue !== undefined && propValue !== null) {
        const normalized = normalizeValue(propValue);
        const variantClass = compiledVariants[variantName]?.[normalized];
        if (variantClass) {
          classes.push(variantClass);
        }
      }
    }

    for (const { variants: cvVariants, className } of compiledCompoundVariants) {
      const match = Object.entries(cvVariants).every(([key, expectedValue]) => {
        const actualValue = mergedProps[key];
        if (actualValue === undefined || actualValue === null) {
          return false;
        }
        return normalizeValue(actualValue) === normalizeValue(expectedValue);
      });

      if (match) {
        classes.push(className);
      }
    }

    return cx(...classes);
  }) as RecipeFunction<CombinedVariants>;

  recipeFn.variants = () => Object.keys(mergedVariants) as (keyof CombinedVariants)[];
  recipeFn.options = options as RecipeOptions<CombinedVariants, unknown>;
  recipeFn.classNames = {
    base: baseClassName,
    variants: compiledVariants as RecipeFunction<CombinedVariants>['classNames']['variants'],
    compoundVariants:
      compiledCompoundVariants as RecipeFunction<CombinedVariants>['classNames']['compoundVariants'],
  };

  return recipeFn;
}
