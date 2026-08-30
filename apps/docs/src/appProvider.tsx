'use client';

import React from 'react';
import { RouterProvider } from '@renr/parcel-rsc-router';
import { flatRoutes } from '../routes';

export function AppProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  return <RouterProvider routes={flatRoutes}>{children}</RouterProvider>;
}
