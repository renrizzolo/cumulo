import type { ClassValue, CompiledStyle, CreatedTheme, CSSProperties } from './types.js';

function toClassName(value: ClassValue): string {
  if (!value) return '';

  if (typeof value === 'string' || typeof value === 'number') {
    return String(value);
  }

  if (typeof value === 'object') {
    if (Array.isArray(value)) {
      return value.map(toClassName).filter(Boolean).join(' ');
    }

    if (
      'className' in value &&
      typeof (value as CompiledStyle | CreatedTheme).className === 'string'
    ) {
      return (value as CompiledStyle | CreatedTheme).className;
    }

    const classes: string[] = [];
    for (const key of Object.keys(value)) {
      if ((value as Record<string, boolean | undefined | null>)[key]) {
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
    if (
      input &&
      typeof input === 'object' &&
      'style' in input &&
      !('className' in input) &&
      (input as any).style
    ) {
      inlineStyle = { ...inlineStyle, ...(input as any).style };
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
