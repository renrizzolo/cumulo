'use client';

import { HStack, ThemeToggle, setDefaultTheme } from '@cumulo/core';
import React from 'react';

setDefaultTheme('docs');

export function ThemeSwitcher(): React.JSX.Element {
  return (
    <HStack gap="xs" align="center">
      <ThemeToggle />
    </HStack>
  );
}
