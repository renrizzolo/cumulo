'use client';

import React from 'react';
import { HStack, ThemeToggle } from '@cumulo/core';

export function ThemeSwitcher(): React.JSX.Element {
  return (
    <HStack gap="xs" align="center">
      <ThemeToggle />
    </HStack>
  );
}
