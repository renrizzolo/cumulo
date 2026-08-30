'use client';

import { useState, useCallback, useMemo } from 'react';

export interface PartsRegistry<T extends string = string> {
  parts: Partial<Record<T, string>>;
  registerPart: (part: T, id: string) => () => void;
  getPartId: (part: T) => string | undefined;
  hasPart: (part: T) => boolean;
}

/**
 * Reusable dynamic part registration hook for compound components.
 * Coordinates IDs, aria-labelledby, aria-describedby, and aria-controls
 * across arbitrarily nested compound subcomponents.
 */
export function usePartsRegistry<T extends string = string>(): PartsRegistry<T> {
  const [parts, setParts] = useState<Partial<Record<T, string>>>({});

  const registerPart = useCallback((part: T, partId: string) => {
    setParts((prev) => ({
      ...prev,
      [part]: partId,
    }));
    return () => {
      setParts((prev) => {
        const next = { ...prev };
        delete next[part];
        return next;
      });
    };
  }, []);

  const getPartId = useCallback((part: T) => parts[part], [parts]);
  const hasPart = useCallback((part: T) => Boolean(parts[part]), [parts]);

  return useMemo(
    () => ({ parts, registerPart, getPartId, hasPart }),
    [parts, registerPart, getPartId, hasPart],
  );
}
