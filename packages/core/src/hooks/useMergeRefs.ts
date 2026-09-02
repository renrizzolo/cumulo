import { useCallback, type MutableRefObject, type Ref } from 'react';

export type PossibleRef<T> = Ref<T> | MutableRefObject<T | null> | null | undefined;

/**
 * Safely assigns a DOM element or component instance to a React ref.
 * Supports callback refs, object refs, and null/undefined.
 */
export function assignRef<T>(ref: PossibleRef<T>, value: T | null): void {
  if (ref == null) return;

  if (typeof ref === 'function') {
    ref(value);
  } else if (typeof ref === 'object' && 'current' in ref) {
    (ref as MutableRefObject<T | null>).current = value;
  }
}

/**
 * Merges multiple React refs into a single ref callback function.
 */
export function mergeRefs<T>(...refs: PossibleRef<T>[]): (node: T | null) => void {
  return (node: T | null) => {
    for (const ref of refs) {
      assignRef(ref, node);
    }
  };
}

/**
 * React hook that merges multiple refs into a single memoized callback ref.
 *
 * @example
 * ```tsx
 * const internalRef = useRef<HTMLDivElement>(null);
 * const mergedRef = useMergeRefs(internalRef, forwardedRef);
 * return <div ref={mergedRef} />;
 * ```
 */
export function useMergeRefs<T>(...refs: PossibleRef<T>[]): (node: T | null) => void {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback(mergeRefs(...refs), refs);
}
