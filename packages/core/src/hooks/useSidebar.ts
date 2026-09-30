'use client';

import { createContext, use } from 'react';

export type SidebarPosition = 'left' | 'right';
export type SidebarHoverBehavior = 'expand' | 'tooltip' | 'none';

export interface SidebarContextValue {
  /**
   * Whether the sidebar is currently collapsed to icon-only mode.
   */
  collapsed: boolean;
  /**
   * Sets the collapsed state of the sidebar.
   */
  setCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
  /**
   * Toggles the collapsed state between expanded and icon-only.
   */
  toggleCollapsed: () => void;
  /**
   * Sidebar dock position (`'left'` or `'right'`).
   */
  position: SidebarPosition;
  /**
   * Strategy for showing items on hover when collapsed:
   * - `tooltip`: Keeps sidebar collapsed and displays floating tooltips adjacent to items.
   * - `none`: No hover tooltips.
   * - `expand`: Expand the sidebar to full width on hover.
   */
  hoverBehaviour: SidebarHoverBehavior;
  /**
   * Whether hover-expand and focus-within expansion behavior is temporarily suppressed (e.g. immediately after collapse toggle).
   */
  hoverSuppressed?: boolean;
  /**
   * Sets hover suppression state.
   */
  setHoverSuppressed?: (suppressed: boolean) => void;
}

export const SidebarContext = createContext<SidebarContextValue | null>(null);

/**
 * Accesses the active sidebar state and controls.
 */
export function useSidebar(): SidebarContextValue {
  const contextValue = use(SidebarContext);
  if (!contextValue) {
    throw new Error('useSidebar must be used within a SidebarProvider or Sidebar');
  }
  return contextValue;
}
