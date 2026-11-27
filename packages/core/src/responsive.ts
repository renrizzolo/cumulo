import {
  style,
  type CompiledStyle,
  type CSSVariableMap,
  type ResponsiveObject,
  type ResponsiveValue,
  type SelectorStyleRule,
  type StyleProperties,
  type StyleRule,
} from '@cumulo/css';
import type React from 'react';

import { breakpoints, type Breakpoint } from './breakpoints.js';

export type ResponsiveProp<T> = ResponsiveValue<T, Breakpoint>;

const BREAKPOINT_KEYS: readonly Breakpoint[] = ['sm', 'md', 'lg', 'xl', '2xl'];

type CSSVarRef = `var(--${string})`;

function responsiveExpr(varPrefix: `--${string}`, upToIndex: number): CSSVarRef {
  let expr: CSSVarRef = `var(${varPrefix}-init, unset)`;
  for (let i = 0; i <= upToIndex; i++) {
    const bp = BREAKPOINT_KEYS[i];
    if (bp) {
      expr = `var(${varPrefix}-${bp}, ${expr})`;
    }
  }
  return expr;
}

function responsiveRule(
  varPrefix: `--${string}`,
  build: (value: CSSVarRef) => StyleProperties,
  childProp?: `--${string}`,
): StyleRule {
  const media: Record<string, StyleProperties> = {};
  const childMedia: Record<string, StyleProperties> = {};
  for (let i = 0; i < BREAKPOINT_KEYS.length; i++) {
    const bp = BREAKPOINT_KEYS[i];
    if (!bp) continue;
    const expr = responsiveExpr(varPrefix, i);
    media[breakpoints[bp]] = build(expr);
    if (childProp) {
      const entry: StyleProperties = {};
      entry[childProp] = expr;
      childMedia[breakpoints[bp]] = entry;
    }
  }
  const rule: StyleRule = {
    ...build(responsiveExpr(varPrefix, -1)),
    '@media': media,
  };
  if (childProp) {
    const childRule: SelectorStyleRule = { '@media': childMedia };
    childRule[childProp] = responsiveExpr(varPrefix, -1);
    rule.selectors = { '& > *': childRule };
  }
  return rule;
}

// Top-level style() calls so @cumulo/unplugin and @cumulo/parcel-plugin rewrite them to runtimeStyle()
export const respFlex = style(
  responsiveRule('--c-flx', (v) => ({ flex: v })),
  { prefix: 'resp-flex', layer: 'components' },
);
export const respOverflow = style(
  responsiveRule('--c-ovf', (v) => ({ overflow: v })),
  { prefix: 'resp-overflow', layer: 'components' },
);
export const respPadding = style(
  responsiveRule('--c-pad', (v) => ({ padding: v, '--surface-padding': v }), '--parent-padding'),
  { prefix: 'resp-padding', layer: 'components' },
);
export const respRadius = style(
  responsiveRule('--c-rad', (v) => ({ borderRadius: v, '--surface-radius': v }), '--parent-radius'),
  { prefix: 'resp-radius', layer: 'components' },
);
export const respGap = style(
  responsiveRule('--c-gap', (v) => ({ gap: v })),
  { prefix: 'resp-gap', layer: 'components' },
);
export const respDirection = style(
  responsiveRule('--c-dir', (v) => ({ flexDirection: v })),
  { prefix: 'resp-dir', layer: 'components' },
);
export const respAlign = style(
  responsiveRule('--c-aln', (v) => ({ alignItems: v })),
  { prefix: 'resp-align', layer: 'components' },
);
export const respJustify = style(
  responsiveRule('--c-jst', (v) => ({ justifyContent: v })),
  { prefix: 'resp-justify', layer: 'components' },
);
export const respJustifyItems = style(
  responsiveRule('--c-jsi', (v) => ({ justifyItems: v })),
  { prefix: 'resp-justify-items', layer: 'components' },
);
export const respWrap = style(
  responsiveRule('--c-wrp', (v) => ({ flexWrap: v })),
  { prefix: 'resp-wrap', layer: 'components' },
);
export const respColumns = style(
  responsiveRule('--c-col', (v) => ({ gridTemplateColumns: v })),
  { prefix: 'resp-cols', layer: 'components' },
);
export const respColSpan = style(
  responsiveRule('--c-csp', (v) => ({ gridColumn: v })),
  { prefix: 'resp-col-span', layer: 'components' },
);
export const respRowSpan = style(
  responsiveRule('--c-rsp', (v) => ({ gridRow: v })),
  { prefix: 'resp-row-span', layer: 'components' },
);
export const respMaxWidth = style(
  responsiveRule('--c-mw', (v) => ({ maxWidth: v })),
  { prefix: 'resp-max-width', layer: 'components' },
);
export const respPaddingInline = style(
  responsiveRule('--c-pi', (v) => ({ paddingInline: v })),
  { prefix: 'resp-padding-inline', layer: 'components' },
);

export function isResponsiveMap<T>(
  value: ResponsiveProp<T> | undefined,
): value is ResponsiveObject<T, Breakpoint> {
  return typeof value === 'object' && value !== null;
}

export interface ResolvedResponsive<K> {
  staticValue: K | undefined;
  className: string | undefined;
  vars: CSSVariableMap | undefined;
}

/**
 * Splits a responsive-capable prop into either:
 * - its static value (passed to the component's `recipe()`), with zero inline styles, OR
 * - its responsive class name + inline CSS custom properties when an object `{ initial?, sm?, ... }` is passed.
 */
export function splitResponsive<K extends string | number>(
  value: ResponsiveProp<K> | undefined,
  valueMap: Readonly<Record<K, string>>,
  varPrefix: `--${string}`,
  respClass: CompiledStyle,
  fallbackInitial?: K,
): ResolvedResponsive<K> {
  if (!isResponsiveMap(value)) {
    return {
      staticValue: value ?? fallbackInitial,
      className: undefined,
      vars: undefined,
    };
  }

  const cssVars: CSSVariableMap = {};
  const initVal = value.initial ?? fallbackInitial;
  if (initVal !== undefined) {
    cssVars[`${varPrefix}-init`] = valueMap[initVal];
  }
  for (const bp of BREAKPOINT_KEYS) {
    const bpVal = value[bp];
    if (bpVal !== undefined) {
      cssVars[`${varPrefix}-${bp}`] = valueMap[bpVal];
    }
  }

  return {
    staticValue: undefined,
    className: respClass.className,
    vars: cssVars,
  };
}

/**
 * Merges one or more responsive CSS variable maps with an optional user `style` prop.
 * Returns `userStyle` untouched when no responsive variables are present.
 */
export function mergeResponsiveStyles(
  userStyle: React.CSSProperties | undefined,
  ...varMaps: (CSSVariableMap | undefined)[]
): React.CSSProperties | undefined {
  let merged: (CSSVariableMap & React.CSSProperties) | undefined;
  for (const map of varMaps) {
    if (map) {
      merged = merged ? { ...merged, ...map } : { ...map };
    }
  }
  if (!merged) return userStyle;
  return userStyle ? { ...merged, ...userStyle } : merged;
}
