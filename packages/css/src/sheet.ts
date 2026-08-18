/**
 * In-memory & DOM stylesheet manager for @cumulo/css.
 */

const STYLE_TAG_ID = 'cumulo-styles';

class StyleSheetManager {
  private rules = new Set<string>();
  private styleElement: HTMLStyleElement | null = null;

  private getStyleElement(): HTMLStyleElement | null {
    if (typeof document === 'undefined') return null;

    if (!this.styleElement) {
      this.styleElement = document.getElementById(STYLE_TAG_ID) as HTMLStyleElement | null;
      if (!this.styleElement) {
        this.styleElement = document.createElement('style');
        this.styleElement.id = STYLE_TAG_ID;
        this.styleElement.setAttribute('data-cumulo', 'true');
        document.head?.appendChild(this.styleElement);
      }
    }
    return this.styleElement;
  }

  insertRule(rule: string): void {
    if (this.rules.has(rule)) return;
    this.rules.add(rule);

    const styleEl = this.getStyleElement();
    if (styleEl) {
      styleEl.appendChild(document.createTextNode(rule + '\n'));
    }
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
    if (this.styleElement && this.styleElement.parentNode) {
      this.styleElement.parentNode.removeChild(this.styleElement);
      this.styleElement = null;
    }
  }
}

export const sheet = new StyleSheetManager();

export function getSheetCss(): string {
  return sheet.getCss();
}

export function resetSheet(): void {
  sheet.clear();
}
