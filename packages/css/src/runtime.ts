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

export type RuntimeScalarVariantValue = string | number | boolean | null | undefined;
export type RuntimeResponsiveVariantValue = Readonly<Record<string, RuntimeScalarVariantValue>>;
export type RuntimeVariantValue = RuntimeScalarVariantValue | RuntimeResponsiveVariantValue;

export interface RuntimeRecipeCompoundVariant {
  readonly variants: Record<string, RuntimeScalarVariantValue>;
  readonly className: string;
}

export interface RuntimeRecipeConfig {
  readonly base?: string;
  readonly variants: Record<string, Record<string, string>>;
  /**
   * Precomputed responsive class lookup map:
   * `responsive[variantName][conditionKey][optionName] = className`
   */
  readonly responsive?: Record<string, Record<string, Record<string, string>>>;
  readonly compoundVariants?: readonly RuntimeRecipeCompoundVariant[];
  readonly defaultVariants?: Record<string, RuntimeVariantValue>;
}

export interface RuntimeRecipeFn {
  (props?: Record<string, RuntimeVariantValue>): string;
  variants: () => string[];
  classNames: {
    base?: string;
    variants: Record<string, Record<string, string>>;
    responsive?: Record<string, Record<string, Record<string, string>>>;
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

function isResponsiveMap(value: RuntimeVariantValue): value is RuntimeResponsiveVariantValue {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function extractScalarValue(value: RuntimeVariantValue): RuntimeScalarVariantValue {
  if (isResponsiveMap(value)) {
    return value.initial;
  }
  return value;
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
  const { base, variants, responsive, compoundVariants = [], defaultVariants = {} } = config;
  const variantKeys = Object.keys(variants);

  const fn = (props?: Record<string, RuntimeVariantValue>): string => {
    const classes: (string | undefined)[] = [base];
    const mergedProps: Record<string, RuntimeVariantValue> = { ...defaultVariants };

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

      if (isResponsiveMap(propValue)) {
        const defaultInitial = extractScalarValue(defaultVariants[variantName]);
        const initialValue = propValue.initial !== undefined ? propValue.initial : defaultInitial;
        if (initialValue !== undefined && initialValue !== null) {
          const initialClass = variants[variantName]?.[normalizeValue(initialValue)];
          if (initialClass) {
            classes.push(initialClass);
          }
        }

        const responsiveVariantMap = responsive?.[variantName];
        if (responsiveVariantMap) {
          for (const [bpKey, bpVal] of Object.entries(propValue)) {
            if (bpKey === 'initial' || bpVal === undefined || bpVal === null) {
              continue;
            }
            const bpClass = responsiveVariantMap[bpKey]?.[normalizeValue(bpVal)];
            if (bpClass) {
              classes.push(bpClass);
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
        const actualValue = isResponsiveMap(rawActual)
          ? rawActual.initial !== undefined
            ? rawActual.initial
            : extractScalarValue(defaultVariants[key])
          : rawActual;
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
    variants: () => variantKeys,
    classNames: {
      base,
      variants,
      ...(responsive ? { responsive } : {}),
      compoundVariants,
    },
    defaultVariants,
  });
}
