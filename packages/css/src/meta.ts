import type { RuntimeRecipeConfig } from './runtime.js';

/**
 * Cross-realm symbol key attached as a non-enumerable property to build-time `@cumulo/css`
 * return values so bundler extractors can serialize them to `@cumulo/css/runtime` directly
 * without duck-typing object shapes.
 */
export const CUMULO_META_KEY = /* @__PURE__ */ Symbol.for('__CUMULO_META__');

export type CumuloRuntimeMeta =
  | { readonly kind: 'style'; readonly className: string }
  | { readonly kind: 'create'; readonly entries: Readonly<Record<string, string>> }
  | { readonly kind: 'keyframes'; readonly name: string }
  | {
      readonly kind: 'theme';
      readonly className: string;
      readonly vars: Readonly<Record<string, string>>;
    }
  | { readonly kind: 'global'; readonly vars: Readonly<Record<string, string>> }
  | { readonly kind: 'recipe'; readonly config: RuntimeRecipeConfig }
  | { readonly kind: 'contract' };

/**
 * Attaches non-enumerable build-time serialization metadata to a `@cumulo/css` return value.
 */
export function attachMeta<T extends object>(target: T, meta: CumuloRuntimeMeta): T {
  Object.defineProperty(target, CUMULO_META_KEY, {
    value: meta,
    enumerable: false,
    configurable: true,
  });
  return target;
}
