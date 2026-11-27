import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { LAYER_ORDER_STATEMENT, getSheetCss } from '@cumulo/css';
import { describe, expect, it } from 'vitest';

import '../src/index.js';

/** Splits compiled CSS into its top-level rules by tracking brace depth. */
function topLevelRules(css: string): string[] {
  const rules: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < css.length; i++) {
    if (css[i] === '{') depth++;
    if (css[i] === '}' && --depth === 0) {
      rules.push(css.slice(start, i + 1).trim());
      start = i + 1;
    }
  }
  return rules.filter(Boolean);
}

describe('cascade layers', () => {
  it('declares the same layer order in theme.css as @cumulo/css', () => {
    const themeCss = fs.readFileSync(
      path.join(path.dirname(fileURLToPath(import.meta.url)), '../src/theme.css'),
      'utf-8',
    );
    expect(themeCss.startsWith(LAYER_ORDER_STATEMENT)).toBe(true);
  });

  it('places every compiled core style inside a cascade layer', () => {
    const unlayered = topLevelRules(getSheetCss()).filter(
      // @keyframes cannot live in a layer-scoped override, so they are intentionally global
      (rule) => !rule.startsWith('@layer ') && !rule.startsWith('@keyframes '),
    );
    expect(unlayered.map((rule) => rule.slice(0, 80))).toEqual([]);
  });
});
