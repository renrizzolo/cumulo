import { assignVars, createThemeContract } from './contract.js';
import { cx } from './cx.js';

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
  readonly responsiveVariants?: Record<string, Record<string, Record<string, string>>>;
  readonly compoundVariants?: readonly RuntimeRecipeCompoundVariant[];
  readonly defaultVariants?: Record<string, RuntimeVariantValue>;
}

export interface RuntimeRecipeFn {
  (props?: Record<string, RuntimeVariantProp>): string;
  variants: () => string[];
  classNames: {
    base?: string;
    variants: Record<string, Record<string, string>>;
    responsiveVariants?: Record<string, Record<string, Record<string, string>>>;
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
        const initialVal = propValue.initial;
        if (initialVal !== undefined && initialVal !== null) {
          const initialClass = variants[variantName]?.[normalizeValue(initialVal)];
          if (initialClass) {
            classes.push(initialClass);
          }
        }
        const bpMap = responsiveVariants?.[variantName];
        if (bpMap) {
          for (const [bp, optionMap] of Object.entries(bpMap)) {
            const bpVal = propValue[bp];
            if (bpVal !== undefined && bpVal !== null) {
              const bpClass = optionMap[normalizeValue(bpVal)];
              if (bpClass) {
                classes.push(bpClass);
              }
            }
          }
        }
      } else {
        const variantClass = variants[variantName]?.[normalizeValue(propValue)];
        if (variantClass) {
          classes.push(variantClass);
        }
      }
    }

    for (const { variants: cvVariants, className } of compoundVariants) {
      const match = Object.entries(cvVariants).every(([key, expectedValue]) => {
        if (expectedValue === undefined || expectedValue === null) {
          return false;
        }
        const rawActual = mergedProps[key];
        const actualValue = isResponsiveObject(rawActual) ? rawActual.initial : rawActual;
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
