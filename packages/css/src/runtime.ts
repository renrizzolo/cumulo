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

export interface RuntimeRecipeCompoundVariant {
  readonly variants: Record<string, string | boolean | undefined>;
  readonly className: string;
}

export interface RuntimeRecipeConfig {
  readonly base?: string;
  readonly variants: Record<string, Record<string, string>>;
  readonly compoundVariants?: readonly RuntimeRecipeCompoundVariant[];
  readonly defaultVariants?: Record<string, string | boolean | undefined>;
}

export interface RuntimeRecipeFn {
  (props?: Record<string, string | boolean | undefined>): string;
  variants: () => string[];
  classNames: {
    base?: string;
    variants: Record<string, Record<string, string>>;
    compoundVariants: readonly RuntimeRecipeCompoundVariant[];
  };
  defaultVariants: Record<string, string | boolean | undefined>;
}

function normalizeValue(value: string | boolean): string {
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
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
  const { base, variants, compoundVariants = [], defaultVariants = {} } = config;
  const variantKeys = Object.keys(variants);

  const fn = (props?: Record<string, string | boolean | undefined>): string => {
    const classes: (string | undefined)[] = [base];
    const mergedProps: Record<string, string | boolean | undefined> = { ...defaultVariants };

    if (props) {
      for (const [key, val] of Object.entries(props)) {
        if (val !== undefined) {
          mergedProps[key] = val;
        }
      }
    }

    for (const variantName of variantKeys) {
      const propValue = mergedProps[variantName];
      if (propValue !== undefined) {
        const variantClass = variants[variantName]?.[normalizeValue(propValue)];
        if (variantClass) {
          classes.push(variantClass);
        }
      }
    }

    for (const { variants: cvVariants, className } of compoundVariants) {
      const match = Object.entries(cvVariants).every(([key, expectedValue]) => {
        if (expectedValue === undefined) {
          return false;
        }
        const actualValue = mergedProps[key];
        if (actualValue === undefined) {
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
      compoundVariants,
    },
    defaultVariants,
  });
}
