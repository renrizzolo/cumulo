import type { ResponsiveRuleEntry } from '@cumulo/css';
import { parseSync } from 'oxc-parser';

import type { CumuloResponsiveSafelist } from '../types.js';

interface AstNode {
  type: string;
  start: number;
  end: number;
  [key: string]: unknown;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isAstNode(value: unknown): value is AstNode {
  return (
    isRecord(value) &&
    typeof value.type === 'string' &&
    typeof value.start === 'number' &&
    typeof value.end === 'number'
  );
}

function getPropertyKeyName(prop: AstNode): string | undefined {
  if (prop.computed === true) {
    return undefined;
  }
  const key = prop.key;
  if (!isAstNode(key)) {
    return undefined;
  }
  if (key.type === 'Identifier' && typeof key.name === 'string') {
    return key.name;
  }
  if (key.type === 'Literal' && (typeof key.value === 'string' || typeof key.value === 'number')) {
    return String(key.value);
  }
  return undefined;
}

function unwrapExpr(node: unknown): AstNode | undefined {
  let current: unknown = node;
  while (isAstNode(current)) {
    if (
      current.type === 'ParenthesizedExpression' ||
      current.type === 'TSAsExpression' ||
      current.type === 'TSSatisfiesExpression' ||
      current.type === 'TSNonNullExpression'
    ) {
      current = current.expression;
      continue;
    }
    return current;
  }
  return undefined;
}

type ExtractedValueResult =
  | { readonly kind: 'ignore' }
  | { readonly kind: 'literals'; readonly values: readonly string[] }
  | { readonly kind: 'dynamic' };

/**
 * Extracts static scalar variant values (`string | number | boolean`) from an AST expression.
 * Non-scalar literals like nested objects/arrays/functions are ignored (so style definition
 * objects such as `variants: { gap: { md: { gap: ... } } }` never falsely trigger wildcards).
 */
function extractResponsiveScalarValues(node: unknown): ExtractedValueResult {
  const expr = unwrapExpr(node);
  if (!expr) {
    return { kind: 'ignore' };
  }

  switch (expr.type) {
    case 'ObjectExpression':
    case 'ArrayExpression':
    case 'FunctionExpression':
    case 'ArrowFunctionExpression':
    case 'ClassExpression':
    case 'JSXElement':
    case 'JSXFragment':
      return { kind: 'ignore' };

    case 'Literal': {
      const val = expr.value;
      if (val === null) {
        return { kind: 'ignore' };
      }
      if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
        return { kind: 'literals', values: [String(val)] };
      }
      return { kind: 'ignore' };
    }

    case 'Identifier':
      if (expr.name === 'undefined') {
        return { kind: 'ignore' };
      }
      return { kind: 'dynamic' };

    case 'TemplateLiteral':
      if (
        Array.isArray(expr.expressions) &&
        expr.expressions.length === 0 &&
        Array.isArray(expr.quasis) &&
        expr.quasis.length === 1 &&
        isRecord(expr.quasis[0]) &&
        isRecord(expr.quasis[0].value) &&
        typeof expr.quasis[0].value.cooked === 'string'
      ) {
        return { kind: 'literals', values: [expr.quasis[0].value.cooked] };
      }
      return { kind: 'dynamic' };

    case 'ConditionalExpression': {
      const consequent = extractResponsiveScalarValues(expr.consequent);
      const alternate = extractResponsiveScalarValues(expr.alternate);
      if (consequent.kind === 'dynamic' || alternate.kind === 'dynamic') {
        return { kind: 'dynamic' };
      }
      const values: string[] = [];
      if (consequent.kind === 'literals') values.push(...consequent.values);
      if (alternate.kind === 'literals') values.push(...alternate.values);
      return values.length > 0 ? { kind: 'literals', values } : { kind: 'ignore' };
    }

    case 'LogicalExpression': {
      const left = extractResponsiveScalarValues(expr.left);
      const right = extractResponsiveScalarValues(expr.right);
      if (expr.operator === '&&') {
        return right;
      }
      if (left.kind === 'dynamic' || right.kind === 'dynamic') {
        return { kind: 'dynamic' };
      }
      const values: string[] = [];
      if (left.kind === 'literals') values.push(...left.values);
      if (right.kind === 'literals') values.push(...right.values);
      return values.length > 0 ? { kind: 'literals', values } : { kind: 'ignore' };
    }

    default:
      return { kind: 'dynamic' };
  }
}

export interface ResponsiveUsageTracker {
  scanSource(code: string, filePath: string): void;
  isRuleUsed(entry: ResponsiveRuleEntry, safelist?: CumuloResponsiveSafelist): boolean;
  readonly wildcardAll: boolean;
}

/**
 * Creates a conservative whole-project AST usage tracker for responsive recipe variants.
 *
 * Scans object expressions across project source files:
 * - Literal scalar values (`{ initial: 'column', md: 'row' }`) mark only `(md, 'row')` as used.
 * - Dynamic scalar expressions (`{ md: dynamicDirection }`) conservatively keep all options for `md`.
 * - Spread or computed keys inside responsive-shaped objects conservatively disable pruning.
 */
export function createResponsiveUsageTracker(
  knownBreakpointKeys: Iterable<string>,
): ResponsiveUsageTracker {
  const knownKeys = new Set<string>(knownBreakpointKeys);
  const usedValuesByKey = new Map<string, Set<string>>();
  const wildcardKeys = new Set<string>();
  let wildcardAll = false;

  const recordValue = (key: string, value: string): void => {
    let set = usedValuesByKey.get(key);
    if (!set) {
      set = new Set<string>();
      usedValuesByKey.set(key, set);
    }
    set.add(value);
  };

  const walk = (node: unknown): void => {
    if (!node || typeof node !== 'object') {
      return;
    }
    if (Array.isArray(node)) {
      for (const item of node) {
        walk(item);
      }
      return;
    }
    if (!isAstNode(node)) {
      return;
    }

    if (node.type === 'ImportDeclaration' || node.type.startsWith('TS')) {
      if (
        node.type === 'TSAsExpression' ||
        node.type === 'TSSatisfiesExpression' ||
        node.type === 'TSNonNullExpression'
      ) {
        walk(node.expression);
      }
      return;
    }

    if (node.type === 'ObjectExpression' && Array.isArray(node.properties)) {
      const props = node.properties;
      let hasResponsiveShape = false;
      let hasDynamicKeyOrSpread = false;

      if (props.length > 0 && props.length <= 20) {
        for (const prop of props) {
          if (!isAstNode(prop)) continue;
          if (prop.type === 'SpreadElement') {
            hasDynamicKeyOrSpread = true;
            continue;
          }
          if (prop.type === 'Property' || prop.type === 'ObjectProperty') {
            if (prop.computed === true) {
              hasDynamicKeyOrSpread = true;
              continue;
            }
            const keyName = getPropertyKeyName(prop);
            if (keyName === 'initial' || (keyName !== undefined && knownKeys.has(keyName))) {
              hasResponsiveShape = true;
            }
          }
        }

        if (hasResponsiveShape && hasDynamicKeyOrSpread) {
          wildcardAll = true;
        }

        for (const prop of props) {
          if (!isAstNode(prop)) continue;
          if (prop.type !== 'Property' && prop.type !== 'ObjectProperty') continue;
          const keyName = getPropertyKeyName(prop);
          if (!keyName || keyName === 'initial') continue;

          const extracted = extractResponsiveScalarValues(prop.value);
          if (extracted.kind === 'literals') {
            for (const val of extracted.values) {
              recordValue(keyName, val);
            }
          } else if (extracted.kind === 'dynamic') {
            wildcardKeys.add(keyName);
          }
        }
      }
    }

    for (const [key, value] of Object.entries(node)) {
      if (key === 'type' || key === 'start' || key === 'end') {
        continue;
      }
      walk(value);
    }
  };

  return {
    get wildcardAll(): boolean {
      return wildcardAll;
    },

    scanSource(code: string, filePath: string): void {
      if (wildcardAll || !code.includes('{')) {
        return;
      }
      let parsed: ReturnType<typeof parseSync>;
      try {
        parsed = parseSync(filePath, code);
      } catch {
        return;
      }
      if (parsed.errors.length > 0) {
        return;
      }
      walk(parsed.program);
    },

    isRuleUsed(entry: ResponsiveRuleEntry, safelist?: CumuloResponsiveSafelist): boolean {
      if (wildcardAll) {
        return true;
      }
      if (safelist?.breakpoints?.includes(entry.conditionKey)) {
        return true;
      }
      if (
        safelist?.variants &&
        entry.usages.some((u) => safelist.variants?.includes(u.variantName))
      ) {
        return true;
      }
      if (wildcardKeys.has(entry.conditionKey)) {
        return true;
      }
      const values = usedValuesByKey.get(entry.conditionKey);
      if (!values || values.size === 0) {
        return false;
      }
      return entry.usages.some((u) => values.has(u.optionName));
    },
  };
}

function isCssIdentChar(ch: string | undefined): boolean {
  if (!ch) return false;
  const code = ch.charCodeAt(0);
  return (
    (code >= 48 && code <= 57) || // 0-9
    (code >= 65 && code <= 90) || // A-Z
    (code >= 97 && code <= 122) || // a-z
    code === 45 || // -
    code === 95 // _
  );
}

function selectorContainsAnyClass(selector: string, deadClasses: ReadonlySet<string>): boolean {
  for (let i = 0; i < selector.length; i++) {
    if (selector[i] !== '.') continue;
    let end = i + 1;
    while (end < selector.length && isCssIdentChar(selector[end])) {
      end++;
    }
    if (end > i + 1) {
      const cls = selector.slice(i + 1, end);
      if (deadClasses.has(cls)) {
        return true;
      }
    }
    i = end - 1;
  }
  return false;
}

const CONTAINER_AT_RULE_RE = /^@(?:layer|media|container|supports)\b/;

/**
 * Strips rules matching any class name in `deadClasses` from a CSS string (minified or unminified)
 * using a balanced-brace scanner, and drops any `@media`, `@container`, `@supports`, or `@layer`
 * wrapper blocks that become empty as a result.
 */
export function pruneDeadResponsiveClasses(css: string, deadClasses: ReadonlySet<string>): string {
  if (!css || deadClasses.size === 0) {
    return css;
  }

  let hasAnyCandidate = false;
  for (const cls of deadClasses) {
    if (css.includes(`.${cls}`)) {
      hasAnyCandidate = true;
      break;
    }
  }
  if (!hasAnyCandidate) {
    return css;
  }

  const pruneSegment = (src: string): string => {
    const out: string[] = [];
    let i = 0;
    const len = src.length;

    while (i < len) {
      const wsStart = i;
      while (i < len && /\s/.test(src[i] ?? '')) {
        i++;
      }
      if (i >= len) {
        out.push(src.slice(wsStart));
        break;
      }

      // Preserve CSS comments verbatim
      if (src[i] === '/' && src[i + 1] === '*') {
        const endComment = src.indexOf('*/', i + 2);
        const end = endComment === -1 ? len : endComment + 2;
        out.push(src.slice(wsStart, end));
        i = end;
        continue;
      }

      // Scan prelude up to '{' or ';' (respecting strings and comments)
      const preludeStart = i;
      let quote: string | null = null;
      while (i < len) {
        const ch = src[i];
        if (quote) {
          if (ch === '\\') {
            i += 2;
            continue;
          }
          if (ch === quote) {
            quote = null;
          }
          i++;
          continue;
        }
        if (ch === '"' || ch === "'") {
          quote = ch;
          i++;
          continue;
        }
        if (ch === '/' && src[i + 1] === '*') {
          const endComment = src.indexOf('*/', i + 2);
          i = endComment === -1 ? len : endComment + 2;
          continue;
        }
        if (ch === ';' || ch === '{') {
          break;
        }
        i++;
      }

      if (i >= len) {
        out.push(src.slice(wsStart));
        break;
      }

      // Statement ending with ';' (e.g. @layer order declaration, @import)
      if (src[i] === ';') {
        out.push(src.slice(wsStart, i + 1));
        i++;
        continue;
      }

      // Block starting with '{'
      const prelude = src.slice(preludeStart, i).trim();
      const bodyStart = i + 1;
      let depth = 1;
      i = bodyStart;
      quote = null;

      while (i < len && depth > 0) {
        const ch = src[i];
        if (quote) {
          if (ch === '\\') {
            i += 2;
            continue;
          }
          if (ch === quote) {
            quote = null;
          }
          i++;
          continue;
        }
        if (ch === '"' || ch === "'") {
          quote = ch;
          i++;
          continue;
        }
        if (ch === '/' && src[i + 1] === '*') {
          const endComment = src.indexOf('*/', i + 2);
          i = endComment === -1 ? len : endComment + 2;
          continue;
        }
        if (ch === '{') {
          depth++;
        } else if (ch === '}') {
          depth--;
        }
        i++;
      }

      const bodyEnd = i - 1;
      const body = src.slice(bodyStart, bodyEnd);

      if (CONTAINER_AT_RULE_RE.test(prelude)) {
        const prunedBody = pruneSegment(body);
        if (prunedBody.trim().length > 0) {
          out.push(src.slice(wsStart, bodyStart));
          out.push(prunedBody);
          out.push('}');
        }
      } else if (!prelude.startsWith('@') && selectorContainsAnyClass(prelude, deadClasses)) {
        // Drop dead responsive style rule
      } else {
        out.push(src.slice(wsStart, i));
      }
    }

    return out.join('');
  };

  return pruneSegment(css);
}
