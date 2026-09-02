import '@testing-library/jest-dom/vitest';
import React, { useRef } from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { useMergeRefs, mergeRefs, assignRef } from './useMergeRefs.js';

afterEach(() => {
  cleanup();
});

describe('assignRef', () => {
  it('assigns to callback refs', () => {
    const callbackRef = vi.fn();
    const element = document.createElement('div');

    assignRef(callbackRef, element);
    expect(callbackRef).toHaveBeenCalledWith(element);
  });

  it('assigns to object refs', () => {
    const objectRef = { current: null as HTMLDivElement | null };
    const element = document.createElement('div');

    assignRef(objectRef, element);
    expect(objectRef.current).toBe(element);
  });

  it('handles null and undefined refs safely', () => {
    const element = document.createElement('div');
    expect(() => assignRef(null, element)).not.toThrow();
    expect(() => assignRef(undefined, element)).not.toThrow();
  });
});

describe('mergeRefs', () => {
  it('merges callback and object refs into one function', () => {
    const callbackRef = vi.fn();
    const objectRef = { current: null as HTMLDivElement | null };
    const merged = mergeRefs(callbackRef, objectRef);

    const element = document.createElement('div');
    merged(element);

    expect(callbackRef).toHaveBeenCalledWith(element);
    expect(objectRef.current).toBe(element);
  });
});

describe('useMergeRefs', () => {
  it('attaches DOM node to multiple refs simultaneously in a React component', () => {
    const callbackRef = vi.fn();
    let externalRefCurrent: HTMLDivElement | null = null;

    function TestComponent({ forwardedRef }: { forwardedRef: React.Ref<HTMLDivElement> }) {
      const internalRef = useRef<HTMLDivElement>(null);
      const mergedRef = useMergeRefs(internalRef, forwardedRef);

      return (
        <div ref={mergedRef} data-testid="merge-target">
          Content
        </div>
      );
    }

    const { getByTestId } = render(
      <TestComponent
        forwardedRef={(node) => {
          callbackRef(node);
          externalRefCurrent = node;
        }}
      />,
    );

    const el = getByTestId('merge-target');
    expect(callbackRef).toHaveBeenCalledWith(el);
    expect(externalRefCurrent).toBe(el);
  });
});
