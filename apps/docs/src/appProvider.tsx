'use client';

import { RouterProvider } from '@renr/parcel-rsc-router';
import React from 'react';

import { flatRoutes } from '../routes';

export function AppProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  return <RouterProvider routes={flatRoutes}>{children}</RouterProvider>;
}
