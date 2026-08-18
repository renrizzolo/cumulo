import { hash } from './hash.js';
import { sheet } from './sheet.js';
import { camelToKebab } from './create.js';
import type { CSSProperties } from './types.js';

export type KeyframeSteps = {
  [step: string]: CSSProperties;
};

export interface KeyframeAnimation {
  name: string;
  css: string;
  toString(): string;
}

/**
 * Creates type-safe CSS @keyframes animation.
 */
export function keyframes(steps: KeyframeSteps, prefix = 'k'): KeyframeAnimation {
  const stepEntries: string[] = [];

  for (const [step, props] of Object.entries(steps)) {
    const decls: string[] = [];
    for (const [prop, val] of Object.entries(props)) {
      if (val !== undefined && val !== null) {
        decls.push(`${camelToKebab(prop)}:${val};`);
      }
    }
    stepEntries.push(`${step}{${decls.join('')}}`);
  }

  const stepsBody = stepEntries.join('');
  const name = `${prefix}-${hash(stepsBody)}`;
  const css = `@keyframes ${name}{${stepsBody}}`;

  sheet.insertRule(css);

  return {
    name,
    css,
    toString() {
      return this.name;
    },
  };
}
