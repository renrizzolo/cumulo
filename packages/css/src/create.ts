import { hash } from './hash.js';
import { sanitizeConditionKey, toResponsiveLayerName } from './layers.js';
import { attachMeta } from './meta.js';
import { runtimeStyle } from './runtime.js';
import { sheet } from './sheet.js';
import type {
  StyleProperties,
  StyleRule,
  StyleDefinitions,
  StyleOptions,
  CssLayer,
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

function formatValue(prop: string, value: unknown): string {
  if (typeof value === 'number' && value !== 0 && !UNITLESS_PROPERTIES.has(prop)) {
    return `${value}px`;
  }
  return String(value);
}

function serializeProperties(properties: StyleProperties | object): string {
  const declarations: string[] = [];
  const entries = Object.entries(properties);
  for (const [key, val] of entries) {
    if (val !== undefined && val !== null && typeof val !== 'object') {
      declarations.push(`${camelToKebab(key)}:${formatValue(key, val)};`);
    }
  }
  return declarations.join('');
}

/** Wraps each rule in `@layer <layer>{...}` when a layer is specified. */
function wrapLayer(rules: string[], layer?: CssLayer): string[] {
  if (!layer) return rules;
  return rules.map((rule) => `@layer ${layer}{${rule}}`);
}

function normalizeStyleOptions(prefixOrOptions?: string | StyleOptions): {
  prefix: string;
  layer?: CssLayer;
} {
  if (typeof prefixOrOptions === 'string') {
    return { prefix: prefixOrOptions };
  }
  return {
    prefix: prefixOrOptions?.prefix ?? 'c',
    layer: prefixOrOptions?.layer,
  };
}

/**
 * Hash input for a style. Layered rules are salted so they never collide with
 * their unlayered twin, while empty rules (`{}`) and unlayered rules keep their legacy hash.
 */
function hashStyle(serialized: string, layer?: CssLayer): string {
  if (serialized === '{}' || !layer) {
    return hash(serialized);
  }
  return hash(`${layer}\0${serialized}`);
}

export function compileStyleRule(
  rule: StyleRule,
  className: string,
  options?: { layer?: CssLayer },
): { cssRules: string[]; className: string } {
  const cssRules: string[] = [];
  const baseDecls = serializeProperties(rule);
  if (baseDecls) {
    cssRules.push(`.${className}{${baseDecls}}`);
  }

  // Handle pseudo-classes & pseudo-elements directly on rule
  const ruleEntries = Object.entries(rule);
  for (const [key, subRule] of ruleEntries) {
    if (key.startsWith(':') || key.startsWith('&')) {
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

  // Handle @starting-style on base rule
  if (rule['@starting-style']) {
    const startingDecls = serializeProperties(rule['@starting-style']);
    if (startingDecls) {
      cssRules.push(`@starting-style{.${className}{${startingDecls}}}`);
    }
  }

  // Handle selectors map
  if (rule.selectors) {
    for (const [selectorPattern, subProps] of Object.entries(rule.selectors)) {
      const selector = selectorPattern.replace(/&/g, `.${className}`);
      const decls = serializeProperties(subProps);
      if (decls) {
        cssRules.push(`${selector}{${decls}}`);
      }
      if (subProps['@starting-style']) {
        const startingDecls = serializeProperties(subProps['@starting-style']);
        if (startingDecls) {
          cssRules.push(`@starting-style{${selector}{${startingDecls}}}`);
        }
      }
      if (subProps['@media']) {
        for (const [query, mediaProps] of Object.entries(subProps['@media'])) {
          const mediaDecls = serializeProperties(mediaProps);
          if (mediaDecls) {
            const cleanQuery = query.startsWith('@media') ? query : `@media ${query}`;
            cssRules.push(`${cleanQuery}{${selector}{${mediaDecls}}}`);
          }
        }
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

  // Handle @container queries
  if (rule['@container']) {
    for (const [query, containerProps] of Object.entries(rule['@container'])) {
      const decls = serializeProperties(containerProps);
      if (decls) {
        const cleanQuery = query.startsWith('@container') ? query : `@container ${query}`;
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

  return {
    cssRules: wrapLayer(cssRules, options?.layer),
    className,
  };
}

/**
 * Creates a single compiled style rule.
 *
 * @example
 * const styles = style({
 *   fontSize: '2rem',
 * });
 *
 * export function Component() {
 *   return (
 *     <div>
 *       <header className={styles.className}>Header</header>
 *     </div>
 *   );
 * }
 */
export function style(
  rule: StyleRule,
  prefixOrOptions: string | StyleOptions = 'c',
): CompiledStyle {
  const { prefix, layer } = normalizeStyleOptions(prefixOrOptions);
  const serialized = JSON.stringify(rule);
  const className = `${prefix}-${hashStyle(serialized, layer)}`;
  const { cssRules } = compileStyleRule(rule, className, { layer });
  const css = cssRules.join('\n');

  sheet.insertRules(cssRules);

  return attachMeta(Object.assign(runtimeStyle(className), { css }), { kind: 'style', className });
}

/**
 * StyleX-like style creation map.
 * @example
 * const styles = create({
 *   header: {
 *     fontSize: '2rem',
 *   },
 *   footer: {
 *     padding: '10px',
 *   },
 * });
 *
 * export function Component() {
 *   return (
 *     <div>
 *       <header className={styles.header.className}>Header</header>
 *       <footer className={styles.footer.className}>Footer</footer>
 *     </div>
 *   );
 * }
 */
export function create<T extends StyleDefinitions>(
  definitions: T,
  prefixOrOptions: string | StyleOptions = 'c',
): CompiledStyles<T> {
  const { prefix, layer } = normalizeStyleOptions(prefixOrOptions);
  const result = {} as Record<keyof T, CompiledStyle>;
  const entries: Record<string, string> = {};
  for (const key of Object.keys(definitions) as (keyof T)[]) {
    const def = definitions[key];
    if (def) {
      const compiled = style(def, { prefix: `${prefix}-${String(key)}`, layer });
      result[key] = compiled;
      entries[String(key)] = compiled.className;
    }
  }
  return attachMeta(result, { kind: 'create', entries });
}

export interface CompileResponsiveRuleOptions {
  readonly conditionKey: string;
  readonly atRule: string;
  readonly layer?: CssLayer;
  readonly variantName: string;
  readonly optionName: string;
}

/**
 * Compiles a variant `StyleRule` for a specific responsive condition (`@media` / `@container`),
 * hashing purely by `(layer, atRule, rule)` so identical responsive declarations across
 * different recipes share a single class name and CSS rule globally.
 */
export function compileResponsiveStyleRule(
  rule: StyleRule,
  options: CompileResponsiveRuleOptions,
): string {
  const serialized = JSON.stringify(rule);
  if (serialized === '{}') {
    return '';
  }

  const responsiveLayer =
    options.layer === 'components' ? toResponsiveLayerName(options.conditionKey) : options.layer;
  const safeKey = sanitizeConditionKey(options.conditionKey);
  const className = `rv-${safeKey}-${hash(`${responsiveLayer ?? ''}\0${options.atRule}\0${serialized}`)}`;
  const { cssRules } = compileStyleRule(rule, className);

  if (cssRules.length === 0) {
    return '';
  }

  sheet.insertResponsiveRule({
    className,
    conditionKey: options.conditionKey,
    atRule: options.atRule,
    layer: responsiveLayer,
    innerRules: cssRules,
    variantName: options.variantName,
    optionName: options.optionName,
  });

  return className;
}
