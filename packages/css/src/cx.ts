import type { ClassValue, CompiledStyle, CreatedTheme, CSSProperties } from './types.js';

function isCompiledStyleOrTheme(val: object): val is CompiledStyle | CreatedTheme {
  return 'className' in val && typeof (val as { className: unknown }).className === 'string';
}

function hasStyleProp(val: object): val is { style?: CSSProperties } {
  return 'style' in val && !('className' in val);
}

function toClassName(value: ClassValue): string {
  if (!value) return '';

  if (typeof value === 'string' || typeof value === 'number') {
    return String(value);
  }

  if (typeof value === 'object') {
    if (Array.isArray(value)) {
      return value.map(toClassName).filter(Boolean).join(' ');
    }

    if (isCompiledStyleOrTheme(value)) {
      return value.className;
    }

    const classes: string[] = [];
    const record = value as Record<string, boolean | undefined | null>;
    for (const key of Object.keys(record)) {
      if (record[key]) {
        classes.push(key);
      }
    }
    return classes.join(' ');
  }

  return '';
}

/**
 * Merges class names, compiled styles, themes, and conditional objects.
 */
export function cx(...inputs: ClassValue[]): string {
  const result: string[] = [];
  for (const input of inputs) {
    const cls = toClassName(input);
    if (cls) {
      result.push(cls);
    }
  }
  return result.join(' ');
}

/**
 * Merges styles and returns a JSX-friendly props object `{ className, style }`.
 */
export function props(...inputs: (ClassValue | { style?: CSSProperties })[]): {
  className: string;
  style?: CSSProperties;
} {
  const classInputs: ClassValue[] = [];
  let inlineStyle: CSSProperties | undefined;

  for (const input of inputs) {
    if (input && typeof input === 'object' && hasStyleProp(input) && input.style) {
      inlineStyle = { ...inlineStyle, ...input.style };
    } else {
      classInputs.push(input as ClassValue);
    }
  }

  const className = cx(...classInputs);
  return {
    className,
    ...(inlineStyle ? { style: inlineStyle } : {}),
  };
}
