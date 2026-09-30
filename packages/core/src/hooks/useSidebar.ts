'use client';

import { createContext, use } from 'react';

export type SidebarVariant = 'docked' | 'inset' | 'floating';
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
   * Layout presentation variant.
   */
  variant: SidebarVariant;
  /**
   * Sidebar dock position.
   */
  position: SidebarPosition;
  /**
   * Whether hover-to-expand is enabled on the sidebar.
   */
  expandOnHover: boolean;
  /**
   * Hover behavior when collapsed.
   */
  collapsedHoverBehavior: SidebarHoverBehavior;
}

const defaultSidebarContext: SidebarContextValue = {
  collapsed: false,
  setCollapsed: () => {},
  toggleCollapsed: () => {},
  variant: 'docked',
  position: 'left',
  expandOnHover: false,
  collapsedHoverBehavior: 'expand',
};

export const SidebarContext = createContext<SidebarContextValue>(defaultSidebarContext);

/**
 * Accesses the active sidebar state and controls.
 */
export function useSidebar(): SidebarContextValue {
  return use(SidebarContext);
}
