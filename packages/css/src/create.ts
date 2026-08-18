import { hash } from './hash.js';
import { sheet } from './sheet.js';
import type {
  CSSProperties,
  StyleRule,
  StyleDefinitions,
  CompiledStyle,
  CompiledStyles,
} from './types.js';

const UNITLESS_PROPERTIES = new Set([
  'animationIterationCount',
  'borderImageOutset',
  'borderImageSlice',
  'borderImageWidth',
  'boxFlex',
  'boxFlexGroup',
  'boxOrdinalGroup',
  'columnCount',
  'columns',
  'flex',
  'flexGrow',
  'flexPositive',
  'flexShrink',
  'flexNegative',
  'flexOrder',
  'gridRow',
  'gridRowEnd',
  'gridRowSpan',
  'gridRowStart',
  'gridColumn',
  'gridColumnEnd',
  'gridColumnSpan',
  'gridColumnStart',
  'fontWeight',
  'lineClamp',
  'lineHeight',
  'opacity',
  'order',
  'orphans',
  'tabSize',
  'widows',
  'zIndex',
  'zoom',
  'fillOpacity',
  'floodOpacity',
  'stopOpacity',
  'strokeDasharray',
  'strokeDashoffset',
  'strokeMiterlimit',
  'strokeOpacity',
  'strokeWidth',
]);

export function camelToKebab(str: string): string {
  if (str.startsWith('--')) return str;
  return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
}

function formatValue(prop: string, value: any): string {
  if (typeof value === 'number' && value !== 0 && !UNITLESS_PROPERTIES.has(prop)) {
    return `${value}px`;
  }
  return String(value);
}

function serializeProperties(properties: CSSProperties): string {
  const declarations: string[] = [];
  for (const key of Object.keys(properties)) {
    const val = (properties as any)[key];
    if (val !== undefined && val !== null && typeof val !== 'object') {
      declarations.push(`${camelToKebab(key)}:${formatValue(key, val)};`);
    }
  }
  return declarations.join('');
}

export function compileStyleRule(
  rule: StyleRule,
  className: string,
): { cssRules: string[]; className: string } {
  const cssRules: string[] = [];
  const baseDecls = serializeProperties(rule);
  if (baseDecls) {
    cssRules.push(`.${className}{${baseDecls}}`);
  }

  // Handle pseudo-classes & pseudo-elements directly on rule
  for (const key of Object.keys(rule)) {
    if (key.startsWith(':') || key.startsWith('&')) {
      const subRule = (rule as any)[key];
      if (typeof subRule === 'object' && subRule !== null) {
        const decls = serializeProperties(subRule);
        if (decls) {
          const selector = key.startsWith('&')
            ? key.replace(/&/g, `.${className}`)
            : `.${className}${key}`;
          cssRules.push(`${selector}{${decls}}`);
        }
      }
    }
  }

  // Handle selectors map
  if (rule.selectors) {
    for (const [selectorPattern, subProps] of Object.entries(rule.selectors)) {
      const decls = serializeProperties(subProps);
      if (decls) {
        const selector = selectorPattern.replace(/&/g, `.${className}`);
        cssRules.push(`${selector}{${decls}}`);
      }
    }
  }

  // Handle @media queries
  if (rule['@media']) {
    for (const [query, mediaProps] of Object.entries(rule['@media'])) {
      const decls = serializeProperties(mediaProps);
      if (decls) {
        const cleanQuery = query.startsWith('@media') ? query : `@media ${query}`;
        cssRules.push(`${cleanQuery}{.${className}{${decls}}}`);
      }
    }
  }

  // Handle @supports queries
  if (rule['@supports']) {
    for (const [query, supportsProps] of Object.entries(rule['@supports'])) {
      const decls = serializeProperties(supportsProps);
      if (decls) {
        const cleanQuery = query.startsWith('@supports') ? query : `@supports ${query}`;
        cssRules.push(`${cleanQuery}{.${className}{${decls}}}`);
      }
    }
  }

  return { cssRules, className };
}

/**
 * Creates a single compiled style rule.
 */
export function style(rule: StyleRule, prefix = 'c'): CompiledStyle {
  const serialized = JSON.stringify(rule);
  const className = `${prefix}-${hash(serialized)}`;
  const { cssRules } = compileStyleRule(rule, className);
  const css = cssRules.join('\n');

  sheet.insertRules(cssRules);

  return {
    className,
    css,
    toString() {
      return this.className;
    },
  };
}

/**
 * StyleX-like style creation map.
 */
export function create<T extends StyleDefinitions>(
  definitions: T,
  prefix = 'c',
): CompiledStyles<T> {
  const result: any = {};
  for (const key of Object.keys(definitions)) {
    result[key] = style(definitions[key]!, `${prefix}-${key}`);
  }
  return result;
}
