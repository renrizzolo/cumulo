'use client';

import React, { createContext, use, useCallback, useEffect, useMemo, useState } from 'react';
import { useDismissible } from '@cumulo/core';

export interface MobileNavContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

const MobileNavContext = createContext<MobileNavContextValue | null>(null);

export function MobileNavProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback((): void => {
    setIsOpen(true);
  }, []);

  const close = useCallback((): void => {
    setIsOpen(false);
  }, []);

  const toggle = useCallback((): void => {
    setIsOpen((prev) => !prev);
  }, []);

  // Close mobile drawer when resizing across desktop breakpoint
  useEffect(() => {
    const mql = window.matchMedia('(min-width: 960px)');
    const handleViewportChange = (e: MediaQueryListEvent): void => {
      if (e.matches) {
        close();
      }
    };

    mql.addEventListener('change', handleViewportChange);
    return () => mql.removeEventListener('change', handleViewportChange);
  }, [close]);

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  useDismissible({
    onDismiss: () => {
      if (isOpen) {
        close();
      }
    },
    dismissOnClickOutside: false,
  });

  const contextValue = useMemo(
    (): MobileNavContextValue => ({
      isOpen,
      open,
      close,
      toggle,
    }),
    [isOpen, open, close, toggle],
  );

  return <MobileNavContext value={contextValue}>{children}</MobileNavContext>;
}

export function useMobileNav(): MobileNavContextValue {
  const context = use(MobileNavContext);
  if (!context) {
    throw new Error('useMobileNav must be used within a MobileNavProvider');
  }
  return context;
}
