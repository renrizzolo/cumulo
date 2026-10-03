'use client';

import React, { useMemo, useState } from 'react';
import { SidebarContext, type SidebarContextValue } from '@cumulo/core';

export function SidebarContextWrapper({
  collapsed: initialCollapsed = false,
  position = 'left',
  hoverBehaviour = 'none',
  type = 'push',
  children,
}: Partial<SidebarContextValue> & { children?: React.ReactNode }): React.JSX.Element {
  const [collapsed, setCollapsed] = useState(initialCollapsed);

  const contextValue = useMemo(
    (): SidebarContextValue => ({
      collapsed,
      visuallyCollapsed: collapsed,
      setCollapsed,
      toggleCollapsed: () => setCollapsed((prev) => !prev),
      position,
      hoverBehaviour,
      type,
      hoverSuppressed: false,
      setHoverSuppressed: () => {},
      setHovered: () => {},
      setFocused: () => {},
    }),
    [collapsed, position, hoverBehaviour, type],
  );

  return <SidebarContext value={contextValue}>{children}</SidebarContext>;
}
