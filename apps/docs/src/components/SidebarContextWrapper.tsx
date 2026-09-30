'use client';

import React, { useMemo, useState } from 'react';
import { SidebarContext, type SidebarContextValue } from '@cumulo/core';

export function SidebarContextWrapper({
  collapsed: initialCollapsed = false,
  position = 'left',
  hoverBehaviour = 'none',
  children,
}: Partial<SidebarContextValue> & { children?: React.ReactNode }): React.JSX.Element {
  const [collapsed, setCollapsed] = useState(initialCollapsed);

  const contextValue = useMemo(
    (): SidebarContextValue => ({
      collapsed,
      setCollapsed,
      toggleCollapsed: () => setCollapsed((prev) => !prev),
      position,
      hoverBehaviour,
    }),
    [collapsed, position, hoverBehaviour],
  );

  return <SidebarContext value={contextValue}>{children}</SidebarContext>;
}
