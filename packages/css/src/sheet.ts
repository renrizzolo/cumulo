/**
 * In-memory & DOM stylesheet manager for @cumulo/css.
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

const GLOBAL_SHEET_KEY = Symbol.for('__CUMULO_STYLESHEET__');
const globalStore = globalThis as unknown as { [GLOBAL_SHEET_KEY]?: StyleSheetManager };

if (!globalStore[GLOBAL_SHEET_KEY]) {
  globalStore[GLOBAL_SHEET_KEY] = new StyleSheetManager();
}

export const sheet = globalStore[GLOBAL_SHEET_KEY];

export function getSheetCss(): string {
  return sheet.getCss();
}

export function resetSheet(): void {
  sheet.clear();
}
