import { assignVars, createThemeContract } from './contract.js';
import { cx } from './cx.js';
import type { ResponsiveClassMap } from './types.js';

export { assignVars, createThemeContract, cx };

export interface RuntimeStyle {
  readonly className: string;
  toString(): string;
}

export interface RuntimeKeyframes {
  readonly name: string;
  toString(): string;
}

export interface RuntimeTheme {
  readonly className: string;
  readonly vars: Record<string, string>;
  toString(): string;
}

export type RuntimeVariantValue = string | number | boolean | null | undefined;

export type RuntimeVariantProp =
  | RuntimeVariantValue
  | Readonly<Record<string, RuntimeVariantValue>>;

export interface RuntimeRecipeCompoundVariant {
  readonly variants: Record<string, RuntimeVariantValue>;
  readonly className: string;
}

export interface RuntimeRecipeConfig {
  readonly base?: string;
  readonly variants: Record<string, Record<string, string>>;
  readonly responsiveVariants?: ResponsiveClassMap;
  readonly compoundVariants?: readonly RuntimeRecipeCompoundVariant[];
  readonly defaultVariants?: Record<string, RuntimeVariantValue>;
}

export interface RuntimeRecipeFn {
  (props?: Record<string, RuntimeVariantProp>): string;
  variants: () => string[];
  classNames: {
    base?: string;
    variants: Record<string, Record<string, string>>;
    responsiveVariants?: ResponsiveClassMap;
    compoundVariants: readonly RuntimeRecipeCompoundVariant[];
  };
  defaultVariants: Record<string, RuntimeVariantValue>;
}

function normalizeValue(value: string | number | boolean): string {
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }
  return String(value);
}

function isSet<T>(value: T | null | undefined): value is T {
  return value !== undefined && value !== null;
}

function isResponsiveObject(
  value: RuntimeVariantProp,
): value is Readonly<Record<string, RuntimeVariantValue>> {
  return typeof value === 'object' && value !== null;
}

/**
 * Lightweight runtime wrapper emitted by Cumulo build plugins for `style()` / `create()` calls.
 */
export function runtimeStyle(className: string): RuntimeStyle {
  return {
    className,
    toString(): string {
      return className;
    },
  };
}

/**
 * Lightweight runtime wrapper emitted by Cumulo build plugins for `keyframes()` calls.
 */
export function runtimeKeyframes(name: string): RuntimeKeyframes {
  return {
    name,
    toString(): string {
      return name;
    },
  };
}

/**
 * Lightweight runtime wrapper emitted by Cumulo build plugins for `createTheme()` calls.
 */
export function runtimeTheme(className: string, vars: Record<string, string>): RuntimeTheme {
  return {
    className,
    vars,
    toString(): string {
      return className;
    },
  };
}

/**
 * Lightweight runtime recipe resolver emitted by Cumulo build plugins for `recipe()` calls.
 * Contains only precomputed static class name lookups — no CSS compiler, hashing, or style objects.
 */
export function runtimeRecipe(config: RuntimeRecipeConfig): RuntimeRecipeFn {
  const {
    base,
    variants,
    responsiveVariants,
    compoundVariants = [],
    defaultVariants = {},
  } = config;
  const variantKeys = Object.keys(variants);

  const fn = (props?: Record<string, RuntimeVariantProp>): string => {
    const classes: (string | undefined)[] = [base];
    const mergedProps: Record<string, RuntimeVariantProp> = { ...defaultVariants };

    if (props) {
      for (const [key, val] of Object.entries(props)) {
        if (val !== undefined) {
          mergedProps[key] = val;
        }
      }
    }

    for (const variantName of variantKeys) {
      const propValue = mergedProps[variantName];
      if (propValue === undefined || propValue === null) {
        continue;
      }

      if (isResponsiveObject(propValue)) {
        // A partial responsive object falls back to the default variant below its first breakpoint.
        const initialVal = propValue.initial ?? defaultVariants[variantName];
        const initialClass = isSet(initialVal)
          ? variants[variantName]?.[normalizeValue(initialVal)]
          : undefined;
        classes.push(initialClass);

        for (const [bp, optionMap] of Object.entries(responsiveVariants?.[variantName] ?? {})) {
          const bpVal = propValue[bp];
          classes.push(isSet(bpVal) ? optionMap[normalizeValue(bpVal)] : undefined);
        }
      } else {
        classes.push(variants[variantName]?.[normalizeValue(propValue)]);
      }
    }

    for (const { variants: cvVariants, className } of compoundVariants) {
      const match = Object.entries(cvVariants).every(([key, expectedValue]) => {
        if (expectedValue === undefined || expectedValue === null) {
          return false;
        }
        const actualValue = mergedProps[key];
        // Compound variants match static values only; responsive objects never match.
        if (!isSet(actualValue) || isResponsiveObject(actualValue)) {
          return false;
        }
        return normalizeValue(actualValue) === normalizeValue(expectedValue);
      });

      if (match) {
        classes.push(className);
      }
    }

    return cx(...classes);
  };

  return Object.assign(fn, {
    variants: (): string[] => variantKeys,
    classNames: {
      base,
      variants,
      ...(responsiveVariants ? { responsiveVariants } : {}),
      compoundVariants,
    },
    defaultVariants,
  });
}
