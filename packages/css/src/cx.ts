import type { ClassValue, CompiledStyle, CreatedTheme } from './types.js';

function isCompiledStyleOrTheme(val: object): val is CompiledStyle | CreatedTheme {
  return 'className' in val && typeof val.className === 'string';
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
    for (const [key, active] of Object.entries(value)) {
      if (active) {
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
