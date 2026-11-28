import { toResponsiveLayerName } from './layers.js';

export interface ResponsiveRuleUsage {
  readonly variantName: string;
  readonly optionName: string;
}

export interface ResponsiveRuleEntry {
  readonly className: string;
  readonly conditionKey: string;
  readonly atRule: string;
  readonly layer?: string;
  readonly innerRules: readonly string[];
  readonly usages: readonly ResponsiveRuleUsage[];
}

export interface InsertResponsiveRuleInput {
  readonly className: string;
  readonly conditionKey: string;
  readonly atRule: string;
  readonly layer?: string;
  readonly innerRules: readonly string[];
  readonly variantName: string;
  readonly optionName: string;
}

interface MutableResponsiveRuleEntry {
  readonly className: string;
  readonly conditionKey: string;
  readonly atRule: string;
  readonly layer?: string;
  readonly innerRules: readonly string[];
  readonly usages: ResponsiveRuleUsage[];
  readonly usageKeys: Set<string>;
}

/**
 * Formats a list of responsive rule entries into compact, grouped CSS with a deterministic
 * responsive sub-layer order header (when `responsive.bp-*` layers are present).
 *
 * Rules sharing the same `(layer, atRule)` are coalesced into a single `@media`/`@container`
 * block, ordered by `conditionOrder` (ascending breakpoint order) so larger breakpoints always
 * beat smaller breakpoints.
 */
export function formatResponsiveCss(
  entries: readonly ResponsiveRuleEntry[],
  conditionOrder?: readonly string[],
): string {
  if (entries.length === 0) {
    return '';
  }

  const orderIndex = new Map<string, number>();
  if (conditionOrder) {
    conditionOrder.forEach((key, idx) => {
      if (!orderIndex.has(key)) {
        orderIndex.set(key, idx);
      }
    });
  }

  // Assign stable fallback indices for any condition keys not in conditionOrder
  for (const entry of entries) {
    if (!orderIndex.has(entry.conditionKey)) {
      orderIndex.set(entry.conditionKey, orderIndex.size);
    }
  }

  const sortedEntries = entries.toSorted((a, b) => {
    const aIdx = orderIndex.get(a.conditionKey) ?? 0;
    const bIdx = orderIndex.get(b.conditionKey) ?? 0;
    return aIdx - bIdx;
  });

  // Collect ordered `responsive.bp-*` sub-layers actually present in the output
  const orderedResponsiveSubLayers: string[] = [];
  const seenSubLayers = new Set<string>();
  for (const entry of sortedEntries) {
    if (entry.layer?.startsWith('responsive.')) {
      if (!seenSubLayers.has(entry.layer)) {
        seenSubLayers.add(entry.layer);
        orderedResponsiveSubLayers.push(entry.layer);
      }
    }
  }

  // Also include full declared conditionOrder sub-layers if any responsive sub-layer is present,
  // so separate CSS chunks still declare identical ascending sub-layer priority.
  const subLayerOrderList: string[] = [];
  if (orderedResponsiveSubLayers.length > 0) {
    const added = new Set<string>();
    if (conditionOrder) {
      for (const key of conditionOrder) {
        const layerName = toResponsiveLayerName(key);
        if (!added.has(layerName)) {
          added.add(layerName);
          subLayerOrderList.push(layerName);
        }
      }
    }
    for (const layerName of orderedResponsiveSubLayers) {
      if (!added.has(layerName)) {
        added.add(layerName);
        subLayerOrderList.push(layerName);
      }
    }
  }

  // Group inner CSS rules by (layer, atRule) while preserving sorted condition order
  interface Group {
    readonly layer?: string;
    readonly atRule: string;
    readonly innerRules: string[];
    readonly seenInner: Set<string>;
  }

  const groups: Group[] = [];
  const groupMap = new Map<string, Group>();

  for (const entry of sortedEntries) {
    const groupKey = `${entry.layer ?? ''}\0${entry.atRule}`;
    let group = groupMap.get(groupKey);
    if (!group) {
      group = {
        layer: entry.layer,
        atRule: entry.atRule,
        innerRules: [],
        seenInner: new Set<string>(),
      };
      groupMap.set(groupKey, group);
      groups.push(group);
    }
    for (const inner of entry.innerRules) {
      if (!group.seenInner.has(inner)) {
        group.seenInner.add(inner);
        group.innerRules.push(inner);
      }
    }
  }

  const outputLines: string[] = [];
  if (subLayerOrderList.length > 0) {
    outputLines.push(`@layer ${subLayerOrderList.join(', ')};`);
  }

  for (const group of groups) {
    if (group.innerRules.length === 0) {
      continue;
    }
    const atBlock = `${group.atRule}{${group.innerRules.join('')}}`;
    outputLines.push(group.layer ? `@layer ${group.layer}{${atBlock}}` : atBlock);
  }

  return outputLines.join('\n');
}

/**
 * In-memory stylesheet manager for @cumulo/css build-time / static extraction.
 */
class StyleSheetManager {
  private rules = new Set<string>();
  private responsiveRules = new Map<string, MutableResponsiveRuleEntry>();
  private conditionOrder: string[] = [];
  private conditionOrderSet = new Set<string>();

  insertRule(rule: string): void {
    if (!rule) return;
    this.rules.add(rule);
  }

  insertRules(rules: string[]): void {
    for (const rule of rules) {
      this.insertRule(rule);
    }
  }

  registerConditionOrder(conditionKeys: readonly string[]): void {
    for (const key of conditionKeys) {
      if (!this.conditionOrderSet.has(key)) {
        this.conditionOrderSet.add(key);
        this.conditionOrder.push(key);
      }
    }
  }

  insertResponsiveRule(input: InsertResponsiveRuleInput): void {
    if (input.innerRules.length === 0) return;

    if (!this.conditionOrderSet.has(input.conditionKey)) {
      this.conditionOrderSet.add(input.conditionKey);
      this.conditionOrder.push(input.conditionKey);
    }

    const usageKey = `${input.variantName}\0${input.optionName}`;
    const existing = this.responsiveRules.get(input.className);
    if (existing) {
      if (!existing.usageKeys.has(usageKey)) {
        existing.usageKeys.add(usageKey);
        existing.usages.push({
          variantName: input.variantName,
          optionName: input.optionName,
        });
      }
      return;
    }

    this.responsiveRules.set(input.className, {
      className: input.className,
      conditionKey: input.conditionKey,
      atRule: input.atRule,
      layer: input.layer,
      innerRules: [...input.innerRules],
      usages: [{ variantName: input.variantName, optionName: input.optionName }],
      usageKeys: new Set([usageKey]),
    });
  }

  getBaseCss(): string {
    return Array.from(this.rules).join('\n');
  }

  getResponsiveRules(): ResponsiveRuleEntry[] {
    return Array.from(this.responsiveRules.values(), (entry): ResponsiveRuleEntry => ({
      className: entry.className,
      conditionKey: entry.conditionKey,
      atRule: entry.atRule,
      ...(entry.layer !== undefined ? { layer: entry.layer } : {}),
      innerRules: entry.innerRules,
      usages: entry.usages,
    }));
  }

  getConditionOrder(): readonly string[] {
    return this.conditionOrder;
  }

  getCss(): string {
    const baseCss = this.getBaseCss();
    const responsiveCss = formatResponsiveCss(this.getResponsiveRules(), this.conditionOrder);
    if (baseCss && responsiveCss) {
      return `${baseCss}\n${responsiveCss}`;
    }
    return baseCss || responsiveCss;
  }

  clear(): void {
    this.rules.clear();
    this.responsiveRules.clear();
    this.conditionOrder = [];
    this.conditionOrderSet.clear();
  }
}

const GLOBAL_SHEET_KEY = Symbol.for('__CUMULO_STYLESHEET__');

function isStyleSheetManager(value: unknown): value is StyleSheetManager {
  return (
    typeof value === 'object' &&
    value !== null &&
    'insertRule' in value &&
    typeof value.insertRule === 'function' &&
    'insertResponsiveRule' in value &&
    typeof value.insertResponsiveRule === 'function' &&
    'getCss' in value &&
    typeof value.getCss === 'function' &&
    'clear' in value &&
    typeof value.clear === 'function'
  );
}

function getOrCreateSheet(): StyleSheetManager {
  const existing: unknown = Reflect.get(globalThis, GLOBAL_SHEET_KEY);
  if (isStyleSheetManager(existing)) {
    return existing;
  }
  const manager = new StyleSheetManager();
  Reflect.set(globalThis, GLOBAL_SHEET_KEY, manager);
  return manager;
}

export const sheet = getOrCreateSheet();

export function getSheetCss(): string {
  return sheet.getCss();
}

export function getBaseCss(): string {
  return sheet.getBaseCss();
}

export function getResponsiveRules(): ResponsiveRuleEntry[] {
  return sheet.getResponsiveRules();
}

export function resetSheet(): void {
  sheet.clear();
}
