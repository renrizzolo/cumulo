/**
 * In-memory stylesheet manager for @cumulo/css build-time / static extraction.
 */
class StyleSheetManager {
  private rules = new Set<string>();

  insertRule(rule: string): void {
    if (!rule) return;
    this.rules.add(rule);
  }

  insertRules(rules: string[]): void {
    for (const rule of rules) {
      this.insertRule(rule);
    }
  }

  getCss(): string {
    return Array.from(this.rules).join('\n');
  }

  clear(): void {
    this.rules.clear();
  }
}

function isStyleSheetManager(val: unknown): val is StyleSheetManager {
  return (
    typeof val === 'object' &&
    val !== null &&
    'insertRule' in val &&
    'getCss' in val &&
    'clear' in val &&
    typeof val.insertRule === 'function' &&
    typeof val.getCss === 'function' &&
    typeof val.clear === 'function'
  );
}

const GLOBAL_SHEET_KEY = Symbol.for('__CUMULO_STYLESHEET__');
const existingSheet: unknown = Reflect.get(globalThis, GLOBAL_SHEET_KEY);
const sheetInstance = isStyleSheetManager(existingSheet) ? existingSheet : new StyleSheetManager();

if (!isStyleSheetManager(existingSheet)) {
  Reflect.set(globalThis, GLOBAL_SHEET_KEY, sheetInstance);
}

export const sheet: StyleSheetManager = sheetInstance;

export function getSheetCss(): string {
  return sheet.getCss();
}

export function resetSheet(): void {
  sheet.clear();
}
